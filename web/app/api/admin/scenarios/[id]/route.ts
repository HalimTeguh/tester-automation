import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const updated = await prisma.$transaction(async (tx) => {
    await tx.scenarioStep.deleteMany({ where: { testScenarioId: id } });
    return tx.testScenario.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        startUrl: body.startUrl,
        isActive: body.isActive,
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
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.testScenario.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
