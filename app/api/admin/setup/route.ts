import { NextResponse } from "next/server";
import {
  hashPassword,
  setAdminSession,
  validateAdminCredentials,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type SetupPayload = {
  login?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as SetupPayload | null;
  const login = typeof payload?.login === "string" ? payload.login.trim() : "";
  const password = typeof payload?.password === "string" ? payload.password : "";
  const errors = validateAdminCredentials(login, password);

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(". ") }, { status: 400 });
  }

  const adminsCount = await prisma.admin.count();

  if (adminsCount > 0) {
    return NextResponse.json(
      { error: "Администратор уже создан" },
      { status: 409 },
    );
  }

  const admin = await prisma.admin.create({
    data: {
      login,
      passwordHash: await hashPassword(password),
      role: "owner",
    },
  });

  await setAdminSession({
    adminId: admin.id,
    login: admin.login,
    role: admin.role,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
