import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ShieldCheck,
  Eye,
  Lock,
  FileCheck,
  ArrowRight,
  Trash2,
} from "lucide-react";

const trustItems = [
  {
    icon: <Eye className="h-5 w-5 text-primary" />,
    title: "Passive scan only",
    desc: "WebQA hanya membaca halaman publik website kamu. Kami tidak mengirim serangan aktif, tidak mencoba login, dan tidak mengubah data apapun di server target.",
  },
  {
    icon: <Lock className="h-5 w-5 text-primary" />,
    title: "Tidak menyimpan data sensitif",
    desc: "Kami tidak meminta password, API key, token, atau akses ke server. URL dan hasil tes digunakan hanya untuk keperluan testing dan perbaikan performa.",
  },
  {
    icon: <FileCheck className="h-5 w-5 text-primary" />,
    title: "Rekomendasi, bukan exploit",
    desc: "Setiap issue disertai penjelasan dan saran perbaikan. Tidak ada payload berbahaya yang dijalankan terhadap website target.",
  },
  {
    icon: <Trash2 className="h-5 w-5 text-primary" />,
    title: "Hasil tes tidak disimpan selamanya",
    desc: "Laporan tes dihapus setelah tidak dibutuhkan. Kami tidak menjual, membagikan, atau menggunakan data hasil tes untuk kepentingan lain.",
  },
];

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
          Privasi & Keamanan
        </Badge>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Keamanan dan kerahasiaan data kamu prioritas utama
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          WebQA dirancang agar kamu bisa menguji website dengan tenang. Informasi
          yang dikumpulkan hanya digunakan untuk keperluan testing dan peningkatan
          performa website.
        </p>
      </div>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {trustItems.map((item) => (
          <Card key={item.title} className="border-border/60 bg-card/50">
            <CardContent className="flex gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                {item.icon}
              </div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-10">
        <Card className="border-border/60 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Komitmen privasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">1. Hanya untuk testing.</strong>{" "}
              URL dan hasil pemeriksaan digunakan semata-mata untuk memberitahu
              kamu apa yang perlu diperbaiki di website.
            </p>
            <p>
              <strong className="text-foreground">2. Tidak untuk pelacakan.</strong>{" "}
              Kami tidak memasang tracker, tidak mengumpulkan data pengunjung website,
              dan tidak membuat profil pengguna.
            </p>
            <p>
              <strong className="text-foreground">3. Transparan.</strong>{" "}
              Kamu bisa melihat apa saja yang diuji dan bagaimana hasilnya. Tidak ada
              proses tersembunyi.
            </p>
            <p>
              <strong className="text-foreground">4. Terbatas waktu.</strong>{" "}
              Laporan lama akan dihapus secara berkala. Jika kamu ingin menyimpan
              hasil, gunakan fitur export.
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="mt-10 flex justify-center">
        <Button asChild size="sm">
          <Link href="/tentang">
            Pelajari apa saja yang diuji
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
