"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreRing } from "@/components/score-ring";
import { IssueList } from "@/components/issue-list";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Share2,
  Download,
  MessageSquare,
  AlertTriangle,
  Info,
  XCircle,
  Copy,
  Check,
} from "lucide-react";

interface ApiIssue {
  id: string;
  category: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  impact: string;
  fix: string;
  code: string | null;
}

interface ApiTestResult {
  id: string;
  category: string;
  score: number | null;
  status: string;
  issues: ApiIssue[];
}

interface ApiTestRun {
  id: string;
  url: string;
  preset: string;
  status: string;
  overallScore: number | null;
  testResults: ApiTestResult[];
}

const categoryLabel: Record<string, string> = {
  functionality: "Fungsionalitas",
  performance: "Performa",
  seo: "SEO",
  security: "Keamanan",
};

const severityLabel: Record<string, string> = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
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

function buildAllIssuesPrompt(url: string, issues: ApiIssue[]): string {
  const lines = issues.map((issue, index) => {
    const codeBlock = issue.code ? `\nContoh kode:\n\`\`\`\n${issue.code}\n\`\`\`` : "";
    return `${index + 1}. ${issue.title} (${categoryLabel[issue.category]}, ${severityLabel[issue.severity]})\n   Deskripsi: ${issue.description}\n   Dampak: ${issue.impact}\n   Cara perbaiki: ${issue.fix}${codeBlock}`;
  });

  return `Saya menemukan ${issues.length} issue pada website ${url} setelah pemeriksaan WebQA:\n\n${lines.join("\n\n")}\n\nTolong jelaskan apa artinya, urutkan perbaikan dari yang paling penting, dan berikan contoh kode/lebih lengkap jika memungkinkan.`;
}

export default function ReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const urlParam = searchParams.get("url");

  const [run, setRun] = useState<ApiTestRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    fetch(`/api/test-runs/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ApiTestRun | null) => {
        if (data) {
          setRun(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function copyAllPrompts() {
    if (!run) return;
    const allIssues = run.testResults.flatMap((r) => r.issues);
    try {
      await navigator.clipboard.writeText(buildAllIssuesPrompt(run.url, allIssues));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      setCopiedAll(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="mt-4 h-40 w-full" />
        <Skeleton className="mt-4 h-40 w-full" />
      </div>
    );
  }

  if (!run) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Laporan tidak ditemukan</h1>
        <p className="mt-2 text-muted-foreground">
          ID pemeriksaan tidak valid atau belum selesai diproses.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Kembali ke Dashboard</Link>
        </Button>
      </div>
    );
  }

  const url = urlParam || run.url;
  const allIssues = run.testResults.flatMap((r) => r.issues);
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
            <ScoreRing
              score={run.overallScore ?? 0}
              size={140}
              stroke={10}
            />
            <p className="mt-3 text-base font-medium">Skor Keseluruhan</p>
            <Badge
              variant={run.overallScore && run.overallScore >= 80 ? "default" : "secondary"}
              className="mt-2"
            >
              {run.overallScore && run.overallScore >= 80 ? "Bagus" : "Perlu Perbaikan"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 flex flex-col justify-center">
          <CardContent className="grid h-full items-center gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
            {run.testResults.map((result) => (
              <div key={result.id} className="flex flex-col items-center">
                <ScoreRing
                  score={result.score ?? 0}
                  size={88}
                  stroke={7}
                  label={categoryLabel[result.category]}
                  summary={getCategorySummary(
                    result.category,
                    result.score ?? 0,
                    result.issues.length
                  )}
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

      <Tabs defaultValue="issues" className="mt-8">
        <TabsList className="bg-muted">
          <TabsTrigger value="issues">Daftar Issue</TabsTrigger>
          <TabsTrigger value="ai">Tanya AI</TabsTrigger>
        </TabsList>
        <TabsContent value="issues" className="mt-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {allIssues.length} issue ditemukan
            </p>
            <Button variant="outline" size="sm" onClick={copyAllPrompts}>
              {copiedAll ? (
                <>
                  <Check className="mr-1.5 h-4 w-4" />
                  Tersalin
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-4 w-4" />
                  Salin Prompt Semua Issue
                </>
              )}
            </Button>
          </div>
          <IssueList
            issues={allIssues.map((i) => ({
              ...i,
              code: i.code ?? undefined,
            }))}
            url={url}
          />
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
                  Contoh: &quot;Mengapa LCP saya tinggi?&quot; atau &quot;Bagaimana cara memperbaiki CSP header?&quot;
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
