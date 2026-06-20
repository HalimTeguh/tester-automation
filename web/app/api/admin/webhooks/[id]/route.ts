import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const updated = await prisma.webhookEndpoint.update({
    where: { id },
    data: {
      url: body.url,
      secret: body.secret,
      events: body.events,
      isActive: body.isActive,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.webhookEndpoint.delete({ where: { id } });
  return NextResponse.json({ message: "Webhook deleted" });
}
