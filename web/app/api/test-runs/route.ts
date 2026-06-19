import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const runs = await prisma.testRun.findMany({
    orderBy: { startedAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(runs);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !body.url || !body.preset) {
    return NextResponse.json({ error: "url and preset are required" }, { status: 400 });
  }

  const run = await prisma.testRun.create({
    data: {
      url: body.url,
      preset: body.preset,
      status: "pending",
      userId: body.userId || null,
    },
  });

  return NextResponse.json(run, { status: 201 });
}
