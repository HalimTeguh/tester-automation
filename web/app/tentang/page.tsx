import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DynamicIcon } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default async function TentangPage() {
  const about = await prisma.aboutContent.findFirst({
    where: { isActive: true },
    include: {
      testTypes: { orderBy: { order: "asc" } },
      howItWorksSteps: { orderBy: { stepNumber: "asc" } },
      aboutBenefits: { orderBy: { order: "asc" } },
      roadmapItems: { orderBy: { order: "asc" } },
    },
  });

  if (!about) {
    return <div className="p-8 text-center">Konten belum tersedia.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <Badge variant="secondary" className="mb-4">
          Tentang WebQA
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {about.pageTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {about.pageSubtitle}
        </p>
      </div>

      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold tracking-tight">
          {about.howItWorksTitle}
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {about.howItWorksSteps.map((step) => (
            <Card key={step.id} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {step.stepNumber}
                </div>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold tracking-tight">
          Apa saja yang diuji?
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {about.testTypes.map((type) => (
            <Card key={type.id}>
              <CardHeader className="flex flex-row items-center gap-3 pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <DynamicIcon name={type.icon} className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{type.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold tracking-tight">
          {about.benefitsTitle}
        </h2>
        <ul className="mx-auto mt-8 max-w-2xl space-y-3">
          {about.aboutBenefits.map((benefit) => (
            <li
              key={benefit.id}
              className="flex items-start gap-3 rounded-xl border border-border bg-card/50 p-4"
            >
              <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm">{benefit.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">{about.roadmapTitle}</h2>
          <p className="mt-2 text-muted-foreground">{about.roadmapSubtitle}</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {about.roadmapItems.map((item) => (
            <Card key={item.id} className="border-border/60 bg-card/50">
              <CardContent className="flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <DynamicIcon name={item.icon} className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="mt-16 flex justify-center">
        <Button asChild size="lg">
          <Link href="/">Mulai Periksa Website</Link>
        </Button>
      </div>
    </div>
  );
}
