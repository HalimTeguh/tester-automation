import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const scenarios = await prisma.testScenario.findMany({
    include: { steps: { orderBy: { order: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(scenarios);
}

export async function POST(request: Request) {
  const body = await request.json();
  const created = await prisma.testScenario.create({
    data: {
      name: body.name,
      description: body.description,
      startUrl: body.startUrl,
      isActive: body.isActive ?? true,
      steps: {
        create: (body.steps || []).map((s: any, index: number) => ({
          order: index,
          action: s.action,
          selector: s.selector,
          value: s.value,
          assertionText: s.assertionText,
          waitMs: s.waitMs ?? 0,
        })),
      },
    },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(created);
}
