import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !body.event || !body.payload) {
    return NextResponse.json({ error: "event and payload are required" }, { status: 400 });
  }

  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { isActive: true },
  });

  const deliveries = [];
  for (const endpoint of endpoints) {
    const payloadString = JSON.stringify(body.payload);
    const signature = crypto
      .createHmac("sha256", endpoint.secret)
      .update(payloadString)
      .digest("hex");

    const delivery = await prisma.webhookDelivery.create({
      data: {
        webhookEndpointId: endpoint.id,
        event: body.event,
        payload: payloadString,
        signature: `sha256=${signature}`,
        statusCode: null,
        responseBody: null,
      },
    });

    deliveries.push({ endpointId: endpoint.id, deliveryId: delivery.id, signature: delivery.signature });
  }

  return NextResponse.json({ queued: deliveries.length, deliveries });
}
