import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MousePointerClick,
  Gauge,
  Search,
  ShieldCheck,
  Activity,
  ListChecks,
  ArrowRight,
  Rocket,
  LineChart,
  Bell,
  Bug,
} from "lucide-react";

const testTypes = [
  {
    icon: <MousePointerClick className="h-5 w-5 text-primary" />,
    title: "Fungsionalitas",
    desc: "Memeriksa tautan yang rusak, formulir yang tidak berfungsi, gambar tanpa deskripsi, dan elemen interaktif yang bermasalah.",
  },
  {
    icon: <Gauge className="h-5 w-5 text-primary" />,
    title: "Performa",
    desc: "Mengukur kecepatan muat halaman, ukuran resource, dan pengalaman pengguna di perangkat dengan koneksi lambat.",
  },
  {
    icon: <Search className="h-5 w-5 text-primary" />,
    title: "SEO",
    desc: "Memastikan halaman memiliki judul, deskripsi, heading, dan struktur konten yang mudah dipahami mesin pencari.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-primary" />,
    title: "Keamanan Dasar",
    desc: "Memeriksa konfigurasi header keamanan dan celah umum yang bisa meningkatkan risiko serangan sederhana.",
  },
  {
    icon: <Activity className="h-5 w-5 text-primary" />,
    title: "Uji Beban",
    desc: "Mensimulasikan banyak pengunjung sekaligus untuk melihat apakah website tetap stabil saat traffic tinggi.",
  },
];

const steps = [
  {
    step: "1",
    title: "Masukkan URL",
    desc: "Ketik alamat website yang ingin kamu periksa.",
  },
  {
    step: "2",
    title: "Pilih jenis tes",
    desc: "Pilih preset sesuai kebutuhan: setelah deploy, sebelum launch, SEO, keamanan, ringkas, atau uji beban.",
  },
  {
    step: "3",
    title: "Analisis otomatis",
    desc: "Sistem membaca halaman website dan mengumpulkan temuan berdasarkan kategori yang dipilih.",
  },
  {
    step: "4",
    title: "Dapatkan laporan",
    desc: "Lihat skor, daftar issue, dampaknya, dan langkah perbaikan yang bisa langsung disalin ke asisten AI.",
  },
];

const benefits = [
  "Menemukan masalah sebelum pengguna melihatnya.",
  "Meningkatkan kecepatan dan pengalaman pengguna.",
  "Mempermudah optimasi mesin pencari.",
  "Mengurangi risiko keamanan dasar yang sering terlewat.",
  "Menghemat waktu tim QA dan developer.",
];

const roadmaps = [
  {
    icon: <LineChart className="h-5 w-5 text-primary" />,
    title: "Monitoring performa real-time",
    desc: "Pantau kecepatan website secara berkala dan dapatkan notifikasi jika performa menurun.",
  },
  {
    icon: <Bug className="h-5 w-5 text-primary" />,
    title: "Report bug otomatis",
    desc: "Temuan error dan fungsionalitas rusak langsung dikumpulkan sebagai laporan bug yang terstruktur.",
  },
  {
    icon: <Bell className="h-5 w-5 text-primary" />,
    title: "Alert high latency",
    desc: "Dapatkan peringatan cepat saat waktu muat halaman melebihi ambang batas yang ditentukan.",
  },
  {
    icon: <Rocket className="h-5 w-5 text-primary" />,
    title: "Report masalah lain secara real-time",
    desc: "Dari error 500, broken link, hingga perubahan SEO yang tidak disengaja — semua dilaporkan langsung.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
          Tentang WebQA
        </Badge>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Asisten tester untuk website yang lebih baik
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          WebQA membantu developer, QA, dan pemilik website menemukan masalah
          fungsionalitas, performa, SEO, dan keamanan — lalu memberitahu cara
          memperbaikinya.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">Apa saja yang diuji?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testTypes.map((t) => (
            <Card key={t.title} className="border-border/60 bg-card/50">
              <CardContent className="flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  {t.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{t.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">Bagaimana cara kerjanya?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <Card key={s.step} className="border-border/60 bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                  {s.step}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <Card className="border-border/60 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="h-4 w-4 text-primary" />
              Kegunaan WebQA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {b}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">Pengembangan selanjutnya</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          WebQA akan terus berkembang ke arah pemantauan website yang aktif dan
          responsif:
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {roadmaps.map((r) => (
            <Card key={r.title} className="border-border/60 bg-card/50">
              <CardContent className="flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  {r.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{r.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="mt-10 flex justify-center">
        <Button asChild size="sm">
          <Link href="/">
            Coba periksa website sekarang
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
