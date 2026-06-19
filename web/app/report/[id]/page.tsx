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
  AlertTriangle,
  Info,
  XCircle,
  MousePointerClick,
  Gauge,
  Search,
  ShieldCheck,
} from "lucide-react";

const categoryLabel: Record<string, string> = {
  functionality: "Fungsionalitas",
  performance: "Performa",
  seo: "SEO",
  security: "Keamanan",
};

const categoryIcons: Record<string, React.ReactNode> = {
  functionality: <MousePointerClick className="h-5 w-5" />,
  performance: <Gauge className="h-5 w-5" />,
  seo: <Search className="h-5 w-5" />,
  security: <ShieldCheck className="h-5 w-5" />,
};

function getCategorySummary(category: string, score: number, issueCount: number): string {
  const label = categoryLabel[category];
  if (score >= 80) {
    return `${label} berada dalam kondisi baik. Hanya ada temuan kecil yang perlu ditindaklanjuti.`;
  }
  if (score >= 60) {
    return `${label} cukup baik, tetapi terdapat ${issueCount} temuan yang sebaiknya diperbaiki untuk meningkatkan kualitas website.`;
  }
  return `${label} memerlukan perhatian serius. Terdapat ${issueCount} temuan signifikan yang berpotensi berdampak buruk pada pengguna.`;
}

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
        <Card className="lg:col-span-1 flex flex-col justify-center">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ScoreRing score={mockReport.overallScore} size={140} stroke={10} />
            <p className="mt-3 text-base font-medium">Skor Keseluruhan</p>
            <Badge
              variant={mockReport.overallScore >= 80 ? "default" : "secondary"}
              className="mt-2"
            >
              {mockReport.overallScore >= 80 ? "Bagus" : "Perlu Perbaikan"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 flex flex-col justify-center">
          <CardContent className="grid h-full items-center gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
            {mockReport.results.map((result) => (
              <div key={result.category} className="flex flex-col items-center">
                <ScoreRing
                  score={result.score}
                  size={88}
                  stroke={7}
                  label={categoryLabel[result.category]}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Card className="flex flex-col items-center justify-center border-destructive/20 bg-destructive/5 p-5 text-center">
          <XCircle className="h-6 w-6 text-destructive" />
          <p className="mt-2 text-2xl font-bold">{critical}</p>
          <p className="text-sm text-muted-foreground">Critical</p>
        </Card>
        <Card className="flex flex-col items-center justify-center border-amber-500/20 bg-amber-500/5 p-5 text-center">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          <p className="mt-2 text-2xl font-bold">{warning}</p>
          <p className="text-sm text-muted-foreground">Warning</p>
        </Card>
        <Card className="flex flex-col items-center justify-center border-blue-500/20 bg-blue-500/5 p-5 text-center">
          <Info className="h-6 w-6 text-blue-500" />
          <p className="mt-2 text-2xl font-bold">{info}</p>
          <p className="text-sm text-muted-foreground">Info</p>
        </Card>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-bold tracking-tight">Ringkasan per kategori</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {mockReport.results.map((result) => {
            const issueCount = result.issues.length;
            return (
              <Card key={result.category} className="border-border/60 bg-card/50">
                <CardContent className="flex gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {categoryIcons[result.category]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{categoryLabel[result.category]}</h3>
                      <Badge variant="secondary">{result.score}/100</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {getCategorySummary(result.category, result.score, issueCount)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Tabs defaultValue="issues" className="mt-8">
        <TabsList className="bg-muted">
          <TabsTrigger value="issues">Daftar Issue</TabsTrigger>
          <TabsTrigger value="ai">Tanya AI</TabsTrigger>
        </TabsList>
        <TabsContent value="issues" className="mt-4">
          <IssueList issues={allIssues} url={url} />
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
