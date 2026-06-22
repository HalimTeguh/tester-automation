"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Save, Loader2, Edit3, X } from "lucide-react";

const ACTION_OPTIONS = [
  "navigate",
  "click",
  "type",
  "submit",
  "hover",
  "scroll",
  "wait",
  "assertText",
  "assertVisible",
  "assertValue",
  "screenshot",
];

interface ScenarioStep {
  id?: string;
  order: number;
  action: string;
  selector?: string | null;
  value?: string | null;
  assertionText?: string | null;
  waitMs?: number | null;
}

interface Scenario {
  id?: string;
  name: string;
  description: string;
  startUrl: string;
  isActive: boolean;
  steps: ScenarioStep[];
}

export default function ScenarioManager() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Scenario | null>(null);

  useEffect(() => {
    fetch("/api/admin/scenarios")
      .then((r) => r.json())
      .then((data) => {
        setScenarios(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Gagal memuat skenario");
        setLoading(false);
      });
  }, []);

  const save = async (scenario: Scenario) => {
    const isNew = !scenario.id;
    const url = isNew ? "/api/admin/scenarios" : `/api/admin/scenarios/${scenario.id}`;
    const method = isNew ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: scenario.name,
        description: scenario.description,
        startUrl: scenario.startUrl,
        isActive: scenario.isActive,
        steps: scenario.steps.map((s, i) => ({
          ...s,
          order: i,
          waitMs: s.waitMs ? Number(s.waitMs) : 0,
        })),
      }),
    });

    if (!res.ok) {
      toast.error("Gagal menyimpan skenario");
      return;
    }

    const saved = await res.json();
    setScenarios((prev) => {
      if (isNew) return [saved, ...prev];
      return prev.map((s) => (s.id === saved.id ? saved : s));
    });
    setEditing(null);
    toast.success("Skenario disimpan");
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus skenario ini?")) return;
    const res = await fetch(`/api/admin/scenarios/${id}`, { method: "DELETE" });
    if (res.ok) {
      setScenarios((prev) => prev.filter((s) => s.id !== id));
      toast.success("Skenario dihapus");
    } else {
      toast.error("Gagal menghapus skenario");
    }
  };

  const emptyScenario: Scenario = {
    name: "",
    description: "",
    startUrl: "/",
    isActive: true,
    steps: [{ order: 0, action: "navigate", selector: "", value: "", assertionText: "", waitMs: 0 }],
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">User Flow Skenario</h2>
          <p className="text-sm text-muted-foreground">
            Definisikan alur interaksi nyata yang akan dijalankan browser saat tes.
          </p>
        </div>
        <Button onClick={() => setEditing({ ...emptyScenario })}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Skenario
        </Button>
      </div>

      {editing && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editing.id ? "Edit Skenario" : "Skenario Baru"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setEditing(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Skenario</label>
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Contoh: Login dan submit form"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start URL</label>
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editing.startUrl}
                  onChange={(e) => setEditing({ ...editing, startUrl: e.target.value })}
                  placeholder="/ atau https://example.com/login"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="Apa yang diuji oleh skenario ini?"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={editing.isActive}
                onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Aktif (dijalankan saat tes)
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Langkah-langkah</label>
              <div className="space-y-2">
                {editing.steps.map((step, index) => (
                  <div key={index} className="grid gap-2 rounded-md border border-border p-3 md:grid-cols-12">
                    <div className="md:col-span-2">
                      <select
                        className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                        value={step.action}
                        onChange={(e) => {
                          const updated = [...editing.steps];
                          updated[index] = { ...step, action: e.target.value };
                          setEditing({ ...editing, steps: updated });
                        }}
                      >
                        {ACTION_OPTIONS.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <input
                        className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                        placeholder="Selector"
                        value={step.selector || ""}
                        onChange={(e) => {
                          const updated = [...editing.steps];
                          updated[index] = { ...step, selector: e.target.value };
                          setEditing({ ...editing, steps: updated });
                        }}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <input
                        className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                        placeholder={step.action === "type" || step.action === "assertValue" ? "Value" : "URL / input value"}
                        value={step.value || ""}
                        onChange={(e) => {
                          const updated = [...editing.steps];
                          updated[index] = { ...step, value: e.target.value };
                          setEditing({ ...editing, steps: updated });
                        }}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <input
                        className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                        placeholder={step.action === "wait" ? "Wait ms" : "Expected text"}
                        value={step.action === "wait" ? step.waitMs || "" : step.assertionText || ""}
                        onChange={(e) => {
                          const updated = [...editing.steps];
                          if (step.action === "wait") {
                            updated[index] = { ...step, waitMs: Number(e.target.value) };
                          } else {
                            updated[index] = { ...step, assertionText: e.target.value };
                          }
                          setEditing({ ...editing, steps: updated });
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-end md:col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const updated = editing.steps.filter((_, i) => i !== index);
                          setEditing({ ...editing, steps: updated });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  setEditing({
                    ...editing,
                    steps: [
                      ...editing.steps,
                      { order: editing.steps.length, action: "click", selector: "", value: "", assertionText: "", waitMs: 0 },
                    ],
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Tambah Langkah
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Batal
              </Button>
              <Button onClick={() => save(editing)}>
                <Save className="mr-2 h-4 w-4" /> Simpan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Start URL</TableHead>
                <TableHead>Langkah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada skenario.
                  </TableCell>
                </TableRow>
              )}
              {scenarios.map((scenario) => (
                <TableRow key={scenario.id}>
                  <TableCell className="font-medium">{scenario.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{scenario.startUrl}</TableCell>
                  <TableCell>{scenario.steps?.length || 0}</TableCell>
                  <TableCell>
                    {scenario.isActive ? (
                      <Badge className="bg-green-600">Aktif</Badge>
                    ) : (
                      <Badge variant="secondary">Nonaktif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditing({ ...scenario, steps: scenario.steps || [] })}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => scenario.id && remove(scenario.id)}>
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
