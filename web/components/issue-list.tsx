"use client";

import { Issue, Severity, TestCategory } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info, XCircle } from "lucide-react";

interface IssueListProps {
  issues: Issue[];
}

const severityConfig: Record<
  Severity,
  { label: string; icon: React.ReactNode; variant: "destructive" | "default" | "secondary" }
> = {
  critical: {
    label: "Critical",
    icon: <XCircle className="h-3.5 w-3.5" />,
    variant: "destructive",
  },
  warning: {
    label: "Warning",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    variant: "default",
  },
  info: {
    label: "Info",
    icon: <Info className="h-3.5 w-3.5" />,
    variant: "secondary",
  },
};

const categoryLabel: Record<TestCategory, string> = {
  functionality: "Fungsionalitas",
  performance: "Performa",
  seo: "SEO",
  security: "Keamanan",
};

export function IssueList({ issues }: IssueListProps) {
  const sorted = [...issues].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <Accordion type="multiple" className="space-y-3">
      {sorted.map((issue) => {
        const severity = severityConfig[issue.severity];
        return (
          <AccordionItem
            key={issue.id}
            value={issue.id}
            className="rounded-xl border border-border/80 bg-card shadow-sm"
          >
            <AccordionTrigger className="px-4 py-3 text-left hover:no-underline sm:px-5">
              <div className="flex flex-1 items-center gap-3 pr-2">
                <Badge variant={severity.variant} className="flex items-center gap-1 capitalize">
                  {severity.icon}
                  {severity.label}
                </Badge>
                <span className="text-sm font-medium sm:text-base">{issue.title}</span>
                <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
                  {categoryLabel[issue.category]}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 sm:px-5">
              <div className="space-y-3 text-sm">
                <p className="text-foreground/90">{issue.description}</p>
                <div className="rounded-lg bg-accent/50 p-3">
                  <p className="font-semibold text-accent-foreground">Mengapa penting?</p>
                  <p className="text-accent-foreground/80">{issue.impact}</p>
                </div>
                <div>
                  <p className="font-semibold">Cara perbaiki</p>
                  <p className="text-muted-foreground">{issue.fix}</p>
                </div>
                {issue.code && (
                  <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs">
                    <code>{issue.code}</code>
                  </pre>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
