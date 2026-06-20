import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [testRuns, loadTests] = await Promise.all([
    prisma.testRun.findMany({
      orderBy: { startedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        testResults: {
          select: { id: true, category: true, score: true, status: true },
        },
      },
    }),
    prisma.loadTest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return NextResponse.json({ testRuns, loadTests });
}
