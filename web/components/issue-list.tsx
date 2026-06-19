"use client";

import { useState } from "react";
import { Issue, Severity, TestCategory } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { AlertTriangle, Check, Copy, Info, XCircle } from "lucide-react";

interface IssueListProps {
  issues: Issue[];
  url?: string;
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

function buildPrompt(issue: Issue, url?: string): string {
  return `Saya sedang menguji website ${url || "saya"} menggunakan WebQA dan menemukan issue berikut:

Issue: ${issue.title}
Kategori: ${categoryLabel[issue.category]}
Severity: ${severityConfig[issue.severity].label}
Deskripsi: ${issue.description}
Dampak: ${issue.impact}
Cara perbaiki yang disarankan: ${issue.fix}${
    issue.code ? `\n\nContoh kode:\n\`\`\`\n${issue.code}\n\`\`\`` : ""
  }

Tolong jelaskan apa artinya, urutkan langkah perbaikan dari yang paling penting, dan berikan contoh kode yang lebih lengkap jika memungkinkan.`;
}

export function IssueList({ issues, url }: IssueListProps) {
  const sorted = [...issues].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyPrompt(issue: Issue) {
    try {
      await navigator.clipboard.writeText(buildPrompt(issue, url));
      setCopiedId(issue.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
      setCopiedId(null);
    }
  }

  return (
    <Accordion type="multiple" className="space-y-3">
      {sorted.map((issue) => {
        const severity = severityConfig[issue.severity];
        const prompt = buildPrompt(issue, url);
        const isCopied = copiedId === issue.id;

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

                <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Prompt untuk AI
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => copyPrompt(issue)}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Salin Prompt
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md bg-background p-3 font-mono text-xs leading-relaxed text-foreground/90">
                    {prompt}
                  </pre>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
