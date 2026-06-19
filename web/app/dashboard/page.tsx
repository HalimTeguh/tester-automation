"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockHistory, mockProjects } from "@/lib/mock-data";
import { formatDistanceToNow } from "@/lib/date";
import { Plus, History, FolderKanban, TrendingUp, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const completedRuns = mockHistory.filter((r) => r.status === "completed");
  const avgScore = completedRuns.length
    ? Math.round(completedRuns.reduce((acc, r) => acc + r.overallScore, 0) / completedRuns.length)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Ringkasan project dan riwayat pemeriksaan.</p>
        </div>
        <Button asChild>
          <Link href="/">
            <Plus className="mr-1.5 h-4 w-4" />
            Tes Baru
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Tes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockHistory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Rata-rata Skor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgScore}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockProjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Issue Critical</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <div className="text-3xl font-bold">2</div>
            <AlertCircle className="h-5 w-5 text-destructive" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4 text-primary" />
              Riwayat Tes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockHistory.map((run) => (
              <Link
                key={run.id}
                href={run.status === "completed" ? `/report/${run.id}` : `/run/${run.id}`}
                className="flex items-center justify-between rounded-xl border border-border/60 p-3 transition-colors hover:bg-accent"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{run.url}</p>
                  <p className="text-xs text-muted-foreground">
                    {run.preset} · {formatDistanceToNow(run.startedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={run.status === "completed" ? "default" : "destructive"}>
                    {run.status === "completed" ? "Selesai" : "Gagal"}
                  </Badge>
                  {run.status === "completed" && (
                    <span className="text-sm font-bold tabular-nums">{run.overallScore}</span>
                  )}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderKanban className="h-4 w-4 text-primary" />
              Project
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between rounded-lg border border-border/60 p-3"
              >
                <span className="text-sm font-medium">{project.name}</span>
                <span className="text-xs text-muted-foreground">{project.runs} tes</span>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <Plus className="mr-1.5 h-4 w-4" />
              Buat Project
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
