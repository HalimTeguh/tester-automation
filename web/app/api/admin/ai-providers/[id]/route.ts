import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const provider = await prisma.aiProviderConfig.findUnique({
    where: { id },
  });

  if (!provider) {
    return NextResponse.json({ error: "Provider tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(provider);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.aiProviderConfig.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Provider tidak ditemukan" }, { status: 404 });
  }

  if (body.isActive && !existing.isActive) {
    await prisma.aiProviderConfig.updateMany({
      data: { isActive: false },
    });
  }

  const updated = await prisma.aiProviderConfig.update({
    where: { id },
    data: {
      name: body.name,
      provider: body.provider,
      baseUrl: body.baseUrl,
      apiKey: body.apiKey,
      model: body.model,
      maxTokens: body.maxTokens,
      isActive: body.isActive,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const existing = await prisma.aiProviderConfig.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Provider tidak ditemukan" }, { status: 404 });
  }

  await prisma.aiProviderConfig.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
