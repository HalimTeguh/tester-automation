"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UrlInputCard } from "@/components/url-input-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicIcon } from "@/lib/icons";
import { Rocket } from "lucide-react";

interface CompanyProfile {
  id: string;
  siteName: string;
  homeTitle: string;
  homeSubtitle: string;
  heroBadgeText: string;
  ctaText: string;
  disclaimerText: string;
  footerText: string;
  homeFeatures: { id: string; icon: string; title: string; description: string; order: number }[];
  trustBadges: { id: string; icon: string; label: string; order: number }[];
}

interface PublicSettings {
  theme: {
    primary: string;
  } | null;
}

const fallbackHeroIcon = Rocket;

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/company-profile")
      .then((res) => res.json())
      .then((data: CompanyProfile) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleStart = (url: string, presetId: string) => {
    if (presetId === "load-test") {
      router.push(`/load-test?url=${encodeURIComponent(url)}`);
      return;
    }
    router.push(`/run/demo?url=${encodeURIComponent(url)}&preset=${presetId}`);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-4 h-12 w-3/4" />
          <Skeleton className="mt-4 h-6 w-1/2" />
          <Skeleton className="mt-8 h-40 w-full max-w-xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Gagal memuat konten. Coba muat ulang halaman.</p>
      </div>
    );
  }

  const HeroIcon = fallbackHeroIcon;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <Badge variant="secondary" className="mb-4 gap-1.5">
          <HeroIcon className="h-3.5 w-3.5" />
          {profile.heroBadgeText}
        </Badge>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          {profile.homeTitle}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {profile.homeSubtitle}
        </p>
      </div>

      <div className="mt-10 flex justify-center">
        <UrlInputCard onStart={handleStart} ctaText={profile.ctaText} />
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        {profile.disclaimerText}
      </p>

      {profile.trustBadges.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {profile.trustBadges.map((badge) => (
            <Badge
              key={badge.id}
              variant="outline"
              className="gap-1.5 px-3 py-1.5 text-xs"
            >
              <DynamicIcon name={badge.icon} className="h-3.5 w-3.5" />
              {badge.label}
            </Badge>
          ))}
        </div>
      )}

      {profile.homeFeatures.length > 0 && (
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {profile.homeFeatures.map((feature) => (
            <Card key={feature.id} className="border-border/60 bg-card/50">
              <CardContent className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <DynamicIcon name={feature.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <footer className="mt-20 border-t border-border pt-8 text-center text-sm text-muted-foreground">
        {profile.footerText}
      </footer>
    </div>
  );
}
