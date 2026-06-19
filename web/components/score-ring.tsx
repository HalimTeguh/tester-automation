"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScoreRingProps {
  score: number;
  size?: number;
  stroke?: number;
  className?: string;
  label?: string;
  summary?: string;
}

export function ScoreRing({ score, size = 96, stroke = 8, className, label, summary }: ScoreRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500";

  const numberSizeClass = size >= 120 ? "text-4xl" : size >= 88 ? "text-2xl" : "text-xl";

  const ring = (
    <div className="relative">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/60"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-1000 ease-out", color)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "font-bold tabular-nums leading-none drop-shadow-sm",
            numberSizeClass
          )}
        >
          {score}
        </span>
      </div>
    </div>
  );

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <div className={cn("inline-flex flex-col items-center", className)}>
          <TooltipTrigger asChild className="cursor-help">
            {ring}
          </TooltipTrigger>
          {label && (
            <span className="mt-2 w-full text-center text-sm font-medium text-muted-foreground">
              {label}
            </span>
          )}
        </div>
        {summary && (
          <TooltipContent
            side="bottom"
            className="max-w-xs border border-border bg-card p-3 text-center text-card-foreground shadow-lg"
          >
            <p className="font-semibold">{label}</p>
            <p className="mt-1 text-xs font-normal text-muted-foreground">{summary}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
