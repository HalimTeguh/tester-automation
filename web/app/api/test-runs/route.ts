import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where = user.role === "admin" ? {} : { userId: user.sub };

  const runs = await prisma.testRun.findMany({
    where,
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
