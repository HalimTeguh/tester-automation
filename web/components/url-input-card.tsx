"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PresetSelector } from "@/components/preset-selector";
import { presets } from "@/lib/mock-data";
import { ScanLine, Loader2 } from "lucide-react";

interface UrlInputCardProps {
  onStart?: (url: string, presetId: string) => void;
}

export function UrlInputCard({ onStart }: UrlInputCardProps) {
  const [url, setUrl] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("pre-launch");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setIsLoading(true);
    onStart?.(url, selectedPreset);
  };

  return (
    <Card className="w-full overflow-hidden border-border/80 bg-card shadow-lg shadow-primary/5">
      <CardContent className="p-5 sm:p-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
              <span className="text-sm font-medium">https://</span>
            </div>
            <Input
              type="text"
              placeholder="example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-14 rounded-xl border-border/80 bg-background pl-20 pr-4 text-base shadow-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary"
            />
          </div>

          <PresetSelector selected={selectedPreset} onSelect={setSelectedPreset} />

          <Button
            type="submit"
            size="lg"
            className="h-14 rounded-xl text-base font-semibold shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30"
            disabled={!url.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Memeriksa...
              </>
            ) : (
              <>
                <ScanLine className="mr-2 h-5 w-5" />
                Periksa Sekarang
              </>
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Hanya memindai situs publik yang kamu miliki atau punya izin.
        </p>
      </CardContent>
    </Card>
  );
}
