"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Activity, CheckCircle2 } from "lucide-react";

interface Snapshot {
  time: number;
  rps: number;
  latency: number;
  errors: number;
}

export default function LoadTestRunPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "https://example.com";
  const vus = Number(searchParams.get("vus")) || 50;
  const duration = Number(searchParams.get("duration")) || 60;
  const rampUp = Number(searchParams.get("ramp")) || 15;
  const maxRps = Number(searchParams.get("maxRps")) || 50;

  const [status, setStatus] = useState<"running" | "completed">("running");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>(["Memvalidasi target URL...", `Menyiapkan ${vus} virtual users...`]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 100 / (duration / 2), 100);
        if (next >= 100) {
          clearInterval(interval);
          setStatus("completed");
          setLogs((l) => [...l, "Load test selesai. Memuat laporan..."]);
          setTimeout(() => {
            router.push(`/load-test/report/demo?url=${encodeURIComponent(url)}`);
          }, 1500);
          return 100;
        }

        const elapsed = Math.floor((next / 100) * duration);
        const inRamp = elapsed <= rampUp;
        const rps = inRamp
          ? Math.floor((elapsed / rampUp) * maxRps)
          : Math.floor(maxRps * (0.8 + Math.random() * 0.4));
        const latency = Math.floor(10 + Math.random() * (inRamp ? 50 : 300));
        const errors = Math.random() > 0.95 ? Math.floor(rps * 0.02) : 0;

        setSnapshots((s) => [
          ...s.slice(-19),
          { time: elapsed, rps, latency, errors },
        ]);
        setLogs((l) => [
          ...l,
          `[${elapsed}s] RPS: ${rps} | Latency: ${latency}ms | Errors: ${errors}`,
        ]);
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [duration, rampUp, maxRps, router, url]);

  const current = snapshots[snapshots.length - 1];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/load-test">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Menjalankan Uji Beban</h1>
          <p className="text-sm text-muted-foreground">{url}</p>
        </div>
      </div>

      <Card className="mt-6 border-border/80 bg-card">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            {status === "running" ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            )}
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {status === "running" ? "Load test berjalan" : "Load test selesai"}
              </p>
              <p className="text-xs text-muted-foreground">
                {status === "running"
                  ? `Durasi ${duration} detik • ${vus} virtual users`
                  : "Mengalihkan ke laporan..."}
              </p>
            </div>
            <Badge variant="secondary">{Math.round(progress)}%</Badge>
          </div>
          <Progress value={progress} className="mt-4 h-2" />
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="flex flex-col items-center justify-center border-border/60 bg-card/50 p-5 text-center">
          <Activity className="h-6 w-6 text-primary" />
          <p className="mt-2 text-2xl font-bold">{current?.rps ?? 0}</p>
          <p className="text-xs text-muted-foreground">RPS saat ini</p>
        </Card>
        <Card className="flex flex-col items-center justify-center border-border/60 bg-card/50 p-5 text-center">
          <Loader2 className="h-6 w-6 text-primary" />
          <p className="mt-2 text-2xl font-bold">{current?.latency ?? 0} ms</p>
          <p className="text-xs text-muted-foreground">Latensi rata-rata</p>
        </Card>
        <Card className="flex flex-col items-center justify-center border-border/60 bg-card/50 p-5 text-center">
          <Activity className="h-6 w-6 text-primary" />
          <p className="mt-2 text-2xl font-bold">{current?.errors ?? 0}</p>
          <p className="text-xs text-muted-foreground">Error terdeteksi</p>
        </Card>
      </div>

      <Card className="mt-6 border-border/80 bg-card">
        <CardContent className="p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live Log</p>
          <div className="max-h-64 overflow-y-auto rounded-lg bg-muted p-3 font-mono text-xs">
            {logs.map((log, i) => (
              <div key={i} className="py-0.5">
                <span className="text-muted-foreground">[{i + 1}]</span> {log}
              </div>
            ))}
            {status === "running" && <div className="py-0.5 text-muted-foreground">...</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
