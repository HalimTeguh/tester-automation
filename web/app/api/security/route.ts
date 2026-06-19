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

  if (!security) {
    return NextResponse.json({ error: "Security content not found" }, { status: 404 });
  }

  return NextResponse.json(security);
}
