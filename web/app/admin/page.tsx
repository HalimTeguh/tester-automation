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
  Route,
} from "lucide-react";
import ScenarioManager from "@/components/scenario-manager";

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
          <TabsTrigger value="webhooks"><Webhook className="mr-2 h-4 w-4" /> Webhooks</TabsTrigger>
          <TabsTrigger value="scenarios"><Route className="mr-2 h-4 w-4" /> Skenario</TabsTrigger>
          <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" /> Pengguna</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard"><DashboardTab /></TabsContent>
        <TabsContent value="theme"><ThemeTab /></TabsContent>
        <TabsContent value="home"><HomeTab /></TabsContent>
        <TabsContent value="about"><AboutTab /></TabsContent>
        <TabsContent value="security"><SecurityTab /></TabsContent>
        <TabsContent value="webhooks"><WebhooksTab /></TabsContent>
        <TabsContent value="scenarios"><ScenarioManager /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Dashboard ----------
function DashboardTab() {
  const [stats, setStats] = useState({ users: 0, activeUsers: 0, tests: 0, avgScore: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/test-runs").then((r) => r.json()),
    ])
      .then(([users, tests]) => {
        const active = users.filter((u: User) => u.isActive).length;
        const scores = tests.filter((t: any) => t.overallScore != null).map((t: any) => t.overallScore);
        setStats({
          users: users.length,
          activeUsers: active,
          tests: tests.length,
          avgScore: scores.length ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0,
        });
      })
      .catch(() => toast.error("Gagal memuat statistik"));
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Pengguna" value={stats.users} />
      <StatCard title="Pengguna Aktif" value={stats.activeUsers} />
      <StatCard title="Total Tes" value={stats.tests} />
      <StatCard title="Skor Rata-rata" value={stats.avgScore} suffix="/100" />
    </div>
  );
}

function StatCard({ title, value, suffix }: { title: string; value: number; suffix?: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{title}</p>
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

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Daftar Pengguna</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
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
                  <Badge variant={u.isActive ? "default" : "secondary"} className="cursor-pointer" onClick={() => update(u.id, { isActive: !u.isActive })}>
                    {u.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
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
