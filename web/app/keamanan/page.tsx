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

export default async function SecurityPage() {
  const security = await prisma.securityContent.findFirst({
    where: { isActive: true },
    include: {
      securityCommitments: { orderBy: { order: "asc" } },
      privacyCommitments: { orderBy: { number: "asc" } },
    },
  });

  if (!security) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Konten keamanan belum tersedia.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <Badge variant="secondary">Keamanan & Privasi</Badge>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          {security.pageTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
          {security.pageSubtitle}
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {security.securityCommitments.map((item) => (
          <Card key={item.id} className="border-border/60 bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <DynamicIcon name={item.icon} className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold">{security.commitmentTitle}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {security.privacyCommitments.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {item.number}
                  </span>
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="mt-16 flex justify-center">
        <Button asChild size="lg">
          <Link href="/">Mulai Pemeriksaan</Link>
        </Button>
      </div>
    </div>
  );
}
