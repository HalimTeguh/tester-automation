"use client";

import { presets } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Rocket, Sparkles, Search, ShieldCheck, Zap } from "lucide-react";

const icons: Record<string, React.ReactNode> = {
  "post-deploy": <Rocket className="h-4 w-4" />,
  "pre-launch": <Sparkles className="h-4 w-4" />,
  seo: <Search className="h-4 w-4" />,
  security: <ShieldCheck className="h-4 w-4" />,
  quick: <Zap className="h-4 w-4" />,
};

interface PresetSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function PresetSelector({ selected, onSelect }: PresetSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {presets.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onSelect(preset.id)}
          className={cn(
            "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
            selected === preset.id
              ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
              : "border-border/80 bg-background hover:border-primary/40 hover:bg-accent"
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              selected === preset.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {icons[preset.id]}
          </div>
          <div>
            <div className="text-sm font-semibold">{preset.label}</div>
            <div className="text-xs text-muted-foreground">{preset.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
