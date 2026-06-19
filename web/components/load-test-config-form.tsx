"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Activity, AlertTriangle, Gauge, Clock, Users } from "lucide-react";

interface LoadTestConfigFormProps {
  initialUrl: string;
}

export function LoadTestConfigForm({ initialUrl }: LoadTestConfigFormProps) {
  const router = useRouter();

  const [url, setUrl] = useState(initialUrl);
  const [vus, setVus] = useState(50);
  const [duration, setDuration] = useState(60);
  const [rampUp, setRampUp] = useState(15);
  const [maxRps, setMaxRps] = useState(50);
  const [paths, setPaths] = useState("/\n/keamanan\n/dashboard");

  const estimatedRequests = Math.min(vus * (duration / rampUp) * 3, maxRps * duration);

  function handleStart() {
    if (!url.trim()) return;
    const q = new URLSearchParams();
    q.set("url", url);
    q.set("vus", String(vus));
    q.set("duration", String(duration));
    q.set("ramp", String(rampUp));
    q.set("maxRps", String(maxRps));
    q.set("paths", paths);
    router.push(`/load-test/run/demo?${q.toString()}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Uji Beban Website</h1>
          <p className="text-sm text-muted-foreground">Stress test untuk website yang akan kamu QA.</p>
        </div>
      </div>

      <Card className="mt-6 border-border/80 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" />
            Konfigurasi Load Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="target-url">Target URL</Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
                <span className="text-sm font-medium">https://</span>
              </div>
              <Input
                id="target-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com"
                className="h-12 pl-20"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Pastikan kamu memiliki izin untuk menguji website ini.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Virtual Users
              </Label>
              <Badge variant="secondary">{vus} VU</Badge>
            </div>
            <Slider value={[vus]} onValueChange={([v]) => setVus(v)} min={10} max={500} step={10} />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Durasi
                </Label>
                <Badge variant="secondary">{duration} detik</Badge>
              </div>
              <Slider
                value={[duration]}
                onValueChange={([v]) => setDuration(v)}
                min={10}
                max={300}
                step={10}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  Ramp-up
                </Label>
                <Badge variant="secondary">{rampUp} detik</Badge>
              </div>
              <Slider
                value={[rampUp]}
                onValueChange={([v]) => setRampUp(Math.min(v, duration))}
                min={5}
                max={duration}
                step={5}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Max requests per detik</Label>
              <Badge variant="secondary">{maxRps} RPS</Badge>
            </div>
            <Slider value={[maxRps]} onValueChange={([v]) => setMaxRps(v)} min={10} max={500} step={10} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paths">Path yang diuji (satu per baris)</Label>
            <textarea
              id="paths"
              value={paths}
              onChange={(e) => setPaths(e.target.value)}
              className="min-h-[96px] w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
              <div className="text-sm">
                <p className="font-semibold text-amber-700 dark:text-amber-400">Peringatan penggunaan</p>
                <p className="text-amber-700/80 dark:text-amber-400/80">
                  Fitur ini mensimulasikan banyak pengunjung ke website target. Gunakan hanya pada situs yang kamu
                  miliki atau sudah mendapat izin. Untuk demo UI, load test ini belum benar-benar mengirim traffic.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-4">
            <div>
              <p className="text-sm font-semibold">Estimasi request</p>
              <p className="text-xs text-muted-foreground">
                ~{Math.round(estimatedRequests).toLocaleString("id-ID")} request total
              </p>
            </div>
            <Button onClick={handleStart} disabled={!url.trim()}>
              <Activity className="mr-1.5 h-4 w-4" />
              Mulai Uji Beban
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
