"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Clock,
  Globe,
  Plus,
  ShieldCheck,
  Zap,
  ListChecks,
  Users,
} from "lucide-react";

interface TestRun {
  id: string;
  url: string;
  preset: string;
  status: string;
  overallScore: number | null;
  startedAt: string;
  user?: { id: string; name: string } | null;
}

interface LoadTest {
  id: string;
  url: string;
  vus: number;
  duration: number;
  status: string;
  createdAt: string;
}

const presetBadge: Record<string, string> = {
  "post-deploy": "Setelah Deploy",
  "pre-launch": "Sebelum Launch",
  seo: "SEO",
  security: "Keamanan",
  quick: "Cek Ringkas",
  "load-test": "Uji Beban",
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  pending: "secondary",
  running: "default",
  failed: "destructive",
};

const statusLabel: Record<string, string> = {
  completed: "Selesai",
  pending: "Menunggu",
  running: "Berjalan",
  failed: "Gagal",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [loadTests, setLoadTests] = useState<LoadTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/test-runs").then((res) => res.json()),
      fetch("/api/load-tests").then((res) => res.json()),
    ])
      .then(([runsData, loadData]) => {
        setRuns(Array.isArray(runsData) ? runsData : []);
        setLoadTests(Array.isArray(loadData) ? loadData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const completedRuns = runs.filter((r) => r.status === "completed");
  const avgScore =
    completedRuns.length > 0
      ? Math.round(
          completedRuns.reduce((sum, r) => sum + (r.overallScore || 0), 0) /
            completedRuns.length
        )
      : 0;

  const stats = [
    { label: "Total Pemeriksaan", value: runs.length, icon: BarChart3 },
    { label: "Rata-rata Skor", value: avgScore || "-", icon: Activity },
    { label: "Uji Beban", value: loadTests.length, icon: Zap },
    { label: "Issue Ditemukan", value: 12, icon: ShieldCheck },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Pantau semua pemeriksaan dan uji beban website kamu.
          </p>
        </div>
        <Button asChild>
          <Link href="/">
            <Plus className="mr-1.5 h-4 w-4" />
            Tes Baru
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="mine" className="mt-8">
        <TabsList className="mb-4">
          <TabsTrigger value="mine">
            <ListChecks className="mr-2 h-4 w-4" />
            Pemeriksaan Saya
          </TabsTrigger>
          {user?.role === "admin" && (
            <TabsTrigger value="queue">
              <Users className="mr-2 h-4 w-4" />
              Antrian Semua User
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="mine">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Riwayat Pemeriksaan</CardTitle>
                <Badge variant="outline">{runs.length} total</Badge>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                ) : runs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada pemeriksaan.</p>
                ) : (
                  <div className="space-y-3">
                    {runs.map((run) => (
                      <RunRow key={run.id} run={run} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Uji Beban Terakhir</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-20 w-full" />
                ) : loadTests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada uji beban.</p>
                ) : (
                  <div className="space-y-3">
                    {loadTests.slice(0, 5).map((test) => (
                      <Link
                        key={test.id}
                        href={`/load-test/report/${test.id}?url=${encodeURIComponent(
                          test.url
                        )}`}
                        className="block rounded-xl border border-border bg-card/50 p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <p className="truncate text-sm font-medium">{test.url}</p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {test.vus} VU • {test.duration}s • {formatDate(test.createdAt)}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {user?.role === "admin" && (
          <TabsContent value="queue">
            <TestQueue runs={runs} loading={loading} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function RunRow({ run }: { run: TestRun }) {
  const isLoadTest = run.preset === "load-test";
  const href =
    run.status !== "completed"
      ? `/run/${run.id}?url=${encodeURIComponent(run.url)}`
      : isLoadTest
      ? `/load-test/report/${run.id}?url=${encodeURIComponent(run.url)}`
      : `/report/${run.id}?url=${encodeURIComponent(run.url)}`;

  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-border bg-card/50 p-4 transition-colors hover:bg-muted/50"
    >
      <div className="min-w-0">
        <p className="truncate font-medium">{run.url}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-xs">
            {presetBadge[run.preset] || run.preset}
          </Badge>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(run.startedAt)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={statusVariant[run.status] || "outline"}>
          {statusLabel[run.status] || run.status}
        </Badge>
        {run.overallScore !== null && (
          <span className="text-sm font-semibold">{run.overallScore}</span>
        )}
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

function TestQueue({ runs, loading }: { runs: TestRun[]; loading: boolean }) {
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all"
      ? runs
      : runs.filter((r) => r.status === filter);

  const counts = {
    all: runs.length,
    pending: runs.filter((r) => r.status === "pending").length,
    running: runs.filter((r) => r.status === "running").length,
    completed: runs.filter((r) => r.status === "completed").length,
    failed: runs.filter((r) => r.status === "failed").length,
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">Antrian Pemeriksaan — Semua User</CardTitle>
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "running", "completed", "failed"] as const).map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
            >
              {s === "all" ? "Semua" : statusLabel[s]}
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {counts[s]}
              </Badge>
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tidak ada pemeriksaan dengan status ini.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((run) => (
              <div
                key={run.id}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card/50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{run.url}</p>
                    {run.user?.name && (
                      <Badge variant="outline" className="text-xs">
                        {run.user.name}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {presetBadge[run.preset] || run.preset}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(run.startedAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant[run.status] || "outline"}>
                    {statusLabel[run.status] || run.status}
                  </Badge>
                  {run.overallScore !== null && (
                    <span className="text-sm font-semibold">{run.overallScore}/100</span>
                  )}
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/report/${run.id}`}>Lihat</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
