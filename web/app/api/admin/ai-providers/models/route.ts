import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { baseUrl, apiKey } = body;

  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "Base URL dan API key wajib diisi" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${baseUrl}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Gagal mengambil daftar model (HTTP ${res.status})`, details: text },
        { status: 502 }
      );
    }

    const data = await res.json();
    const models = (data.data || []).map((m: any) => ({
      id: m.id || m.model || m.name,
      name: m.id || m.model || m.name,
      description: m.description || "",
    }));

    return NextResponse.json({ models });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Gagal terhubung ke provider", details: err.message },
      { status: 502 }
    );
  }
}
