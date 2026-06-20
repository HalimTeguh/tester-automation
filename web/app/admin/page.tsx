"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Activity,
  Palette,
  ShieldCheck,
  Save,
  Loader2,
  UserCheck,
  UserX,
} from "lucide-react";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState({
    primary: "#4f46e5",
    secondary: "#06b6d4",
    accent: "#10b981",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }

    Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/test-runs").then((r) => r.json()),
      fetch("/api/settings/public").then((r) => r.json()),
    ])
      .then(([u, t, s]) => {
        setUsers(u);
        setTests(t);
        if (s?.themeConfig) {
          setTheme({
            primary: s.themeConfig.primary || "#4f46e5",
            secondary: s.themeConfig.secondary || "#06b6d4",
            accent: s.themeConfig.accent || "#10b981",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, authLoading, router]);

  async function toggleUserActive(id: string, isActive: boolean) {
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive } : u))
    );
  }

  async function changeRole(id: string, role: string) {
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role } : u))
    );
  }

  async function saveTheme() {
    setSaving(true);
    await fetch("/api/settings/public", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme }),
    });
    setSaving(false);
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeUsers = users.filter((u) => u.isActive).length;
  const avgScore = tests.length
    ? Math.round(tests.reduce((a, b) => a + (b.overallScore || 0), 0) / tests.length)
    : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin WebQA</h1>
          <p className="text-muted-foreground">Kelola user, tema, dan konten platform.</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          {user?.email}
        </Badge>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total User</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <UserCheck className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-sm text-muted-foreground">User Aktif</p>
              <p className="text-2xl font-bold">{activeUsers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <Activity className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Tes</p>
              <p className="text-2xl font-bold">{tests.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <ShieldCheck className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Skor Rata-rata</p>
              <p className="text-2xl font-bold">{avgScore}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="h-4 w-4" />
            User
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-1.5">
            <Palette className="h-4 w-4" />
            Tema
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-1.5">
            <Activity className="h-4 w-4" />
            Konten
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daftar User</CardTitle>
            </CardHeader>
            <CardContent>
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
                          className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                          value={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        {u.isActive ? (
                          <Badge variant="default" className="gap-1">
                            <UserCheck className="h-3 w-3" /> Aktif
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <UserX className="h-3 w-3" /> Nonaktif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={u.isActive ? "destructive" : "outline"}
                          onClick={() => toggleUserActive(u.id, !u.isActive)}
                        >
                          {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Konfigurasi Warna</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Primary</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={theme.primary}
                      onChange={(e) =>
                        setTheme((t) => ({ ...t, primary: e.target.value }))
                      }
                      className="h-10 w-14 p-1"
                    />
                    <Input value={theme.primary} readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={theme.secondary}
                      onChange={(e) =>
                        setTheme((t) => ({ ...t, secondary: e.target.value }))
                      }
                      className="h-10 w-14 p-1"
                    />
                    <Input value={theme.secondary} readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Accent</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={theme.accent}
                      onChange={(e) =>
                        setTheme((t) => ({ ...t, accent: e.target.value }))
                      }
                      className="h-10 w-14 p-1"
                    />
                    <Input value={theme.accent} readOnly />
                  </div>
                </div>
              </div>
              <Button onClick={saveTheme} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan Tema
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pengaturan Konten</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Pengeditan konten home, tentang, dan keamanan tersedia via API:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>PUT /api/company-profile</li>
                <li>PUT /api/about</li>
                <li>PUT /api/security</li>
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                Form visual untuk mengedit konten akan ditambahkan di iterasi berikutnya.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
