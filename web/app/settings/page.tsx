"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Globe, Mail, Trash2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">Kelola akun, integrasi, dan preferensi.</p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Profil Akun</CardTitle>
          <CardDescription>Informasi dasar akun kamu.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Nama</label>
            <Input defaultValue="IswaraFreedom" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Email</label>
            <Input defaultValue="halim.tofreedom@gmail.com" type="email" />
          </div>
          <Button size="sm">Simpan Perubahan</Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Integrasi</CardTitle>
          <CardDescription>Hubungkan akun lain untuk konteks yang lebih baik.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">GitHub</p>
                <p className="text-xs text-muted-foreground">Akses repo untuk rekomendasi kontekstual</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Hubungkan</Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Notifikasi Email</p>
                <p className="text-xs text-muted-foreground">Terima alert saat regresi</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Atur</Button>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Zona Berbahaya</CardTitle>
          <CardDescription>Hapus data atau akun secara permanen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
            <Trash2 className="mr-1.5 h-4 w-4" />
            Hapus Semua Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
