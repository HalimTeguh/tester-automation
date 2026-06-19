"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Activity, Gauge, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function LoadTestReportPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "https://example.com";

  // Mock hasil uji beban
  const totalRequests = 23_342;
  const avgRps = 129;
  const avgLatency = 138;
  const p95Latency = 804;
  const p99Latency = 3_134;
  const errorRate = 0;
  const duration = 180;

  const rpsTimeline = [12, 45, 91, 127, 168, 226, 236, 244, 238, 240, 199, 24];
  const latencyTimeline = [8, 4, 3, 3, 3, 6, 5, 4, 4, 4, 1_079, 3];
  const maxRps = Math.max(...rpsTimeline);
  const maxLatency = Math.max(...latencyTimeline);

  const statusCodes = [
    { code: "200 OK", count: 23_342, pct: 100 },
    { code: "500 Server Error", count: 0, pct: 0 },
    { code: "Timeout", count: 0, pct: 0 },
  ];

  const insights = [
    {
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      title: "Tidak ada error",
      desc: "Selama 23.000+ request, server target merespons semua tanpa status 5xx atau timeout.",
    },
    {
      icon: <Gauge className="h-4 w-4 text-primary" />,
      title: "Latensi naik saat spike",
      desc: `Median latensi 3 ms, namun p95 mencapai ${p95Latency} ms dan p99 ${p99Latency} ms saat 100 VU/detik. Periksa database atau upstream API.`,
    },
    {
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
      title: "Cache & CDN perlu diperhatikan",
      desc: "Jika halaman statis masih lambat saat spike, pertimbangkan CDN atau caching edge.",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/load-test">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Laporan Uji Beban</h1>
            <p className="text-sm text-muted-foreground">{url}</p>
          </div>
        </div>
        <Badge variant={errorRate === 0 ? "default" : "destructive"}>
          {errorRate === 0 ? "Stabil" : "Ada error"}
        </Badge>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col items-center justify-center border-border/60 bg-card/50 p-5 text-center">
          <Activity className="h-6 w-6 text-primary" />
          <p className="mt-2 text-2xl font-bold">{totalRequests.toLocaleString("id-ID")}</p>
          <p className="text-xs text-muted-foreground">Total request</p>
        </Card>
        <Card className="flex flex-col items-center justify-center border-border/60 bg-card/50 p-5 text-center">
          <Gauge className="h-6 w-6 text-primary" />
          <p className="mt-2 text-2xl font-bold">{avgRps}</p>
          <p className="text-xs text-muted-foreground">Rata-rata RPS</p>
        </Card>
        <Card className="flex flex-col items-center justify-center border-border/60 bg-card/50 p-5 text-center">
          <Clock className="h-6 w-6 text-primary" />
          <p className="mt-2 text-2xl font-bold">{avgLatency} ms</p>
          <p className="text-xs text-muted-foreground">Latensi rata-rata</p>
        </Card>
        <Card className="flex flex-col items-center justify-center border-border/60 bg-card/50 p-5 text-center">
          <AlertTriangle className="h-6 w-6 text-primary" />
          <p className="mt-2 text-2xl font-bold">{errorRate}%</p>
          <p className="text-xs text-muted-foreground">Error rate</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" />
              RPS per interval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-1">
              {rpsTimeline.map((val, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-primary/80 transition-all hover:bg-primary"
                  style={{ height: `${(val / maxRps) * 100}%` }}
                  title={`${val} RPS`}
                />
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">Setiap batang = ~15 detik</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Latensi per interval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-1">
              {latencyTimeline.map((val, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-amber-500/80 transition-all hover:bg-amber-500"
                  style={{ height: `${(val / maxLatency) * 100}%` }}
                  title={`${val} ms`}
                />
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">Setiap batang = ~15 detik</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="border-border/80 bg-card lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Status Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusCodes.map((s) => (
                <div key={s.code}>
                  <div className="flex justify-between text-sm">
                    <span>{s.code}</span>
                    <span className="font-medium">{s.count.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Insight & Rekomendasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((item) => (
                <div key={item.title} className="flex gap-3">
                  <div className="mt-0.5">{item.icon}</div>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
