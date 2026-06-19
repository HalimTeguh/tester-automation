import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !body.email || !body.name) {
    return NextResponse.json({ error: "email and name are required" }, { status: 400 });
  }

  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      role: body.role || "user",
      isActive: body.isActive ?? true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
