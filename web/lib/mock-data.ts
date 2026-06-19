export type TestCategory = "functionality" | "performance" | "seo" | "security";

export type Severity = "critical" | "warning" | "info";

export interface Issue {
  id: string;
  category: TestCategory;
  severity: Severity;
  title: string;
  description: string;
  impact: string;
  fix: string;
  code?: string;
}

export interface TestResult {
  category: TestCategory;
  score: number;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  issues: Issue[];
}

export interface TestRun {
  id: string;
  url: string;
  status: "pending" | "running" | "completed" | "failed";
  overallScore: number;
  preset: string;
  startedAt: string;
  completedAt?: string;
  results: TestResult[];
}

export const presets = [
  {
    id: "post-deploy",
    label: "Cek Setelah Deploy",
    description: "Fungsionalitas + Performa",
    categories: ["functionality", "performance"] as TestCategory[],
  },
  {
    id: "pre-launch",
    label: "Cek Sebelum Launch",
    description: "Semua kategori",
    categories: ["functionality", "performance", "seo", "security"] as TestCategory[],
  },
  {
    id: "seo",
    label: "Cek SEO",
    description: "Optimasi mesin pencari",
    categories: ["seo"] as TestCategory[],
  },
  {
    id: "security",
    label: "Cek Keamanan Dasar",
    description: "Header & konfigurasi aman",
    categories: ["security"] as TestCategory[],
  },
  {
    id: "quick",
    label: "Cek Ringkas",
    description: "Fungsionalitas + SEO",
    categories: ["functionality", "seo"] as TestCategory[],
  },
];

export const mockReport: TestRun = {
  id: "run-demo-001",
  url: "https://example.com",
  status: "completed",
  overallScore: 78,
  preset: "pre-launch",
  startedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  completedAt: new Date().toISOString(),
  results: [
    {
      category: "functionality",
      score: 85,
      status: "completed",
      progress: 100,
      issues: [
        {
          id: "f-1",
          category: "functionality",
          severity: "warning",
          title: "2 link internal mengembalikan 404",
          description: "Dua tautan menuju halaman /blog/lama dan /kontak tidak ditemukan.",
          impact: "Pengunjung bisa kehalaman kosong dan meningkatkan bounce rate.",
          fix: "Perbarui href atau hapus tautan yang sudah tidak digunakan.",
        },
        {
          id: "f-2",
          category: "functionality",
          severity: "info",
          title: "3 gambar belum memiliki alt text",
          description: "Gambar di bagian testimonial tidak memiliki atribut alt.",
          impact: "Kurang ramah screen reader dan SEO gambar.",
          fix: "Tambahkan atribut alt yang deskriptif pada setiap gambar.",
        },
      ],
    },
    {
      category: "performance",
      score: 72,
      status: "completed",
      progress: 100,
      issues: [
        {
          id: "p-1",
          category: "performance",
          severity: "critical",
          title: "LCP mencapai 3,8 detik",
          description: "Largest Contentful Paint melebihi ambang batas 2,5 detik.",
          impact: "Pengguna mobile cenderung keluar sebelum halaman selesai dimuat.",
          fix: "Kompres gambar hero ke WebP/AVIF dan pertimbangkan lazy-load elemen di bawah fold.",
          code: "<Image src=\"/hero.webp\" priority width={1200} height={600} alt=\"...\" />",
        },
        {
          id: "p-2",
          category: "performance",
          severity: "warning",
          title: "JavaScript tidak di-cache dengan baik",
          description: "Beberapa asset JS tidak memiliki header cache-control yang panjang.",
          impact: "Pengguna berulang harus mengunduh ulang asset yang sama.",
          fix: "Konfigurasi CDN atau server untuk menyertakan Cache-Control: public, max-age=31536000 pada asset statis.",
        },
      ],
    },
    {
      category: "seo",
      score: 88,
      status: "completed",
      progress: 100,
      issues: [
        {
          id: "s-1",
          category: "seo",
          severity: "warning",
          title: "Meta description terlalu pendek",
          description: "Meta description hanya 45 karakter. Idealnya 70–160 karakter.",
          impact: "Google mungkin menampilkan snippet yang kurang menarik.",
          fix: "Perluas deskripsi dengan kalimat ajakan dan kata kunci utama.",
        },
      ],
    },
    {
      category: "security",
      score: 65,
      status: "completed",
      progress: 100,
      issues: [
        {
          id: "sec-1",
          category: "security",
          severity: "critical",
          title: "Header Content-Security-Policy tidak ditemukan",
          description: "Server tidak mengirimkan CSP header.",
          impact: "Risiko XSS lebih tinggi karena browser tidak dibatasi saat mengeksekusi script.",
          fix: "Tambahkan CSP header di konfigurasi server atau middleware.",
          code: "Content-Security-Policy: default-src 'self'; script-src 'self'",
        },
        {
          id: "sec-2",
          category: "security",
          severity: "warning",
          title: "Header X-Content-Type-Options hilang",
          description: "Header yang mencegah MIME sniffing tidak ada.",
          impact: "Browser bisa menafsirkan file dengan tipe konten yang salah.",
          fix: "Tambahkan X-Content-Type-Options: nosniff.",
        },
      ],
    },
  ],
};

export const mockHistory: TestRun[] = [
  mockReport,
  {
    id: "run-demo-002",
    url: "https://myapp.vercel.app",
    status: "completed",
    overallScore: 82,
    preset: "post-deploy",
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 2).toISOString(),
    results: [],
  },
  {
    id: "run-demo-003",
    url: "https://client-site.netlify.app",
    status: "failed",
    overallScore: 0,
    preset: "seo",
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    results: [],
  },
];

export const mockProjects = [
 { id: "p1", name: "Startup Saya", runs: 12 },
  { id: "p2", name: "Klien A", runs: 5 },
  { id: "p3", name: "Side Project", runs: 3 },
];
