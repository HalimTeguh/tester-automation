"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { TestProgressPanel } from "@/components/test-progress-panel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { presets, TestCategory, TestResult } from "@/lib/mock-data";
import { Loader2, ArrowLeft, XCircle, Users, Clock } from "lucide-react";
import Link from "next/link";

export default function RunPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "https://example.com";
  const presetId = searchParams.get("preset") || "pre-launch";

  const preset = presets.find((p) => p.id === presetId) || presets[1];
  const [results, setResults] = useState<TestResult[]>(
    preset.categories.map((category) => ({
      category,
      score: 0,
      status: "pending",
      progress: 0,
      issues: [],
    }))
  );
  const [status, setStatus] = useState<"queue" | "running" | "completed" | "failed">("queue");
  const [logs, setLogs] = useState<string[]>(["Menerima permintaan...", "Memverifikasi slot scanner..."]);

  // Queue simulation
  const [queuePosition, setQueuePosition] = useState(() => Math.floor(Math.random() * 12) + 6);
  const [queueWaitSec, setQueueWaitSec] = useState(queuePosition * 4);

  useEffect(() => {
    if (status !== "queue") return;

    const interval = setInterval(() => {
      setQueuePosition((pos) => {
        if (pos <= 1) {
          clearInterval(interval);
          setStatus("running");
          setLogs((l) => [...l, "Slot tersedia. Memulai scan..."]);
          return 0;
        }
        const next = Math.max(0, pos - Math.floor(Math.random() * 3) - 1);
        setQueueWaitSec(next * 4 + Math.floor(Math.random() * 5));
        setLogs((l) => [...l, `Antrean: ${next} user di depan — estimasi ${next * 4}s`]);
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status !== "running") return;

    const categories = preset.categories;
    let current = 0;

    const interval = setInterval(() => {
      setResults((prev) => {
        const next = [...prev];
        const active = next[current];
        if (!active) return prev;

        if (active.status === "pending") {
          active.status = "running";
          active.progress = 15;
          setLogs((l) => [...l, `Memeriksa ${active.category}...`]);
        } else if (active.progress < 90) {
          active.progress += 20;
        } else {
          active.progress = 100;
          active.status = "completed";
          active.score = Math.floor(Math.random() * 30) + 65;
          current += 1;
          if (current >= categories.length) {
            clearInterval(interval);
            setStatus("completed");
            setLogs((l) => [...l, "Tes selesai. Memuat laporan..."]);
            setTimeout(() => {
              router.push(`/report/demo?url=${encodeURIComponent(url)}&preset=${presetId}`);
            }, 1500);
          }
        }
        return next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [status, preset, router, url, presetId]);

  const statusConfig = {
    queue: {
      icon: <Users className="h-5 w-5 animate-pulse text-amber-500" />,
      title: "Menunggu antrean",
      subtitle: `Posisi antrean: ${queuePosition} user di depan — estimasi ~${queueWaitSec} detik`,
    },
    running: {
      icon: <Loader2 className="h-5 w-5 animate-spin text-primary" />,
      title: "Tes sedang berjalan",
      subtitle: "Estimasi selesai: ~2 menit",
    },
    completed: {
      icon: <div className="h-5 w-5 rounded-full bg-emerald-500" />,
      title: "Tes selesai",
      subtitle: "Mengalihkan ke halaman laporan...",
    },
    failed: {
      icon: <XCircle className="h-5 w-5 text-destructive" />,
      title: "Tes gagal",
      subtitle: "Silakan coba lagi",
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Memeriksa Website</h1>
          <p className="text-sm text-muted-foreground">{url}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-border/60 bg-accent/30 p-4">
        {currentStatus.icon}
        <div className="flex-1">
          <p className="text-sm font-semibold">{currentStatus.title}</p>
          <p className="text-xs text-muted-foreground">{currentStatus.subtitle}</p>
        </div>
      </div>

      {status === "queue" && (
        <Card className="mt-6 border-border/80 bg-card">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                Estimasi tunggu
              </span>
              <span className="font-semibold">~{queueWaitSec} detik</span>
            </div>
            <Progress value={Math.max(0, 100 - queuePosition * 5)} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Scanner sedang sibuk. Kamu tetap di antrean agar server tidak overload saat traffic tinggi.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-6">
        <TestProgressPanel results={results} />
      </div>

      <Card className="mt-6 border-border/80 bg-card">
        <CardContent className="p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live Log</p>
          <div className="max-h-48 overflow-y-auto rounded-lg bg-muted p-3 font-mono text-xs">
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
