import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const security = await prisma.securityContent.findFirst({
    where: { isActive: true },
    include: {
      securityCommitments: { orderBy: { order: "asc" } },
      privacyCommitments: { orderBy: { number: "asc" } },
    },
  });
  return NextResponse.json(security);
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const security = await prisma.securityContent.findFirst();
  if (!security) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.securityContent.update({
      where: { id: security.id },
      data: {
        pageTitle: body.pageTitle,
        pageSubtitle: body.pageSubtitle,
        commitmentTitle: body.commitmentTitle,
      },
    });

    if (Array.isArray(body.securityCommitments)) {
      await tx.securityCommitment.deleteMany({ where: { securityContentId: security.id } });
      await tx.securityCommitment.createMany({
        data: body.securityCommitments.map((c: any, idx: number) => ({
          securityContentId: security.id,
          icon: c.icon,
          title: c.title,
          description: c.description,
          order: idx,
        })),
      });
    }

    if (Array.isArray(body.privacyCommitments)) {
      await tx.privacyCommitment.deleteMany({ where: { securityContentId: security.id } });
      await tx.privacyCommitment.createMany({
        data: body.privacyCommitments.map((c: any, idx: number) => ({
          securityContentId: security.id,
          number: c.number ?? idx + 1,
          title: c.title,
          description: c.description,
        })),
      });
    }
  });

  return NextResponse.json({ ok: true });
}
