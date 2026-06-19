import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.settings.findFirst({
    include: { themeConfig: true },
  });

  if (!settings) {
    return NextResponse.json({ error: "Settings not found" }, { status: 404 });
  }

  return NextResponse.json({
    maintenanceMode: settings.maintenanceMode,
    allowAnonymousTest: settings.allowAnonymousTest,
    maxAnonymousTests: settings.maxAnonymousTests,
    defaultPreset: settings.defaultPreset,
    theme: settings.themeConfig,
  });
}
