"use client";

import { TestResult, TestCategory } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  MousePointerClick,
  Gauge,
  Search,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";

interface TestProgressPanelProps {
  results: TestResult[];
}

const categoryConfig: Record<
  TestCategory,
  { label: string; icon: React.ReactNode; color: string }
> = {
  functionality: {
    label: "Fungsionalitas",
    icon: <MousePointerClick className="h-5 w-5" />,
    color: "text-blue-500",
  },
  performance: {
    label: "Performa",
    icon: <Gauge className="h-5 w-5" />,
    color: "text-amber-500",
  },
  seo: {
    label: "SEO",
    icon: <Search className="h-5 w-5" />,
    color: "text-emerald-500",
  },
  security: {
    label: "Keamanan",
    icon: <ShieldCheck className="h-5 w-5" />,
    color: "text-rose-500",
  },
};

const statusIcon = (status: TestResult["status"]) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "running":
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    default:
      return <div className="h-4 w-4 rounded-full border border-muted-foreground/40" />;
  }
};

export function TestProgressPanel({ results }: TestProgressPanelProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {results.map((result) => {
        const config = categoryConfig[result.category];
        return (
          <Card key={result.category} className="overflow-hidden border-border/80 bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-muted", config.color)}>
                  {config.icon}
                </div>
                {statusIcon(result.status)}
              </div>
              <CardTitle className="mt-3 text-sm font-semibold">{config.label}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="mb-2 flex items-end justify-between">
                <span className="text-xs text-muted-foreground">
                  {result.status === "completed"
                    ? "Selesai"
                    : result.status === "running"
                    ? "Berjalan..."
                    : "Menunggu"}
                </span>
                <span className="text-lg font-bold tabular-nums">
                  {result.status === "completed" ? result.score : "—"}
                </span>
              </div>
              <Progress value={result.progress} className="h-2" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
