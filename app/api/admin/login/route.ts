import { NextResponse } from "next/server";
import {
  ensureEnvAdmin,
  hashPassword,
  setAdminSession,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type LoginPayload = {
  login?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as LoginPayload | null;
  const login = typeof payload?.login === "string" ? payload.login.trim() : "";
  const password = typeof payload?.password === "string" ? payload.password : "";

  if (!login || !password) {
    return NextResponse.json(
      { error: "Введите логин и пароль" },
      { status: 400 },
    );
  }

  await ensureEnvAdmin();

  const admin = await prisma.admin.findUnique({
    where: {
      login,
    },
  });

  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    return NextResponse.json(
      { error: "Неверный логин или пароль" },
      { status: 401 },
    );
  }

  if (!admin.passwordHash.startsWith("scrypt$")) {
    await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        passwordHash: await hashPassword(password),
      },
    });
  }

  await setAdminSession({
    adminId: admin.id,
    login: admin.login,
    role: admin.role,
  });

  return NextResponse.json({ ok: true });
}
