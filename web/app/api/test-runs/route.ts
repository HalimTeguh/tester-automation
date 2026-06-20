import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const runs = await prisma.testRun.findMany({
    orderBy: { startedAt: "desc" },
    include: { user: { select: { id: true, name: true } } },
  });
  return NextResponse.json(runs);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !body.url) {
    return NextResponse.json({ error: "URL wajib diisi" }, { status: 400 });
  }

  const userId = request.headers.get("x-user-id") || undefined;

  const run = await prisma.testRun.create({
    data: {
      url: body.url,
      preset: body.preset || "pre-launch",
      status: "pending",
      userId,
      config: JSON.stringify(body.config || {}),
    },
  });

  return NextResponse.json(run, { status: 201 });
}
