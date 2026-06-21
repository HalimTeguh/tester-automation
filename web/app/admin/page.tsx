"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Palette,
  Home,
  Info,
  Shield,
  Webhook,
  Users,
  Save,
  Plus,
  Trash2,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlayCircle,
  Activity,
  ExternalLink,
  Search,
  Brain,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
}

interface Webhook {
  id: string;
  url: string;
  secret: string;
  events: string;
  isActive: boolean;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Kelola seluruh konten, pengguna, dan pengaturan WebQA.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 flex flex-wrap gap-2 bg-muted">
          <TabsTrigger value="dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</TabsTrigger>
          <TabsTrigger value="theme"><Palette className="mr-2 h-4 w-4" /> Tema</TabsTrigger>
          <TabsTrigger value="home"><Home className="mr-2 h-4 w-4" /> Home</TabsTrigger>
          <TabsTrigger value="about"><Info className="mr-2 h-4 w-4" /> Tentang</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4" /> Keamanan</TabsTrigger>
          <TabsTrigger value="ai-config"><Brain className="mr-2 h-4 w-4" /> AI</TabsTrigger>
          <TabsTrigger value="webhooks"><Webhook className="mr-2 h-4 w-4" /> Webhooks</TabsTrigger>
          <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" /> Pengguna</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard"><DashboardTab /></TabsContent>
        <TabsContent value="theme"><ThemeTab /></TabsContent>
        <TabsContent value="home"><HomeTab /></TabsContent>
        <TabsContent value="about"><AboutTab /></TabsContent>
        <TabsContent value="security"><SecurityTab /></TabsContent>
        <TabsContent value="ai-config"><AiConfigTab /></TabsContent>
        <TabsContent value="webhooks"><WebhooksTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Dashboard ----------
interface AdminTestRun {
  id: string;
  url: string;
  preset: string;
  status: string;
  overallScore: number | null;
  startedAt: string;
  completedAt: string | null;
  user: { id: string; name: string; email: string } | null;
  testResults: { id: string; category: string; score: number | null; status: string }[];
}

interface AdminLoadTest {
  id: string;
  url: string;
  vus: number;
  duration: number;
  status: string;
  createdAt: string;
  completedAt: string | null;
  user: { id: string; name: string; email: string } | null;
}

function DashboardTab() {
  const [stats, setStats] = useState({ users: 0, activeUsers: 0, tests: 0, avgScore: 0 });
  const [testRuns, setTestRuns] = useState<AdminTestRun[]>([]);
  const [loadTests, setLoadTests] = useState<AdminLoadTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "running" | "completed" | "failed">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/admin/test-runs").then((r) => r.json()),
    ])
      .then(([users, adminData]) => {
        const active = users.filter((u: User) => u.isActive).length;
        const tests: AdminTestRun[] = adminData.testRuns || [];
        const scores = tests.filter((t) => t.overallScore != null).map((t) => t.overallScore!);
        setStats({
          users: users.length,
          activeUsers: active,
          tests: tests.length,
          avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        });
        setTestRuns(tests);
        setLoadTests(adminData.loadTests || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Gagal memuat statistik");
        setLoading(false);
      });
  }, []);

  const filteredTests = testRuns.filter((t) => {
    const matchStatus = filter === "all" ? true : t.status === filter;
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      t.url.toLowerCase().includes(term) ||
      t.user?.name?.toLowerCase().includes(term) ||
      t.user?.email?.toLowerCase().includes(term) ||
      t.preset.toLowerCase().includes(term);
    return matchStatus && matchSearch;
  });

  const statusCounts = {
    all: testRuns.length,
    pending: testRuns.filter((t) => t.status === "pending").length,
    running: testRuns.filter((t) => t.status === "running").length,
    completed: testRuns.filter((t) => t.status === "completed").length,
    failed: testRuns.filter((t) => t.status === "failed").length,
  };

  const statusConfig: Record<string, { label: string; icon: React.ElementType; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "Pending", icon: Clock, variant: "secondary" },
    running: { label: "Running", icon: PlayCircle, variant: "default" },
    completed: { label: "Selesai", icon: CheckCircle2, variant: "default" },
    failed: { label: "Gagal", icon: XCircle, variant: "destructive" },
  };

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Pengguna" value={stats.users} icon={Users} />
        <StatCard title="Pengguna Aktif" value={stats.activeUsers} icon={Activity} />
        <StatCard title="Total Tes" value={stats.tests} icon={LayoutDashboard} />
        <StatCard title="Skor Rata-rata" value={stats.avgScore} suffix="/100" icon={CheckCircle2} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Pemantauan Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {(["all", "pending", "running", "completed", "failed"] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={filter === s ? "default" : "outline"}
                  onClick={() => setFilter(s)}
                  className="gap-1.5"
                >
                  {s === "all" && <LayoutDashboard className="h-3.5 w-3.5" />}
                  {s === "pending" && <Clock className="h-3.5 w-3.5" />}
                  {s === "running" && <PlayCircle className="h-3.5 w-3.5" />}
                  {s === "completed" && <CheckCircle2 className="h-3.5 w-3.5" />}
                  {s === "failed" && <XCircle className="h-3.5 w-3.5" />}
                  {s === "all" ? "Semua" : statusConfig[s]?.label || s}
                  <span className="ml-1 rounded-full bg-background px-1.5 py-0.5 text-xs font-medium text-foreground">
                    {statusCounts[s]}
                  </span>
                </Button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari URL, user, preset..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background py-1 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-64"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Preset</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Skor</TableHead>
                  <TableHead>Waktu Mulai</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      Tidak ada data testing.
                    </TableCell>
                  </TableRow>
                )}
                {filteredTests.map((t) => {
                  const cfg = statusConfig[t.status] || { label: t.status, icon: AlertCircle, variant: "outline" };
                  const StatusIcon = cfg.icon;
                  const started = new Date(t.startedAt);
                  const completed = t.completedAt ? new Date(t.completedAt) : null;
                  const duration = completed ? Math.round((completed.getTime() - started.getTime()) / 1000) : null;

                  return (
                    <TableRow key={t.id}>
                      <TableCell className="max-w-[200px] truncate font-medium" title={t.url}>
                        {t.url}
                      </TableCell>
                      <TableCell>
                        {t.user ? (
                          <div className="flex flex-col">
                            <span className="text-sm">{t.user.name}</span>
                            <span className="text-xs text-muted-foreground">{t.user.email}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Anonim</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t.preset}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {t.overallScore != null ? (
                          <span className={`font-semibold ${t.overallScore >= 80 ? "text-green-600" : t.overallScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                            {t.overallScore}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {started.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {duration != null ? `${duration}s` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(`/report/${t.id}`, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {loadTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Load Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Pengguna</TableHead>
                    <TableHead>VUs</TableHead>
                    <TableHead>Durasi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadTests.map((lt) => {
                    const ltStatusCfg = statusConfig[lt.status] || { label: lt.status, icon: AlertCircle, variant: "outline" };
                    const LtStatusIcon = ltStatusCfg.icon;
                    return (
                      <TableRow key={lt.id}>
                        <TableCell className="max-w-[200px] truncate font-medium" title={lt.url}>
                          {lt.url}
                        </TableCell>
                        <TableCell>
                          {lt.user ? (
                            <div className="flex flex-col">
                              <span className="text-sm">{lt.user.name}</span>
                              <span className="text-xs text-muted-foreground">{lt.user.email}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Anonim</span>
                          )}
                        </TableCell>
                        <TableCell>{lt.vus}</TableCell>
                        <TableCell>{lt.duration}s</TableCell>
                        <TableCell>
                          <Badge variant={ltStatusCfg.variant} className="gap-1">
                            <LtStatusIcon className="h-3 w-3" />
                            {ltStatusCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(lt.createdAt).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(`/load-test/report/${lt.id}`, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ title, value, suffix, icon: Icon }: { title: string; value: number; suffix?: string; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        <p className="mt-2 text-3xl font-bold">{value}{suffix}</p>
      </CardContent>
    </Card>
  );
}

// ---------- Theme ----------
function ThemeTab() {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => toast.error("Gagal memuat tema"));
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/settings/public", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (res.ok) toast.success("Tema disimpan");
    else toast.error("Gagal menyimpan tema");
  };

  if (!settings) return <Loader2 className="h-6 w-6 animate-spin" />;

  const theme = settings.themeConfig || {};
  const updateTheme = (key: string, value: string) => {
    setSettings({ ...settings, themeConfig: { ...theme, [key]: value } });
  };
  const updateSetting = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const colorFields = [
    ["primary", "Primary"],
    ["primaryForeground", "Primary Foreground"],
    ["secondary", "Secondary"],
    ["accent", "Accent"],
    ["background", "Background"],
    ["foreground", "Foreground"],
    ["muted", "Muted"],
    ["border", "Border"],
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Palette className="h-4 w-4" /> Pengaturan Tema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Nama Tema" value={theme.name || ""} onChange={(v) => updateTheme("name", v)} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {colorFields.map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-medium">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme[key] || "#000000"}
                  onChange={(e) => updateTheme(key, e.target.value)}
                  className="h-10 w-14 rounded border border-input bg-background"
                />
                <input
                  type="text"
                  value={theme[key] || ""}
                  onChange={(e) => updateTheme(key, e.target.value)}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default Preset" value={settings.defaultPreset || ""} onChange={(v) => updateSetting("defaultPreset", v)} />
          <Field label="Max Anonymous Tests" value={String(settings.maxAnonymousTests ?? 5)} onChange={(v) => updateSetting("maxAnonymousTests", Number(v))} type="number" />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={settings.allowAnonymousTest} onChange={(e) => updateSetting("allowAnonymousTest", e.target.checked)} />
            Izinkan tes anonim
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => updateSetting("maintenanceMode", e.target.checked)} />
            Maintenance mode
          </label>
        </div>
        <Button onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Menyimpan..." : "Simpan Tema"}</Button>
      </CardContent>
    </Card>
  );
}

// ---------- Home ----------
function HomeTab() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/home").then((r) => r.json()).then(setData).catch(() => toast.error("Gagal memuat home"));
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/home", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setSaving(false);
    if (res.ok) toast.success("Home disimpan");
    else toast.error("Gagal menyimpan home");
  };

  if (!data) return <Loader2 className="h-6 w-6 animate-spin" />;

  const update = (key: string, value: any) => setData({ ...data, [key]: value });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Konten Home</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Site Name" value={data.siteName || ""} onChange={(v) => update("siteName", v)} />
          <Field label="Home Title" value={data.homeTitle || ""} onChange={(v) => update("homeTitle", v)} />
          <Field label="Home Subtitle" value={data.homeSubtitle || ""} onChange={(v) => update("homeSubtitle", v)} textarea />
          <Field label="Hero Badge Text" value={data.heroBadgeText || ""} onChange={(v) => update("heroBadgeText", v)} />
          <Field label="CTA Text" value={data.ctaText || ""} onChange={(v) => update("ctaText", v)} />
          <Field label="Disclaimer Text" value={data.disclaimerText || ""} onChange={(v) => update("disclaimerText", v)} />
          <Field label="Footer Text" value={data.footerText || ""} onChange={(v) => update("footerText", v)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={data.isActive} onChange={(e) => update("isActive", e.target.checked)} />
            Aktif
          </label>
        </CardContent>
      </Card>

      <ListEditor
        title="Home Features"
        items={data.homeFeatures || []}
        onChange={(items) => update("homeFeatures", items)}
        fields={[
          { key: "icon", label: "Icon" },
          { key: "title", label: "Title" },
          { key: "description", label: "Description", textarea: true },
        ]}
      />

      <ListEditor
        title="Trust Badges"
        items={data.trustBadges || []}
        onChange={(items) => update("trustBadges", items)}
        fields={[
          { key: "icon", label: "Icon" },
          { key: "label", label: "Label" },
        ]}
      />

      <ListEditor
        title="Home Benefits"
        items={data.homeBenefits || []}
        onChange={(items) => update("homeBenefits", items)}
        fields={[
          { key: "icon", label: "Icon" },
          { key: "title", label: "Title" },
          { key: "value", label: "Value" },
          { key: "description", label: "Description", textarea: true },
        ]}
      />

      <Button onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Menyimpan..." : "Simpan Home"}</Button>
    </div>
  );
}

// ---------- About ----------
function AboutTab() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/about").then((r) => r.json()).then(setData).catch(() => toast.error("Gagal memuat tentang"));
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/about", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setSaving(false);
    if (res.ok) toast.success("Tentang disimpan");
    else toast.error("Gagal menyimpan tentang");
  };

  if (!data) return <Loader2 className="h-6 w-6 animate-spin" />;

  const update = (key: string, value: any) => setData({ ...data, [key]: value });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Konten Tentang</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Page Title" value={data.pageTitle || ""} onChange={(v) => update("pageTitle", v)} />
          <Field label="Page Subtitle" value={data.pageSubtitle || ""} onChange={(v) => update("pageSubtitle", v)} textarea />
          <Field label="How It Works Title" value={data.howItWorksTitle || ""} onChange={(v) => update("howItWorksTitle", v)} />
          <Field label="Benefits Title" value={data.benefitsTitle || ""} onChange={(v) => update("benefitsTitle", v)} />
          <Field label="Roadmap Title" value={data.roadmapTitle || ""} onChange={(v) => update("roadmapTitle", v)} />
          <Field label="Roadmap Subtitle" value={data.roadmapSubtitle || ""} onChange={(v) => update("roadmapSubtitle", v)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={data.isActive} onChange={(e) => update("isActive", e.target.checked)} />
            Aktif
          </label>
        </CardContent>
      </Card>

      <ListEditor title="Jenis Tes" items={data.testTypes || []} onChange={(items) => update("testTypes", items)} fields={[
        { key: "slug", label: "Slug" },
        { key: "icon", label: "Icon" },
        { key: "title", label: "Title" },
        { key: "description", label: "Description", textarea: true },
      ]} />

      <ListEditor title="Langkah-langkah" items={data.howItWorksSteps || []} onChange={(items) => update("howItWorksSteps", items)} fields={[
        { key: "title", label: "Title" },
        { key: "description", label: "Description", textarea: true },
      ]} />

      <ListEditor title="Benefit" items={data.aboutBenefits || []} onChange={(items) => update("aboutBenefits", items)} fields={[
        { key: "text", label: "Text", textarea: true },
      ]} />

      <ListEditor title="Roadmap" items={data.roadmapItems || []} onChange={(items) => update("roadmapItems", items)} fields={[
        { key: "icon", label: "Icon" },
        { key: "title", label: "Title" },
        { key: "description", label: "Description", textarea: true },
      ]} />

      <Button onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Menyimpan..." : "Simpan Tentang"}</Button>
    </div>
  );
}

// ---------- Security ----------
function SecurityTab() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/security").then((r) => r.json()).then(setData).catch(() => toast.error("Gagal memuat keamanan"));
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/security", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setSaving(false);
    if (res.ok) toast.success("Keamanan disimpan");
    else toast.error("Gagal menyimpan keamanan");
  };

  if (!data) return <Loader2 className="h-6 w-6 animate-spin" />;

  const update = (key: string, value: any) => setData({ ...data, [key]: value });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Konten Keamanan</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Page Title" value={data.pageTitle || ""} onChange={(v) => update("pageTitle", v)} />
          <Field label="Page Subtitle" value={data.pageSubtitle || ""} onChange={(v) => update("pageSubtitle", v)} textarea />
          <Field label="Commitment Title" value={data.commitmentTitle || ""} onChange={(v) => update("commitmentTitle", v)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={data.isActive} onChange={(e) => update("isActive", e.target.checked)} />
            Aktif
          </label>
        </CardContent>
      </Card>

      <ListEditor title="Komitmen Keamanan" items={data.securityCommitments || []} onChange={(items) => update("securityCommitments", items)} fields={[
        { key: "icon", label: "Icon" },
        { key: "title", label: "Title" },
        { key: "description", label: "Description", textarea: true },
      ]} />

      <ListEditor title="Komitmen Privasi" items={data.privacyCommitments || []} onChange={(items) => update("privacyCommitments", items)} fields={[
        { key: "title", label: "Title" },
        { key: "description", label: "Description", textarea: true },
      ]} />

      <Button onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Menyimpan..." : "Simpan Keamanan"}</Button>
    </div>
  );
}

// ---------- Webhooks ----------
function WebhooksTab() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/admin/webhooks")
      .then((r) => r.json())
      .then((data) => { setWebhooks(data); setLoading(false); })
      .catch(() => toast.error("Gagal memuat webhooks"));
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    const res = await fetch("/api/admin/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com/webhook", secret: "", events: "test.completed", isActive: true }),
    });
    if (res.ok) { toast.success("Webhook ditambahkan"); load(); }
    else toast.error("Gagal menambah webhook");
  };

  const update = async (id: string, body: Partial<Webhook>) => {
    const res = await fetch(`/api/admin/webhooks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { toast.success("Webhook diperbarui"); load(); }
    else toast.error("Gagal memperbarui webhook");
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus webhook ini?")) return;
    const res = await fetch(`/api/admin/webhooks/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Webhook dihapus"); load(); }
    else toast.error("Gagal menghapus webhook");
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Webhook Endpoints</CardTitle>
        <Button size="sm" onClick={add}><Plus className="mr-2 h-4 w-4" />Tambah</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.map((w) => (
              <TableRow key={w.id}>
                <TableCell>
                  <input
                    className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
                    value={w.url}
                    onChange={(e) => update(w.id, { ...w, url: e.target.value })}
                    onBlur={(e) => update(w.id, { url: e.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <input
                    className="w-40 rounded border border-input bg-background px-2 py-1 text-sm"
                    value={w.events}
                    onChange={(e) => update(w.id, { ...w, events: e.target.value })}
                    onBlur={(e) => update(w.id, { events: e.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <Badge variant={w.isActive ? "default" : "secondary"} className="cursor-pointer" onClick={() => update(w.id, { isActive: !w.isActive })}>
                    {w.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => remove(w.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ---------- Users ----------
function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user", isActive: true });
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => { setUsers(data); setLoading(false); })
      .catch(() => toast.error("Gagal memuat pengguna"));
  };

  useEffect(() => { load(); }, []);

  const update = async (id: string, body: Partial<User>) => {
    const res = await fetch(`/api/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { toast.success("Pengguna diperbarui"); load(); }
    else toast.error("Gagal memperbarui pengguna");
  };

  const create = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Nama, email, dan password wajib diisi");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Pengguna ditambahkan");
      setForm({ name: "", email: "", password: "", role: "user", isActive: true });
      setShowForm(false);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Gagal menambah pengguna");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Yakin ingin menghapus pengguna ini?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Pengguna dihapus"); load(); }
    else toast.error("Gagal menghapus pengguna");
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Daftar Pengguna</CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            {showForm ? "Batal" : "Tambah Pengguna"}
          </Button>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6 rounded-lg border border-border p-4">
              <h3 className="mb-3 text-sm font-semibold">Pengguna Baru</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Nama" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                <Field label="Password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
                <div>
                  <label className="mb-1 block text-sm font-medium">Role</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  Aktif
                </label>
                <Button size="sm" onClick={create} disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <select
                      className="rounded border border-input bg-background px-2 py-1 text-sm"
                      value={u.role}
                      onChange={(e) => update(u.id, { role: e.target.value })}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.isActive ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => update(u.id, { isActive: !u.isActive })}
                    >
                      {u.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => remove(u.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- AI Config ----------
interface AiProvider {
  id: string;
  name: string;
  provider: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  isActive: boolean;
}

function AiConfigTab() {
  const [providers, setProviders] = useState<AiProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    provider: "opencode",
    baseUrl: "https://opencode.ai/zen/go/v1",
    apiKey: "",
    model: "qwen-max",
    maxTokens: 8000,
    isActive: false,
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/ai-providers")
      .then((r) => r.json())
      .then((data) => { setProviders(data); setLoading(false); })
      .catch(() => { toast.error("Gagal memuat konfigurasi AI"); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name || !form.apiKey || !form.baseUrl || !form.model) {
      toast.error("Nama, API Key, Base URL, dan Model wajib diisi");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/ai-providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Provider AI ditambahkan");
      setForm({ name: "", provider: "opencode", baseUrl: "https://opencode.ai/zen/go/v1", apiKey: "", model: "qwen-max", maxTokens: 8000, isActive: false });
      setShowForm(false);
      load();
    } else {
      toast.error("Gagal menambah provider AI");
    }
  };

  const update = async (id: string, body: Partial<AiProvider>) => {
    const res = await fetch(`/api/admin/ai-providers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) { toast.success("Provider diperbarui"); load(); }
    else toast.error("Gagal memperbarui provider");
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus provider AI ini?")) return;
    const res = await fetch(`/api/admin/ai-providers/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Provider dihapus"); load(); }
    else toast.error("Gagal menghapus provider");
  };

  const setActive = async (id: string) => {
    const res = await fetch(`/api/admin/ai-providers/${id}/set-active`, { method: "POST" });
    if (res.ok) { toast.success("Provider diaktifkan"); load(); }
    else toast.error("Gagal mengaktifkan provider");
  };

  const testConnection = async (provider: AiProvider) => {
    setTesting(provider.id);
    try {
      const res = await fetch(`${provider.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${provider.apiKey}` },
      });
      if (res.ok) {
        const data = await res.json();
        const models = data.data?.map((m: any) => m.id || m.model) || [];
        toast.success(`Koneksi berhasil! ${models.length} model tersedia.`, {
          description: models.slice(0, 5).join(", ") + (models.length > 5 ? `... dan ${models.length - 5} lainnya` : ""),
        });
      } else {
        toast.error(`Koneksi gagal (HTTP ${res.status})`);
      }
    } catch {
      toast.error("Gagal terhubung ke provider");
    }
    setTesting(null);
  };

  const providerOptions = [
    { value: "opencode", label: "OpenCode" },
    { value: "openai", label: "OpenAI" },
    { value: "openrouter", label: "OpenRouter" },
    { value: "groq", label: "Groq" },
    { value: "together", label: "Together AI" },
    { value: "deepseek", label: "DeepSeek" },
    { value: "claude", label: "Claude (Anthropic)" },
    { value: "custom", label: "Custom" },
  ];

  const presetUrls: Record<string, string> = {
    opencode: "https://opencode.ai/zen/go/v1",
    openai: "https://api.openai.com/v1",
    openrouter: "https://openrouter.ai/api/v1",
    groq: "https://api.groq.com/openai/v1",
    together: "https://api.together.xyz/v1",
    deepseek: "https://api.deepseek.com/v1",
    claude: "https://api.anthropic.com/v1",
    custom: "",
  };

  const handleProviderChange = (value: string) => {
    setForm({
      ...form,
      provider: value,
      baseUrl: presetUrls[value] || form.baseUrl,
    });
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Konfigurasi Provider AI</CardTitle>
            <p className="text-sm text-muted-foreground">
              Atur provider AI yang digunakan untuk analisis laporan. Hanya satu provider yang aktif pada satu waktu.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            {showForm ? "Batal" : "Tambah Provider"}
          </Button>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6 rounded-lg border border-border p-4">
              <h3 className="mb-3 text-sm font-semibold">Provider Baru</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nama Tampilan" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <div>
                  <label className="mb-1 block text-sm font-medium">Provider</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.provider}
                    onChange={(e) => handleProviderChange(e.target.value)}
                  >
                    {providerOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <Field label="Base URL" value={form.baseUrl} onChange={(v) => setForm({ ...form, baseUrl: v })} />
                <Field label="Model" value={form.model} onChange={(v) => setForm({ ...form, model: v })} />
                <Field label="API Key" value={form.apiKey} onChange={(v) => setForm({ ...form, apiKey: v })} />
                <Field label="Max Tokens" value={String(form.maxTokens)} onChange={(v) => setForm({ ...form, maxTokens: Number(v) })} type="number" />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  Aktifkan setelah disimpan
                </label>
                <Button size="sm" onClick={create} disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Max Tokens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Belum ada konfigurasi AI. Tambahkan provider untuk mengaktifkan analisis AI.
                  </TableCell>
                </TableRow>
              )}
              {providers.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.baseUrl}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.provider}</Badge>
                  </TableCell>
                  <TableCell>{p.model}</TableCell>
                  <TableCell>{p.maxTokens.toLocaleString()}</TableCell>
                  <TableCell>
                    {p.isActive ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Aktif
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setActive(p.id)}
                      >
                        Nonaktif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => testConnection(p)}
                        disabled={testing === p.id}
                        title="Test koneksi"
                      >
                        {testing === p.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Activity className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(p.id)} title="Hapus">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Reusable helpers ----------
function Field({ label, value, onChange, textarea = false, type = "text" }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; type?: string }) {
  const props = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
  };
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {textarea ? <textarea {...props} rows={3} /> : <input type={type} {...props} />}
    </div>
  );
}

function ListEditor({ title, items, onChange, fields }: { title: string; items: any[]; onChange: (items: any[]) => void; fields: { key: string; label: string; textarea?: boolean }[] }) {
  const add = () => {
    const newItem: any = {};
    fields.forEach((f) => (newItem[f.key] = ""));
    onChange([...items, newItem]);
  };

  const remove = (index: number) => {
    const next = [...items];
    next.splice(index, 1);
    onChange(next);
  };

  const move = (index: number, dir: number) => {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const update = (index: number, key: string, value: string) => {
    const next = [...items];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <Button size="sm" variant="outline" onClick={add}><Plus className="mr-2 h-4 w-4" />Tambah</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-border p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {fields.map((f) => (
                <div key={f.key} className={f.textarea ? "sm:col-span-2 lg:col-span-3" : ""}>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</label>
                  {f.textarea ? (
                    <textarea
                      value={item[f.key] || ""}
                      onChange={(e) => update(index, f.key, e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      rows={2}
                    />
                  ) : (
                    <input
                      type="text"
                      value={item[f.key] || ""}
                      onChange={(e) => update(index, f.key, e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => move(index, -1)} disabled={index === 0}>↑</Button>
              <Button size="sm" variant="ghost" onClick={() => move(index, 1)} disabled={index === items.length - 1}>↓</Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">Belum ada data.</p>}
      </CardContent>
    </Card>
  );
}
