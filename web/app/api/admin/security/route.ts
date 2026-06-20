import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const security = await prisma.securityContent.findFirst({
    include: {
      securityCommitments: { orderBy: { order: "asc" } },
      privacyCommitments: { orderBy: { number: "asc" } },
    },
  });

  if (!security) {
    return NextResponse.json({ error: "Security content not found" }, { status: 404 });
  }

  return NextResponse.json(security);
}

export async function PUT(request: Request) {
  const body = await request.json();

  const existing = await prisma.securityContent.findFirst({
    include: { securityCommitments: true, privacyCommitments: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Security content not found" }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.securityCommitment.deleteMany({ where: { securityContentId: existing.id } });
    await tx.privacyCommitment.deleteMany({ where: { securityContentId: existing.id } });

    return tx.securityContent.update({
      where: { id: existing.id },
      data: {
        pageTitle: body.pageTitle,
        pageSubtitle: body.pageSubtitle,
        commitmentTitle: body.commitmentTitle,
        isActive: body.isActive ?? true,
        securityCommitments: {
          create: (body.securityCommitments || []).map((c: any, index: number) => ({
            icon: c.icon,
            title: c.title,
            description: c.description,
            order: index,
          })),
        },
        privacyCommitments: {
          create: (body.privacyCommitments || []).map((c: any, index: number) => ({
            number: index + 1,
            title: c.title,
            description: c.description,
          })),
        },
      },
      include: {
        securityCommitments: { orderBy: { order: "asc" } },
        privacyCommitments: { orderBy: { number: "asc" } },
      },
    });
  });

  return NextResponse.json(updated);
}
