import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DynamicIcon } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AboutPage() {
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
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Konten tentang belum tersedia.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <Badge variant="secondary">Tentang WebQA</Badge>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          {about.pageTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {about.pageSubtitle}
        </p>
      </div>

      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold">Apa saja yang diuji?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {about.testTypes.map((type) => (
            <Card key={type.id} className="border-border/60 bg-card/50">
              <CardContent className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <DynamicIcon name={type.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{type.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {type.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold">{about.howItWorksTitle}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {about.howItWorksSteps.map((step) => (
            <Card key={step.id} className="relative overflow-hidden">
              <CardContent className="p-5">
                <span className="absolute right-3 top-2 text-4xl font-extrabold text-primary/10">
                  {step.stepNumber}
                </span>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold">{about.benefitsTitle}</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {about.aboutBenefits.map((benefit) => (
            <Card key={benefit.id} className="border-border/60">
              <CardContent className="flex items-start gap-3 p-4">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <p className="text-sm">{benefit.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold">{about.roadmapTitle}</h2>
        <p className="mt-2 text-center text-muted-foreground">
          {about.roadmapSubtitle}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {about.roadmapItems.map((item) => (
            <Card key={item.id} className="border-border/60 bg-card/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    <DynamicIcon name={item.icon} className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="mt-16 flex justify-center">
        <Button asChild size="lg">
          <Link href="/">Coba Periksa Website</Link>
        </Button>
      </div>
    </div>
  );
}
