import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.settings.findFirst({
    include: { themeConfig: true },
  });
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  let settings = await prisma.settings.findFirst({ include: { themeConfig: true } });
  if (!settings) {
    const theme = await prisma.themeConfig.create({
      data: {
        name: body.theme?.name || "Custom",
        primary: body.theme?.primary || "#4f46e5",
        primaryForeground: body.theme?.primaryForeground || "#ffffff",
        secondary: body.theme?.secondary || "#06b6d4",
        accent: body.theme?.accent || "#10b981",
        background: body.theme?.background || "#0a0a0f",
        foreground: body.theme?.foreground || "#f8fafc",
        muted: body.theme?.muted || "#1e1e2a",
        border: body.theme?.border || "#27273a",
        isActive: true,
      },
    });
    settings = await prisma.settings.create({
      data: {
        themeConfigId: theme.id,
        maintenanceMode: body.maintenanceMode ?? false,
        allowAnonymousTest: body.allowAnonymousTest ?? true,
        maxAnonymousTests: body.maxAnonymousTests ?? 5,
        defaultPreset: body.defaultPreset || "pre-launch",
      },
      include: { themeConfig: true },
    });
    return NextResponse.json(settings);
  }

  const themeUpdate: any = {};
  if (body.theme) {
    if (body.theme.name != null) themeUpdate.name = body.theme.name;
    if (body.theme.primary != null) themeUpdate.primary = body.theme.primary;
    if (body.theme.primaryForeground != null) themeUpdate.primaryForeground = body.theme.primaryForeground;
    if (body.theme.secondary != null) themeUpdate.secondary = body.theme.secondary;
    if (body.theme.accent != null) themeUpdate.accent = body.theme.accent;
    if (body.theme.background != null) themeUpdate.background = body.theme.background;
    if (body.theme.foreground != null) themeUpdate.foreground = body.theme.foreground;
    if (body.theme.muted != null) themeUpdate.muted = body.theme.muted;
    if (body.theme.border != null) themeUpdate.border = body.theme.border;
  }

  const [updatedSettings] = await prisma.$transaction([
    prisma.settings.update({
      where: { id: settings.id },
      data: {
        maintenanceMode: body.maintenanceMode ?? settings.maintenanceMode,
        allowAnonymousTest: body.allowAnonymousTest ?? settings.allowAnonymousTest,
        maxAnonymousTests: body.maxAnonymousTests ?? settings.maxAnonymousTests,
        defaultPreset: body.defaultPreset ?? settings.defaultPreset,
      },
      include: { themeConfig: true },
    }),
    ...(Object.keys(themeUpdate).length > 0 && settings.themeConfig
      ? [
          prisma.themeConfig.update({
            where: { id: settings.themeConfig.id },
            data: themeUpdate,
          }),
        ]
      : []),
  ]);

  const final = await prisma.settings.findUnique({
    where: { id: updatedSettings.id },
    include: { themeConfig: true },
  });

  return NextResponse.json(final);
}
