import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profile = await prisma.companyProfile.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
    include: {
      homeFeatures: { orderBy: { order: "asc" } },
      trustBadges: { orderBy: { order: "asc" } },
    },
  });
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const profile = await prisma.companyProfile.findFirst({ orderBy: { updatedAt: "desc" } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.companyProfile.update({
      where: { id: profile.id },
      data: {
        siteName: body.siteName,
        homeTitle: body.homeTitle,
        homeSubtitle: body.homeSubtitle,
        heroBadgeText: body.heroBadgeText,
        ctaText: body.ctaText,
        disclaimerText: body.disclaimerText,
        footerText: body.footerText,
      },
    });

    if (Array.isArray(body.homeFeatures)) {
      await tx.homeFeature.deleteMany({ where: { companyProfileId: profile.id } });
      await tx.homeFeature.createMany({
        data: body.homeFeatures.map((f: any, idx: number) => ({
          companyProfileId: profile.id,
          icon: f.icon,
          title: f.title,
          description: f.description,
          order: idx,
        })),
      });
    }

    if (Array.isArray(body.trustBadges)) {
      await tx.trustBadge.deleteMany({ where: { companyProfileId: profile.id } });
      await tx.trustBadge.createMany({
        data: body.trustBadges.map((b: any, idx: number) => ({
          companyProfileId: profile.id,
          icon: b.icon,
          label: b.label,
          order: idx,
        })),
      });
    }
  });

  return NextResponse.json({ ok: true });
}
