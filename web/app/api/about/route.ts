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

  if (!about) {
    return NextResponse.json({ error: "About content not found" }, { status: 404 });
  }

  return NextResponse.json(about);
}
