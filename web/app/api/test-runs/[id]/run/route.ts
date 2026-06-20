import { NextResponse } from "next/server";
import { runTest } from "@/lib/runner";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Jalankan runner di background agar tidak memblokir response
  runTest(id).catch((err) => {
    console.error("Runner failed for", id, err);
  });

  return NextResponse.json({ message: "Test started", id });
}
