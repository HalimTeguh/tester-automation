import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      name: body.name,
      role: body.role,
      isActive: body.isActive,
    },
  });

  return NextResponse.json(user);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.user.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ message: "User deactivated" });
}
