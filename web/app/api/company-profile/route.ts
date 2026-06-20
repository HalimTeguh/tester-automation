import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profile = await prisma.companyProfile.findFirst({
    where: { isActive: true },
    include: {
      homeFeatures: { orderBy: { order: "asc" } },
      homeBenefits: { orderBy: { order: "asc" } },
      trustBadges: { orderBy: { order: "asc" } },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Company profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...profile,
    title: profile.homeTitle,
    subtitle: profile.homeSubtitle,
    ctaUrl: "#input-url",
  });
}
