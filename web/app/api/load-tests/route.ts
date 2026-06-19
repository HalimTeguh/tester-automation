import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tests = await prisma.loadTest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(tests);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !body.url || !body.vus || !body.duration) {
    return NextResponse.json({ error: "url, vus, and duration are required" }, { status: 400 });
  }

  const test = await prisma.loadTest.create({
    data: {
      url: body.url,
      vus: Number(body.vus),
      duration: Number(body.duration),
      rampUp: Number(body.rampUp || 0),
      maxRps: Number(body.maxRps || 0),
      paths: body.paths || "/",
      status: "pending",
      userId: body.userId || null,
    },
  });

  return NextResponse.json(test, { status: 201 });
}
