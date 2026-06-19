import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DynamicIcon } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function KeamananPage() {
  const security = await prisma.securityContent.findFirst({
    where: { isActive: true },
    include: {
      securityCommitments: { orderBy: { order: "asc" } },
      privacyCommitments: { orderBy: { number: "asc" } },
    },
  });

  if (!security) {
    return <div className="p-8 text-center">Konten keamanan belum tersedia.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <Badge variant="secondary" className="mb-4">
          Keamanan & Privasi
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {security.pageTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
          {security.pageSubtitle}
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {security.securityCommitments.map((item) => (
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

      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold tracking-tight">
          {security.commitmentTitle}
        </h2>
        <div className="mt-8 space-y-4">
          {security.privacyCommitments.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 rounded-xl border border-border bg-card/50 p-5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                {item.number}
              </div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/tentang">Pelajari cara kerjanya</Link>
        </Button>
      </div>
    </div>
  );
}
