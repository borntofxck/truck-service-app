import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "crypto";
import { cookies } from "next/headers";
import { promisify } from "util";
import { prisma } from "@/lib/prisma";

const scrypt = promisify(scryptCallback);

export const ADMIN_SESSION_COOKIE = "truck_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

export type AdminSession = {
  adminId: number;
  login: string;
  role: string;
};

type SessionPayload = AdminSession & {
  exp: number;
};

function getSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "truck-service-local-dev-secret"
  );
}

function toBase64Url(value: Buffer | string) {
  return Buffer.from(value)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function fromBase64Url(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);

  return Buffer.from(base64 + padding, "base64").toString("utf8");
}

async function signPayload(payload: string) {
  const key = Buffer.from(getSessionSecret());
  const hash = (await scrypt(payload, key, 32)) as Buffer;

  return toBase64Url(hash);
}

async function createSessionToken(payload: SessionPayload) {
  const body = toBase64Url(JSON.stringify(payload));
  const signature = await signPayload(body);

  return `${body}.${signature}`;
}

async function parseSessionToken(token: string) {
  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expectedSignature = await signPayload(body);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(body)) as SessionPayload;

    if (!payload.adminId || !payload.login || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  const salt = toBase64Url(randomBytes(16));
  const key = (await scrypt(password, salt, 64)) as Buffer;

  return `scrypt$${salt}$${toBase64Url(key)}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  if (!passwordHash.startsWith("scrypt$")) {
    return password === passwordHash;
  }

  const [, salt, expectedHash] = passwordHash.split("$");

  if (!salt || !expectedHash) {
    return false;
  }

  const key = (await scrypt(password, salt, 64)) as Buffer;
  const provided = Buffer.from(toBase64Url(key));
  const expected = Buffer.from(expectedHash);

  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export function validateAdminCredentials(login: string, password: string) {
  const errors: string[] = [];

  if (login.trim().length < 3) {
    errors.push("Логин должен быть не короче 3 символов");
  }

  if (password.length < 8) {
    errors.push("Пароль должен быть не короче 8 символов");
  }

  if (!/[a-zа-яё]/i.test(password) || !/\d/.test(password)) {
    errors.push("Пароль должен содержать буквы и цифры");
  }

  return errors;
}

export async function ensureEnvAdmin() {
  const adminsCount = await prisma.admin.count();

  if (adminsCount > 0) {
    return;
  }

  const login = process.env.ADMIN_LOGIN?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!login || !password) {
    return;
  }

  await prisma.admin.create({
    data: {
      login,
      passwordHash: await hashPassword(password),
      role: "owner",
    },
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const payload = await parseSessionToken(token);

  if (!payload) {
    return null;
  }

  const admin = await prisma.admin.findUnique({
    where: {
      id: payload.adminId,
    },
    select: {
      id: true,
      login: true,
      role: true,
    },
  });

  if (!admin) {
    return null;
  }

  return {
    adminId: admin.id,
    login: admin.login,
    role: admin.role,
  };
}

export async function setAdminSession(admin: AdminSession) {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const token = await createSessionToken({
    ...admin,
    exp: expiresAt,
  });

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function getAdminBootstrapState() {
  await ensureEnvAdmin();

  const adminsCount = await prisma.admin.count();

  return {
    hasAdmins: adminsCount > 0,
  };
}

export async function requireAdminApi() {
  const session = await getAdminSession();

  if (!session) {
    return Response.json(
      { error: "Требуется вход администратора" },
      { status: 401 },
    );
  }

  return null;
}
