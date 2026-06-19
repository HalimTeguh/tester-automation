"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreRing } from "@/components/score-ring";
import { IssueList } from "@/components/issue-list";
import { mockReport } from "@/lib/mock-data";
import {
  ArrowLeft,
  Share2,
  Download,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

export default function ReportPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || mockReport.url;
  const allIssues = mockReport.results.flatMap((r) => r.issues);
  const critical = allIssues.filter((i) => i.severity === "critical").length;
  const warning = allIssues.filter((i) => i.severity === "warning").length;
  const info = allIssues.filter((i) => i.severity === "info").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Laporan Pemeriksaan</h1>
            <p className="text-sm text-muted-foreground">{url}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="mr-1.5 h-4 w-4" />
            Bagikan
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ScoreRing score={mockReport.overallScore} size={140} stroke={10} />
            <p className="mt-3 text-sm font-medium text-muted-foreground">Skor Keseluruhan</p>
            <Badge
              variant={mockReport.overallScore >= 80 ? "default" : "secondary"}
              className="mt-2"
            >
              {mockReport.overallScore >= 80 ? "Bagus" : "Perlu Perbaikan"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardContent className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
            {mockReport.results.map((result) => (
              <div key={result.category} className="flex flex-col items-center">
                <ScoreRing score={result.score} size={88} stroke={7} label={result.category} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 border-destructive/20 bg-destructive/5 p-4">
          <XIcon className="h-5 w-5 text-destructive" />
          <div>
            <p className="text-lg font-bold">{critical}</p>
            <p className="text-xs text-muted-foreground">Critical</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border-amber-500/20 bg-amber-500/5 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <div>
            <p className="text-lg font-bold">{warning}</p>
            <p className="text-xs text-muted-foreground">Warning</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border-blue-500/20 bg-blue-500/5 p-4">
          <Info className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-lg font-bold">{info}</p>
            <p className="text-xs text-muted-foreground">Info</p>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="issues" className="mt-8">
        <TabsList className="bg-muted">
          <TabsTrigger value="issues">Daftar Issue</TabsTrigger>
          <TabsTrigger value="ai">Tanya AI</TabsTrigger>
        </TabsList>
        <TabsContent value="issues" className="mt-4">
          <IssueList issues={allIssues} />
        </TabsContent>
        <TabsContent value="ai" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-primary" />
                Asisten Tester
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-muted p-4 text-sm">
                <p className="font-medium">Halo! Saya bisa menjelaskan hasil tes ini.</p>
                <p className="mt-1 text-muted-foreground">
                  Contoh: "Mengapa LCP saya tinggi?" atau "Bagaimana cara memperbaiki CSP header?"
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tanyakan sesuatu..."
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button size="sm">Kirim</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
