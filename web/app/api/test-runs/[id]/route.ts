import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = await prisma.testRun.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      testResults: {
        include: { issues: true },
      },
    },
  });

  if (!run) {
    return NextResponse.json({ error: "Test run not found" }, { status: 404 });
  }

  return NextResponse.json(run);
}
