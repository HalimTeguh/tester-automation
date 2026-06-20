import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profile = await prisma.companyProfile.findFirst({
    include: {
      homeFeatures: { orderBy: { order: "asc" } },
      homeBenefits: { orderBy: { order: "asc" } },
      trustBadges: { orderBy: { order: "asc" } },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Home content not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const body = await request.json();

  const existing = await prisma.companyProfile.findFirst({
    include: { homeFeatures: true, homeBenefits: true, trustBadges: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Home content not found" }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.homeFeature.deleteMany({ where: { companyProfileId: existing.id } });
    await tx.homeBenefit.deleteMany({ where: { companyProfileId: existing.id } });
    await tx.trustBadge.deleteMany({ where: { companyProfileId: existing.id } });

    return tx.companyProfile.update({
      where: { id: existing.id },
      data: {
        siteName: body.siteName,
        homeTitle: body.homeTitle,
        homeSubtitle: body.homeSubtitle,
        heroBadgeText: body.heroBadgeText,
        ctaText: body.ctaText,
        disclaimerText: body.disclaimerText,
        footerText: body.footerText,
        isActive: body.isActive ?? true,
        homeFeatures: {
          create: (body.homeFeatures || []).map((f: any, index: number) => ({
            icon: f.icon,
            title: f.title,
            description: f.description,
            order: index,
          })),
        },
        homeBenefits: {
          create: (body.homeBenefits || []).map((b: any, index: number) => ({
            icon: b.icon,
            title: b.title,
            value: b.value,
            description: b.description,
            order: index,
          })),
        },
        trustBadges: {
          create: (body.trustBadges || []).map((b: any, index: number) => ({
            icon: b.icon,
            label: b.label,
            order: index,
          })),
        },
      },
      include: {
        homeFeatures: { orderBy: { order: "asc" } },
        homeBenefits: { orderBy: { order: "asc" } },
        trustBadges: { orderBy: { order: "asc" } },
      },
    });
  });

  return NextResponse.json(updated);
}
