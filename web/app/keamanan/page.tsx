import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ShieldCheck,
  Eye,
  Lock,
  Server,
  Users,
  Zap,
  FileText,
  ArrowRight,
  Activity,
} from "lucide-react";

interface LoadSummary {
  generatedAt: string;
  target: string;
  durationSeconds: number;
  scenarios: string[];
  requests: { total: number; perSecond: number };
  latencyMs: { min: number; max: number; median: number; p95: number; p99: number };
  errors: { count: number; rate: number };
  statusCodes: Record<string, number>;
  note?: string;
}

async function getSummary(): Promise<LoadSummary | null> {
  try {
    const file = path.join(process.cwd(), "public", "load-test-summary.json");
    const raw = await fs.readFile(file, "utf-8");
    const data = JSON.parse(raw) as LoadSummary;
    return data.generatedAt ? data : null;
  } catch {
    return null;
  }
}

const trustItems = [
  {
    icon: <Eye className="h-5 w-5 text-primary" />,
    title: "Passive scan only",
    desc: "WebQA hanya membaca halaman publik website kamu. Kami tidak mengirim serangan aktif, tidak mencoba login, dan tidak mengubah data.",
  },
  {
    icon: <Lock className="h-5 w-5 text-primary" />,
    title: "Tidak menyimpan data sensitif",
    desc: "URL yang diuji, hasil scan, dan laporan dihapus setelah tidak dibutuhkan. Kami tidak meminta password, API key, atau akses server.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-primary" />,
    title: "Rekomendasi, bukan exploit",
    desc: "Setiap issue disertai penjelasan dan cara perbaikan. Tidak ada payload berbahaya yang dijalankan terhadap website target.",
  },
  {
    icon: <Server className="h-5 w-5 text-primary" />,
    title: "Terisolasi per job",
    desc: "Setiap scan berjalan dalam environment terpisah. Satu scan yang berat tidak akan mengganggu scan user lain.",
  },
];

export default async function SecurityPage() {
  const summary = await getSummary();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
          Transparansi &amp; Kepercayaan
        </Badge>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Aman, privat, dan siap traffic tinggi
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          WebQA dirancang supaya kamu merasa nyaman saat memeriksa website — bahkan saat banyak user lain menggunakan platform secara bersamaan.
        </p>
      </div>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {trustItems.map((item) => (
          <Card key={item.title} className="border-border/60 bg-card/50">
            <CardContent className="flex gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                {item.icon}
              </div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Hasil Uji Beban</h2>
          <Button asChild variant="outline" size="sm">
            <Link
              href="https://github.com/IswaraFreedom/tester-automation/blob/main/docs/LOAD_TEST_REPORT.md"
              target="_blank"
              rel="noreferrer"
            >
              <FileText className="mr-1.5 h-4 w-4" />
              Lihat laporan lengkap
            </Link>
          </Button>
        </div>

        {summary ? (
          <Card className="mt-4 border-border/60 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" />
                Ringkasan load test terakhir
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border/60 bg-background p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total request</p>
                  <p className="text-xl font-bold">{summary.requests.total.toLocaleString("id-ID")}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-background p-3 text-center">
                  <p className="text-xs text-muted-foreground">Rata-rata/detik</p>
                  <p className="text-xl font-bold">{summary.requests.perSecond.toFixed(1)}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-background p-3 text-center">
                  <p className="text-xs text-muted-foreground">Latensi p95</p>
                  <p className="text-xl font-bold">{summary.latencyMs.p95.toFixed(0)} ms</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-background p-3 text-center">
                  <p className="text-xs text-muted-foreground">Error rate</p>
                  <p className="text-xl font-bold">{(summary.errors.rate * 100).toFixed(2)}%</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Dijalankan pada {summary.generatedAt} terhadap {summary.target}. Durasi:{" "}
                {summary.durationSeconds} detik.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-4 border-border/60 bg-card/50">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Laporan uji beban belum tersedia. Akan diperbarui setelah load test dijalankan.
            </CardContent>
          </Card>
        )}
      </section>

      <section className="mt-10 rounded-2xl border border-border/60 bg-primary/5 p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Bagaimana kami menangani traffic membludak?</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <Zap className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  <strong>Rate limiting per user</strong> — setiap user punya batas request untuk mencegah satu orang menghabiskan resource.
                </span>
              </li>
              <li className="flex gap-2">
                <Users className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  <strong>Queue system</strong> — saat scanner penuh, scan masuk antrean dengan estimasi waktu tunggu.
                </span>
              </li>
              <li className="flex gap-2">
                <Server className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  <strong>Worker terisolasi</strong> — setiap scan berjalan di worker terpisah; satu scan berat tidak merusak yang lain.
                </span>
              </li>
              <li className="flex gap-2">
                <Activity className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  <strong>Monitoring &amp; autoscale</strong> — metrik latensi, error, dan queue diobservasi agar scaler otomatis bisa aktif.
                </span>
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-border/60 bg-background p-5">
            <p className="text-sm font-semibold">Arsitektur anti-bludak (rencana)</p>
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                User → API Gateway (rate limit)
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Queue (Redis / Supabase Realtime)
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Worker pool (Playwright, Lighthouse, ZAP)
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Cache hasil &amp; notifikasi ke user
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-10 flex justify-center">
        <Button asChild size="sm">
          <Link href="/">
            Kembali ke beranda
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
