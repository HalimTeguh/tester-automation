import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Hapus data lama agar seed idempotent
  await prisma.webhookDelivery.deleteMany();
  await prisma.webhookEndpoint.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.testResult.deleteMany();
  await prisma.testRun.deleteMany();
  await prisma.loadTest.deleteMany();
  await prisma.userActivity.deleteMany();
  await prisma.user.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.themeConfig.deleteMany();
  await prisma.privacyCommitment.deleteMany();
  await prisma.securityCommitment.deleteMany();
  await prisma.securityContent.deleteMany();
  await prisma.roadmapItem.deleteMany();
  await prisma.aboutBenefit.deleteMany();
  await prisma.howItWorksStep.deleteMany();
  await prisma.testType.deleteMany();
  await prisma.aboutContent.deleteMany();
  await prisma.trustBadge.deleteMany();
  await prisma.homeBenefit.deleteMany();
  await prisma.homeFeature.deleteMany();
  await prisma.companyProfile.deleteMany();

  // 1. CompanyProfile & home
  const companyProfile = await prisma.companyProfile.create({
    data: {
      siteName: "WebQA",
      homeTitle: "Periksa website kamu dalam 3 menit",
      homeSubtitle:
        "WebQA adalah asisten tester yang memeriksa fungsionalitas, performa, SEO, dan keamanan dasar website — lalu memberitahu apa yang salah dan cara memperbaikinya.",
      heroBadgeText: "Versi awal — UI/UX demo",
      ctaText: "Periksa Sekarang",
      disclaimerText: "Hanya memindai situs publik yang kamu miliki atau punya izin.",
      footerText: "WebQA — Asisten tester untuk website yang lebih baik.",
      isActive: true,
      homeFeatures: {
        create: [
          { icon: "Clock", title: "Cepat", description: "Hasil dalam hitungan menit, tanpa setup.", order: 1 },
          { icon: "Zap", title: "Mudah Dipahami", description: "Penjelasan manusiawi + rekomendasi perbaikan.", order: 2 },
          { icon: "Lock", title: "Aman", description: "Hanya membaca halaman, tanpa serangan aktif.", order: 3 },
        ],
      },
      trustBadges: {
        create: [
          { icon: "ShieldCheck", label: "Passive scan only", order: 1 },
          { icon: "Eye", label: "Data hanya untuk keperluan testing", order: 2 },
          { icon: "Lock", label: "Tidak menyimpan data sensitif", order: 3 },
        ],
      },
    },
  });

  // 2. About content
  const aboutContent = await prisma.aboutContent.create({
    data: {
      pageTitle: "Asisten tester untuk website yang lebih baik",
      pageSubtitle:
        "WebQA membantu developer, QA, dan pemilik website menemukan masalah fungsionalitas, performa, SEO, dan keamanan — lalu memberitahu cara memperbaikinya.",
      howItWorksTitle: "Bagaimana cara kerjanya?",
      benefitsTitle: "Kegunaan WebQA",
      roadmapTitle: "Pengembangan selanjutnya",
      roadmapSubtitle:
        "WebQA akan terus berkembang ke arah pemantauan website yang aktif dan responsif.",
      isActive: true,
      testTypes: {
        create: [
          {
            slug: "functionality",
            icon: "MousePointerClick",
            title: "Fungsionalitas",
            description:
              "Memeriksa tautan yang rusak, formulir yang tidak berfungsi, gambar tanpa deskripsi, dan elemen interaktif yang bermasalah.",
            order: 1,
          },
          {
            slug: "performance",
            icon: "Gauge",
            title: "Performa",
            description:
              "Mengukur kecepatan muat halaman, ukuran resource, dan pengalaman pengguna di perangkat dengan koneksi lambat.",
            order: 2,
          },
          {
            slug: "seo",
            icon: "Search",
            title: "SEO",
            description:
              "Memastikan halaman memiliki judul, deskripsi, heading, dan struktur konten yang mudah dipahami mesin pencari.",
            order: 3,
          },
          {
            slug: "security",
            icon: "ShieldCheck",
            title: "Keamanan Dasar",
            description:
              "Memeriksa konfigurasi header keamanan dan celah umum yang bisa meningkatkan risiko serangan sederhana.",
            order: 4,
          },
          {
            slug: "load-test",
            icon: "Activity",
            title: "Uji Beban",
            description:
              "Mensimulasikan banyak pengunjung sekaligus untuk melihat apakah website tetap stabil saat traffic tinggi.",
            order: 5,
          },
        ],
      },
      howItWorksSteps: {
        create: [
          { stepNumber: 1, title: "Masukkan URL", description: "Ketik alamat website yang ingin kamu periksa." },
          {
            stepNumber: 2,
            title: "Pilih jenis tes",
            description:
              "Pilih preset sesuai kebutuhan: setelah deploy, sebelum launch, SEO, keamanan, ringkas, atau uji beban.",
          },
          {
            stepNumber: 3,
            title: "Analisis otomatis",
            description: "Sistem membaca halaman website dan mengumpulkan temuan berdasarkan kategori yang dipilih.",
          },
          {
            stepNumber: 4,
            title: "Dapatkan laporan",
            description:
              "Lihat skor, daftar issue, dampaknya, dan langkah perbaikan yang bisa langsung disalin ke asisten AI.",
          },
        ],
      },
      aboutBenefits: {
        create: [
          { text: "Menemukan masalah sebelum pengguna melihatnya.", order: 1 },
          { text: "Meningkatkan kecepatan dan pengalaman pengguna.", order: 2 },
          { text: "Mempermudah optimasi mesin pencari.", order: 3 },
          { text: "Mengurangi risiko keamanan dasar yang sering terlewat.", order: 4 },
          { text: "Menghemat waktu tim QA dan developer.", order: 5 },
        ],
      },
      roadmapItems: {
        create: [
          {
            icon: "LineChart",
            title: "Monitoring performa real-time",
            description:
              "Pantau kecepatan website secara berkala dan dapatkan notifikasi jika performa menurun.",
            order: 1,
          },
          {
            icon: "Bug",
            title: "Report bug otomatis",
            description:
              "Temuan error dan fungsionalitas rusak langsung dikumpulkan sebagai laporan bug yang terstruktur.",
            order: 2,
          },
          {
            icon: "Bell",
            title: "Alert high latency",
            description:
              "Dapatkan peringatan cepat saat waktu muat halaman melebihi ambang batas yang ditentukan.",
            order: 3,
          },
          {
            icon: "Rocket",
            title: "Report masalah lain secara real-time",
            description:
              "Dari error 500, broken link, hingga perubahan SEO yang tidak disengaja — semua dilaporkan langsung.",
            order: 4,
          },
        ],
      },
    },
  });

  // 3. Security content
  const securityContent = await prisma.securityContent.create({
    data: {
      pageTitle: "Keamanan dan kerahasiaan data kamu prioritas utama",
      pageSubtitle:
        "WebQA dirancang agar kamu bisa menguji website dengan tenang. Informasi yang dikumpulkan hanya digunakan untuk keperluan testing dan peningkatan performa website.",
      commitmentTitle: "Komitmen privasi",
      isActive: true,
      securityCommitments: {
        create: [
          {
            icon: "Eye",
            title: "Passive scan only",
            description:
              "WebQA hanya membaca halaman publik website kamu. Kami tidak mengirim serangan aktif, tidak mencoba login, dan tidak mengubah data apapun di server target.",
            order: 1,
          },
          {
            icon: "Lock",
            title: "Tidak menyimpan data sensitif",
            description:
              "Kami tidak meminta password, API key, token, atau akses ke server. URL dan hasil tes digunakan hanya untuk keperluan testing dan perbaikan performa.",
            order: 2,
          },
          {
            icon: "FileCheck",
            title: "Rekomendasi, bukan exploit",
            description:
              "Setiap issue disertai penjelasan dan saran perbaikan. Tidak ada payload berbahaya yang dijalankan terhadap website target.",
            order: 3,
          },
          {
            icon: "Trash2",
            title: "Hasil tes tidak disimpan selamanya",
            description:
              "Laporan tes dihapus setelah tidak dibutuhkan. Kami tidak menjual, membagikan, atau menggunakan data hasil tes untuk kepentingan lain.",
            order: 4,
          },
        ],
      },
      privacyCommitments: {
        create: [
          {
            number: 1,
            title: "Hanya untuk testing.",
            description:
              "URL dan hasil pemeriksaan digunakan semata-mata untuk memberitahu kamu apa yang perlu diperbaiki di website.",
          },
          {
            number: 2,
            title: "Tidak untuk pelacakan.",
            description:
              "Kami tidak memasang tracker, tidak mengumpulkan data pengunjung website, dan tidak membuat profil pengguna.",
          },
          {
            number: 3,
            title: "Transparan.",
            description:
              "Kamu bisa melihat apa saja yang diuji dan bagaimana hasilnya. Tidak ada proses tersembunyi.",
          },
          {
            number: 4,
            title: "Terbatas waktu.",
            description:
              "Laporan lama akan dihapus secara berkala. Jika kamu ingin menyimpan hasil, gunakan fitur export.",
          },
        ],
      },
    },
  });

  // 4. Theme & settings
  const theme = await prisma.themeConfig.create({
    data: {
      name: "Indigo Default",
      primary: "#4f46e5",
      primaryForeground: "#ffffff",
      secondary: "#00d4ff",
      accent: "#39ff14",
      background: "#0a0a0f",
      foreground: "#f8fafc",
      muted: "#1e1e2a",
      border: "#27273a",
      isActive: true,
    },
  });

  await prisma.settings.create({
    data: {
      themeConfigId: theme.id,
      maintenanceMode: false,
      allowAnonymousTest: true,
      maxAnonymousTests: 5,
      defaultPreset: "pre-launch",
    },
  });

  // 5. Users
  const admin = await prisma.user.create({
    data: {
      email: "admin@webqa.local",
      name: "Admin WebQA",
      role: "admin",
      isActive: true,
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: "demo@webqa.local",
      name: "Demo User",
      role: "user",
      isActive: true,
    },
  });

  // 6. TestRun demo
  const testRun = await prisma.testRun.create({
    data: {
      userId: demoUser.id,
      url: "https://example.com",
      preset: "pre-launch",
      status: "completed",
      overallScore: 78,
      startedAt: new Date(Date.now() - 1000 * 60 * 5),
      completedAt: new Date(),
      config: JSON.stringify({ source: "seed" }),
      testResults: {
        create: [
          {
            category: "functionality",
            score: 85,
            status: "completed",
            issues: {
              create: [
                {
                  category: "functionality",
                  severity: "warning",
                  title: "2 link internal mengembalikan 404",
                  description: "Dua tautan menuju halaman /blog/lama dan /kontak tidak ditemukan.",
                  impact: "Pengunjung bisa kehalaman kosong dan meningkatkan bounce rate.",
                  fix: "Perbarui href atau hapus tautan yang sudah tidak digunakan.",
                },
                {
                  category: "functionality",
                  severity: "info",
                  title: "3 gambar belum memiliki alt text",
                  description: "Gambar di bagian testimonial tidak memiliki atribut alt.",
                  impact: "Kurang ramah screen reader dan SEO gambar.",
                  fix: "Tambahkan atribut alt yang deskriptif pada setiap gambar.",
                },
              ],
            },
          },
          {
            category: "performance",
            score: 72,
            status: "completed",
            issues: {
              create: [
                {
                  category: "performance",
                  severity: "critical",
                  title: "LCP mencapai 3,8 detik",
                  description: "Largest Contentful Paint melebihi ambang batas 2,5 detik.",
                  impact: "Pengguna mobile cenderung keluar sebelum halaman selesai dimuat.",
                  fix: "Kompres gambar hero ke WebP/AVIF dan pertimbangkan lazy-load elemen di bawah fold.",
                  code: '<Image src="/hero.webp" priority width={1200} height={600} alt="..." />',
                },
                {
                  category: "performance",
                  severity: "warning",
                  title: "JavaScript tidak di-cache dengan baik",
                  description: "Beberapa asset JS tidak memiliki header cache-control yang panjang.",
                  impact: "Pengguna berulang harus mengunduh ulang asset yang sama.",
                  fix: "Konfigurasi CDN atau server untuk menyertakan Cache-Control: public, max-age=31536000 pada asset statis.",
                },
              ],
            },
          },
          {
            category: "seo",
            score: 88,
            status: "completed",
            issues: {
              create: [
                {
                  category: "seo",
                  severity: "warning",
                  title: "Meta description terlalu pendek",
                  description: "Meta description hanya 45 karakter. Idealnya 70–160 karakter.",
                  impact: "Google mungkin menampilkan snippet yang kurang menarik.",
                  fix: "Perluas deskripsi dengan kalimat ajakan dan kata kunci utama.",
                },
              ],
            },
          },
          {
            category: "security",
            score: 65,
            status: "completed",
            issues: {
              create: [
                {
                  category: "security",
                  severity: "critical",
                  title: "Header Content-Security-Policy tidak ditemukan",
                  description: "Server tidak mengirimkan CSP header.",
                  impact: "Risiko XSS lebih tinggi karena browser tidak dibatasi saat mengeksekusi script.",
                  fix: "Tambahkan CSP header di konfigurasi server atau middleware.",
                  code: "Content-Security-Policy: default-src 'self'; script-src 'self'",
                },
                {
                  category: "security",
                  severity: "warning",
                  title: "Header X-Content-Type-Options hilang",
                  description: "Header yang mencegah MIME sniffing tidak ada.",
                  impact: "Browser bisa menafsirkan file dengan tipe konten yang salah.",
                  fix: "Tambahkan X-Content-Type-Options: nosniff.",
                },
              ],
            },
          },
        ],
      },
    },
  });

  // 7. LoadTest demo
  await prisma.loadTest.create({
    data: {
      userId: demoUser.id,
      url: "https://api.startupsaya.id",
      vus: 100,
      duration: 60,
      rampUp: 15,
      maxRps: 100,
      paths: "/\n/dashboard",
      status: "completed",
      summaryJson: JSON.stringify({ totalRequests: 23342, avgRps: 129, avgLatency: 138, errorRate: 0 }),
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 12 + 1000 * 60 * 3),
    },
  });

  // 8. Activity log demo
  await prisma.userActivity.createMany({
    data: [
      { userId: demoUser.id, action: "login", metadata: JSON.stringify({ method: "email" }) },
      { userId: demoUser.id, action: "test_run", metadata: JSON.stringify({ testRunId: testRun.id }) },
      { userId: admin.id, action: "settings_view" },
    ],
  });

  console.log("Seed completed:");
  console.log({ companyProfileId: companyProfile.id, aboutContentId: aboutContent.id, securityContentId: securityContent.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
