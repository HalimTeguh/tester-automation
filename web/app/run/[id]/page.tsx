"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Activity,
  Globe,
  ShieldCheck,
} from "lucide-react";

const steps = [
  "Memuat halaman target",
  "Memeriksa fungsionalitas",
  "Mengukur performa",
  "Mengecek SEO",
  "Memeriksa header keamanan",
  "Menyusun laporan",
];

export default function RunPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [run, setRun] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/test-runs/${id}`);
        const data = await res.json();
        setRun(data);

        if (data.status === "running") {
          setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
        } else if (data.status === "completed") {
          setStepIndex(steps.length - 1);
          clearInterval(interval);
          setTimeout(() => router.push(`/report/${id}`), 1200);
        } else if (data.status === "failed") {
          clearInterval(interval);
          setError("Pemeriksaan gagal. Silakan coba lagi.");
        }
      } catch {
        setError("Gagal menghubungi server.");
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [id, router]);

  useEffect(() => {
    // Trigger runner once
    fetch(`/api/test-runs/${id}/run`, { method: "POST" }).catch(() => {
      setError("Gagal memulai runner.");
    });
  }, [id]);

  const progress = run
    ? run.status === "completed"
      ? 100
      : run.status === "failed"
      ? 100
      : Math.round(((stepIndex + 1) / steps.length) * 100)
    : 10;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              {error ? (
                <XCircle className="h-8 w-8" />
              ) : run?.status === "completed" ? (
                <CheckCircle2 className="h-8 w-8" />
              ) : (
                <Loader2 className="h-8 w-8 animate-spin" />
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight">
              {error
                ? "Pemeriksaan Gagal"
                : run?.status === "completed"
                ? "Pemeriksaan Selesai"
                : "Sedang Memeriksa Website"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {run?.url || "Memuat target..."}
            </p>

            <div className="mt-6 w-full">
              <Progress value={progress} className="h-2" />
              <p className="mt-2 text-sm font-medium text-primary">
                {steps[stepIndex]}
              </p>
            </div>

            <div className="mt-8 grid w-full grid-cols-3 gap-3">
              <Badge variant="outline" className="justify-center gap-1 py-2">
                <Activity className="h-3.5 w-3.5" />
                {run?.status === "running" ? "Aktif" : run?.status || "..."}
              </Badge>
              <Badge variant="outline" className="justify-center gap-1 py-2">
                <Globe className="h-3.5 w-3.5" />
                {run?.preset || "default"}
              </Badge>
              <Badge variant="outline" className="justify-center gap-1 py-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                {run?.overallScore != null ? `${run.overallScore}/100` : "-"}
              </Badge>
            </div>

            {error && (
              <div className="mt-6 w-full rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {run?.status === "completed" && (
              <Button
                className="mt-8 w-full"
                onClick={() => router.push(`/report/${id}`)}
              >
                Lihat Laporan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
