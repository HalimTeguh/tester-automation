import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const existing = await prisma.aiProviderConfig.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Provider tidak ditemukan" }, { status: 404 });
  }

  await prisma.aiProviderConfig.updateMany({
    data: { isActive: false },
  });

  const updated = await prisma.aiProviderConfig.update({
    where: { id },
    data: { isActive: true },
  });

  return NextResponse.json(updated);
}
