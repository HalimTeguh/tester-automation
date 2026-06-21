import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const providers = await prisma.aiProviderConfig.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(providers);
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();

  if (body.isActive) {
    await prisma.aiProviderConfig.updateMany({
      data: { isActive: false },
    });
  }

  const created = await prisma.aiProviderConfig.create({
    data: {
      name: body.name,
      provider: body.provider,
      baseUrl: body.baseUrl,
      apiKey: body.apiKey,
      model: body.model,
      maxTokens: body.maxTokens ?? 8000,
      isActive: body.isActive ?? false,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
