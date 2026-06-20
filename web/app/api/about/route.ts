import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const about = await prisma.aboutContent.findFirst({
    where: { isActive: true },
    include: {
      testTypes: { orderBy: { order: "asc" } },
      howItWorksSteps: { orderBy: { stepNumber: "asc" } },
      aboutBenefits: { orderBy: { order: "asc" } },
      roadmapItems: { orderBy: { order: "asc" } },
    },
  });
  return NextResponse.json(about);
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const about = await prisma.aboutContent.findFirst();
  if (!about) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.aboutContent.update({
      where: { id: about.id },
      data: {
        pageTitle: body.pageTitle,
        pageSubtitle: body.pageSubtitle,
        howItWorksTitle: body.howItWorksTitle,
        benefitsTitle: body.benefitsTitle,
        roadmapTitle: body.roadmapTitle,
        roadmapSubtitle: body.roadmapSubtitle,
      },
    });

    if (Array.isArray(body.testTypes)) {
      await tx.testType.deleteMany({ where: { aboutContentId: about.id } });
      await tx.testType.createMany({
        data: body.testTypes.map((t: any, idx: number) => ({
          aboutContentId: about.id,
          slug: t.slug,
          icon: t.icon,
          title: t.title,
          description: t.description,
          order: idx,
        })),
      });
    }

    if (Array.isArray(body.howItWorksSteps)) {
      await tx.howItWorksStep.deleteMany({ where: { aboutContentId: about.id } });
      await tx.howItWorksStep.createMany({
        data: body.howItWorksSteps.map((s: any, idx: number) => ({
          aboutContentId: about.id,
          stepNumber: s.stepNumber ?? idx + 1,
          title: s.title,
          description: s.description,
        })),
      });
    }

    if (Array.isArray(body.aboutBenefits)) {
      await tx.aboutBenefit.deleteMany({ where: { aboutContentId: about.id } });
      await tx.aboutBenefit.createMany({
        data: body.aboutBenefits.map((b: any, idx: number) => ({
          aboutContentId: about.id,
          text: b.text,
          order: idx,
        })),
      });
    }

    if (Array.isArray(body.roadmapItems)) {
      await tx.roadmapItem.deleteMany({ where: { aboutContentId: about.id } });
      await tx.roadmapItem.createMany({
        data: body.roadmapItems.map((r: any, idx: number) => ({
          aboutContentId: about.id,
          icon: r.icon,
          title: r.title,
          description: r.description,
          order: idx,
        })),
      });
    }
  });

  return NextResponse.json({ ok: true });
}
