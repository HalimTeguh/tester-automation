import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const about = await prisma.aboutContent.findFirst({
    include: {
      testTypes: { orderBy: { order: "asc" } },
      howItWorksSteps: { orderBy: { stepNumber: "asc" } },
      aboutBenefits: { orderBy: { order: "asc" } },
      roadmapItems: { orderBy: { order: "asc" } },
    },
  });

  if (!about) {
    return NextResponse.json({ error: "About content not found" }, { status: 404 });
  }

  return NextResponse.json(about);
}

export async function PUT(request: Request) {
  const body = await request.json();

  const existing = await prisma.aboutContent.findFirst({
    include: {
      testTypes: true,
      howItWorksSteps: true,
      aboutBenefits: true,
      roadmapItems: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "About content not found" }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.testType.deleteMany({ where: { aboutContentId: existing.id } });
    await tx.howItWorksStep.deleteMany({ where: { aboutContentId: existing.id } });
    await tx.aboutBenefit.deleteMany({ where: { aboutContentId: existing.id } });
    await tx.roadmapItem.deleteMany({ where: { aboutContentId: existing.id } });

    return tx.aboutContent.update({
      where: { id: existing.id },
      data: {
        pageTitle: body.pageTitle,
        pageSubtitle: body.pageSubtitle,
        howItWorksTitle: body.howItWorksTitle,
        benefitsTitle: body.benefitsTitle,
        roadmapTitle: body.roadmapTitle,
        roadmapSubtitle: body.roadmapSubtitle,
        isActive: body.isActive ?? true,
        testTypes: {
          create: (body.testTypes || []).map((t: any, index: number) => ({
            slug: t.slug,
            icon: t.icon,
            title: t.title,
            description: t.description,
            order: index,
          })),
        },
        howItWorksSteps: {
          create: (body.howItWorksSteps || []).map((s: any, index: number) => ({
            stepNumber: index + 1,
            title: s.title,
            description: s.description,
          })),
        },
        aboutBenefits: {
          create: (body.aboutBenefits || []).map((b: any, index: number) => ({
            text: b.text,
            order: index,
          })),
        },
        roadmapItems: {
          create: (body.roadmapItems || []).map((r: any, index: number) => ({
            icon: r.icon,
            title: r.title,
            description: r.description,
            order: index,
          })),
        },
      },
      include: {
        testTypes: { orderBy: { order: "asc" } },
        howItWorksSteps: { orderBy: { stepNumber: "asc" } },
        aboutBenefits: { orderBy: { order: "asc" } },
        roadmapItems: { orderBy: { order: "asc" } },
      },
    });
  });

  return NextResponse.json(updated);
}
