import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const webhooks = await prisma.webhookEndpoint.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(webhooks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const created = await prisma.webhookEndpoint.create({
    data: {
      url: body.url,
      secret: body.secret,
      events: body.events || "test.completed",
      isActive: body.isActive ?? true,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
