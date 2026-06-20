import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireAdmin } from "@/lib/auth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true },
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  if (!body || !body.email || !body.name || !body.password) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      password: await hashPassword(body.password),
      role: body.role || "user",
      isActive: body.isActive ?? true,
    },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}
