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
  Sparkles,
  List,
  Route,
  CheckCircle2,
  Clock,
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

interface ApiScenarioStep {
  order: number;
  action: string;
  selector?: string | null;
  value?: string | null;
  assertionText?: string | null;
  waitMs?: number | null;
}

interface ApiScenario {
  id: string;
  name: string;
  description: string;
  startUrl: string;
  steps: ApiScenarioStep[];
}

interface ApiScenarioResult {
  id: string;
  status: string;
  durationMs: number | null;
  errorMessage: string | null;
  screenshotPath: string | null;
  stepResults: string; // JSON
  testScenario: ApiScenario;
}

interface ApiTestRun {
  id: string;
  url: string;
  preset: string;
  status: string;
  overallScore: number | null;
  aiSummary: string | null;
  aiFixPlan: string | null;
  testResults: ApiTestResult[];
  scenarioResults: ApiScenarioResult[];
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

  if (run.status === "failed") {
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
        </div>

        <Card className="mt-8 border-destructive/20 bg-destructive/5">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <XCircle className="h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-lg font-semibold">Pemeriksaan Gagal</h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Website tidak dapat diakses atau mengalami error kritis saat pemeriksaan. Pastikan URL benar dan website dapat dijangkau.
            </p>
            {allIssues.length > 0 && (
              <div className="mt-6 w-full max-w-lg text-left">
                <IssueList
                  issues={allIssues.map((i) => ({
                    ...i,
                    code: i.code ?? undefined,
                  }))}
                  url={url}
                />
              </div>
            )}
            <Button asChild className="mt-6">
              <Link href="/">Coba Lagi</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      <Tabs defaultValue="ai" className="mt-8">
<<<<<<< HEAD
        <TabsList className="w-full gap-1 rounded-xl border bg-background p-1 shadow-sm sm:w-auto">
          <TabsTrigger
            value="ai"
            className="flex-1 gap-2 rounded-lg px-5 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm sm:flex-initial"
          >
            <Sparkles className="h-4 w-4" />
            Ringkasan AI
          </TabsTrigger>
          <TabsTrigger
            value="issues"
            className="flex-1 gap-2 rounded-lg px-5 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm sm:flex-initial"
          >
            <List className="h-4 w-4" />
            Daftar Issue
            <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-bold text-muted-foreground data-[state=active]:bg-primary-foreground data-[state=active]:text-primary">
              {allIssues.length}
            </span>
          </TabsTrigger>
=======
        <TabsList className="bg-muted">
          <TabsTrigger value="ai">Ringkasan AI</TabsTrigger>
          <TabsTrigger value="issues">Daftar Issue</TabsTrigger>
          <TabsTrigger value="scenarios">User Flow</TabsTrigger>
>>>>>>> 2f1c9191e0df6d64e01bcc39e4d6c3161f6ddea1
        </TabsList>

        <TabsContent value="ai" className="mt-5 space-y-5">
          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-primary" />
                Analisis AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {run.aiSummary ? (
                <div className="space-y-3 text-justify text-base leading-relaxed text-foreground">
                  {run.aiSummary.split("\n").map((p, i) =>
                    p.trim() ? (
                      <p key={i} className="indent-4">
                        {p}
                      </p>
                    ) : null
                  )}
                </div>
              ) : run.aiSummary === "" ? (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                  <p className="font-medium">Analisis AI gagal dihasilkan</p>
                  <p className="mt-1">
                    Model kemungkinan kehabisan token saat reasoning. Coba ganti ke{" "}
                    <code className="rounded bg-muted px-1 py-0.5">qwen-max</code> atau{" "}
                    <code className="rounded bg-muted px-1 py-0.5">qwen-plus</code> di{" "}
                    <code className="rounded bg-muted px-1 py-0.5">.env</code> lalu jalankan ulang tes.
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Ringkasan AI belum tersedia. Pastikan API key opencode.ai sudah dikonfigurasi di .env.
                </p>
              )}
            </CardContent>
          </Card>

          {run.aiFixPlan && (
            <Card className="border shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-base">Rencana Perbaikan Prioritas</CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <ol className="list-decimal space-y-3 pl-5 text-base leading-relaxed text-foreground">
                  {run.aiFixPlan
                    .split(/\n\s*(?=\d+[\.\)]\s)/)
                    .map((item) => item.trim())
                    .filter(Boolean)
                    .map((item, i) => (
                      <li key={i} className="pl-2 text-justify marker:font-semibold marker:text-primary">
                        {item.replace(/^\d+[\.\)]\s*/, "")}
                      </li>
                    ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="issues" className="mt-5">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-col gap-3 bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">Daftar Issue</CardTitle>
              <div className="flex items-center gap-3">
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
                      Salin Prompt
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <IssueList
                issues={allIssues.map((i) => ({
                  ...i,
                  code: i.code ?? undefined,
                }))}
                url={url}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="mt-4 space-y-4">
          {run.scenarioResults && run.scenarioResults.length > 0 ? (
            run.scenarioResults.map((sr) => {
              const steps: { order: number; action: string; selector?: string | null; value?: string | null; status: string; message?: string; durationMs: number }[] =
                sr.stepResults ? JSON.parse(sr.stepResults) : [];
              return (
                <Card key={sr.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Route className="h-4 w-4 text-primary" />
                      {sr.testScenario.name}
                      {sr.status === "passed" ? (
                        <Badge className="bg-green-600"><CheckCircle2 className="mr-1 h-3 w-3" /> Lolos</Badge>
                      ) : sr.status === "failed" ? (
                        <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Gagal</Badge>
                      ) : (
                        <Badge variant="secondary">Dilewati</Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{sr.testScenario.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {sr.durationMs ?? 0}ms</span>
                      <span>Start URL: {sr.testScenario.startUrl}</span>
                    </div>
                    {sr.errorMessage && (
                      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-destructive">
                        {sr.errorMessage}
                      </div>
                    )}
                    <div className="space-y-2">
                      {steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3 rounded-md border border-border p-3">
                          <div className="mt-0.5">
                            {step.status === "passed" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : step.status === "failed" ? <XCircle className="h-4 w-4 text-destructive" /> : <Info className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {idx + 1}. {step.action}
                              {step.selector && <span className="ml-2 font-normal text-muted-foreground">{step.selector}</span>}
                            </p>
                            {step.value && <p className="text-muted-foreground">Value: {step.value}</p>}
                            {step.message && <p className="text-muted-foreground">{step.message}</p>}
                            <p className="text-xs text-muted-foreground">{step.durationMs}ms</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {sr.screenshotPath && (
                      <div>
                        <p className="mb-2 font-medium">Screenshot:</p>
                        <img src={sr.screenshotPath} alt={`Screenshot ${sr.testScenario.name}`} className="rounded-md border border-border max-w-md" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Tidak ada user flow scenario yang dijalankan untuk tes ini.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
