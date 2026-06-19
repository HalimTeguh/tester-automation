"use client";

import { useRouter } from "next/navigation";
import { UrlInputCard } from "@/components/url-input-card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, Zap, Lock, Eye } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const handleStart = (url: string, presetId: string) => {
    if (presetId === "load-test") {
      router.push(`/load-test?url=${encodeURIComponent(url)}`);
      return;
    }
    router.push(`/run/demo?url=${encodeURIComponent(url)}&preset=${presetId}`);
  };

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20 lg:px-8 lg:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1 text-xs font-medium">
            ✨ Versi awal — UI/UX demo
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Periksa website kamu dalam{" "}
            <span className="text-primary">3 menit</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            WebQA adalah asisten tester yang memeriksa fungsionalitas, performa, SEO, dan keamanan dasar website — lalu memberitahu apa yang salah dan cara memperbaikinya.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <UrlInputCard onStart={handleStart} />
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
          <div className="flex flex-col items-center rounded-xl border border-border/60 bg-card/50 p-4 text-center">
            <Clock className="h-6 w-6 text-primary" />
            <h3 className="mt-2 text-sm font-semibold">Cepat</h3>
            <p className="mt-1 text-xs text-muted-foreground">Hasil dalam hitungan menit, tanpa setup.</p>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-border/60 bg-card/50 p-4 text-center">
            <Zap className="h-6 w-6 text-primary" />
            <h3 className="mt-2 text-sm font-semibold">Mudah Dipahami</h3>
            <p className="mt-1 text-xs text-muted-foreground">Penjelasan manusiawi + rekomendasi perbaikan.</p>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-border/60 bg-card/50 p-4 text-center">
            <Lock className="h-6 w-6 text-primary" />
            <h3 className="mt-2 text-sm font-semibold">Aman</h3>
            <p className="mt-1 text-xs text-muted-foreground">Hanya membaca halaman, tanpa serangan aktif.</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Passive scan only</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1.5">
            <Eye className="h-3.5 w-3.5 text-primary" />
            <span>Data hanya untuk keperluan testing</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1.5">
            <Lock className="h-3.5 w-3.5 text-primary" />
            <span>Tidak menyimpan data sensitif</span>
          </div>
        </div>
      </section>
    </div>
  );
}
