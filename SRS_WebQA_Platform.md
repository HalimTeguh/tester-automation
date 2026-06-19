# Software Requirements Specification (SRS)
## WebQA — Asisten Tester Web Berbasis AI

**Version:** 2.0.0  
**Date:** Juni 2026  
**Stack:** Next.js 14 · Supabase · shadcn/ui · Tailwind CSS · Playwright · Lighthouse · OWASP ZAP (passive)

---

## 1. Executive Summary

WebQA adalah **asisten tester web berbasis AI** yang memungkinkan developer — terutama solo developer dan tim kecil tanpa QA khusus — untuk memeriksa kualitas website yang sudah dipublikasikan hanya dengan **memasukkan URL**. Platform ini menggabungkan pemeriksaan **fungsionalitas, performa, SEO, dan keamanan dasar** dalam satu alur kerja, lalu menghasilkan laporan yang mudah dipahami, lengkap dengan penjelasan manusiawi dan rekomendasi perbaikan.

Target utama WebQA adalah developer yang menggunakan pendekatan *vibe coding* dan ingin memastikan aplikasinya berfungsi dengan baik setelah deploy, tanpa harus mempelajari berbagai tool CLI atau menulis skrip pengujian.

---

## 2. Problem Statement

1. **Developer jauh lebih banyak daripada QA.** Di tim kecil, developer sering kali harus melakukan pengujian sendiri.
2. **Vibe coding mempercepat pengembangan, tetapi mengorbankan pengujian.** Developer bisa deploy dalam hitungan jam, tetapi sering tidak tahu apa yang harus diperiksa setelahnya.
3. **Tool yang ada terfragmentasi.** Lighthouse untuk performa, Playwright untuk fungsionalitas, OWASP ZAP untuk keamanan — masing-masing butuh setup dan hasilnya tidak terintegrasi.
4. **Laporan tool konvensional sulit dipahami.** Skor dan istilah teknis seperti LCP, CLS, CSP, X-Frame-Options tidak langsung menjelaskan *apa yang harus diperbaiki*.
5. **Tidak ada asisten yang menjelaskan dan memberikan solusi.** Developer butuh rekomendasi konkret, bukan sekadar daftar error.

---

## 3. Target Users (Personas)

### 3.1 Vibe Coder Solo
- Bangun web pakai Cursor, Lovable, v0, atau Bolt.
- Deploy ke Vercel/Netlify.
- Tidak punya latar belakang QA.
- **Kebutuhan utama:** "Setelah deploy, apakah web saya aman, cepat, dan tidak rusak?"
- **Sikap:** Malas setup, ingin hasil instan, butuh penjelasan sederhana.

### 3.2 Full-Stack Developer di Startup Kecil
- Tim 2–5 orang, tidak ada QA khusus.
- Harus menguji sendiri sebelum demo ke klien/founder.
- **Kebutuhan utama:** "Laporan yang bisa saya bagikan dan dipercaya."
- **Sikap:** Mengerti teknis, tapi ingin hemat waktu.

### 3.3 Technical Founder / Non-Developer
- Paham pentingnya testing, tapi tidak tahu caranya.
- Ingin validasi cepat sebelum membayar developer untuk audit.
- **Kebutuhan utama:** "Apakah web saya layak diluncurkan?"
- **Sikap:** Butuh bahasa bisnis, bukan teknis.

---

## 4. Jobs-to-be-Done

| # | Job | Dampak yang dirasakan pengguna |
|---|---|---|
| 1 | Memastikan web tidak rusak setelah deploy | Tidak kehilangan kepercayaan pengunjung |
| 2 | Mengetahui apa yang harus diperbaiki dan prioritasnya | Tidak buang waktu menebak-nebak |
| 3 | Memahami hasil tanpa belajar tool QA | Mengurangi beban kognitif |
| 4 | Mendapatkan rekomendasi perbaikan konkret | Bisa langsung memperbaiki |
| 5 | Membagikan hasil ke tim/klien | Komunikasi lebih mudah |
| 6 | Menjaga web tetap baik seiring waktu | Mencegah regresi |

---

## 5. Value Proposition

> **WebQA adalah asisten tester yang memeriksa website kamu dalam 3 menit, lalu memberitahu apa yang salah, mengapa itu penting, dan cara memperbaikinya — tanpa setup dan tanpa skrip.**

- **Satukan semua pemeriksaan:** fungsionalitas, performa, SEO, keamanan dasar.
- **Bahasa manusiawi:** tiap masalah dijelaskan dengan kalimat sederhana.
- **Rekomendasi konkret:** contoh kode dan langkah perbaikan.
- **Aman:** hanya membaca halaman seperti browser biasa (passive scan).
- **Cepat:** hasil dalam hitungan menit, tidak perlu instalasi.

---

## 6. User Flow (Minimum Clicks to Result)

```
[ Landing Page ]
      ↓
[ Masukkan URL ]
      ↓
[ Pilih Preset / Konfigurasi Ringkas (opsional) ]
      ↓
[ Klik "Periksa Sekarang" ]
      ↓
[ Tampilan Proses Real-Time ]
      ↓
[ Laporan dengan Skor & Rekomendasi ]
      ↓
[ Bagikan / Export / Tanya AI ]
```

**Core path: 3 klik** — paste URL → klik periksa → lihat laporan.

---

## 7. Functional Requirements

### 7.1 Module 1 — URL Intake & Validation
- Pengguna memasukkan URL, dengan atau tanpa `https://`.
- Sistem memvalidasi format URL, keterjangkauan (HEAD request), dan akses publik.
- **Blokir URL private:** `localhost`, `127.0.0.1`, `10.x.x.x`, `192.168.x.x`, `0.0.0.0/8`, `169.254.x.x`, dan `::1` untuk mencegah SSRF.
- **Deteksi halaman login (opsional):** jika terdeteksi form login, tampilkan opsi autentikasi ringkas.
- **Disclaimer:** tampilkan pesan bahwa pengguna hanya boleh memindai situs yang mereka miliki atau punya izin.

### 7.2 Module 2 — Preset & Quick Configuration
Agar pengguna tidak bingung, sediakan preset siap pakai:

| Preset | Kategori yang diuji | Kapan digunakan |
|---|---|---|
| Cek Setelah Deploy | Fungsionalitas + Performa | Baru deploy, ingin tahu apakah web normal |
| Cek Sebelum Launch | Semua kategori | Persiapan rilis resmi |
| Cek SEO | SEO | Ingin meningkatkan visibilitas Google |
| Cek Keamanan Dasar | Keamanan | Ingin memastikan tidak ada celah umum |
| Cek Ringkas | Fungsionalitas + SEO | Audit cepat rutin |

Pengguna dapat memilih kategori manual jika ingin kontrol penuh.

### 7.3 Module 3 — Test Orchestration
Empat runner berjalan paralel setelah URL valid:

| Runner | Engine | Yang Diperiksa |
|---|---|---|
| Fungsionalitas | Playwright (headless Chromium) | Halaman muat, link internal, form, gambar, JS error, aksesibilitas dasar, responsif mobile |
| Performa | Lighthouse Node API + Playwright | Core Web Vitals, TTFB, TBT, Speed Index, ukuran asset, caching, CDN |
| SEO | Custom scraper + Lighthouse SEO | Title, meta description, H1, canonical, robots.txt, sitemap, Open Graph, structured data |
| Keamanan | Custom heuristics + OWASP ZAP passive | Header keamanan, HTTPS, CORS, file sensitif, mixed content, cookie flags |

Batas waktu per kategori: **60 detik**. Jika timeout, hasil parsial tetap ditampilkan.

### 7.4 Module 4 — Live Progress Dashboard
- WebSocket streaming real-time (Supabase Realtime).
- Progress bar per kategori.
- Log ringkas yang dapat dibuka/tutup.
- Estimasi waktu tersisa.
- Status: *Menunggu*, *Berjalan*, *Selesai*, *Gagal Parsial*, *Gagal*.

### 7.5 Module 5 — AI-Powered Report
- Skor 0–100 per kategori dan skor keseluruhan.
- Daftar issue dengan severity: **Critical / Warning / Info**.
- Untuk tiap issue:
  - **Apa ini?** (penjelasan manusiawi 1 kalimat)
  - **Mengapa penting?** (dampak ke pengguna/bisnis)
  - **Cara perbaiki** (langkah atau contoh kode)
- **Diff badge:** perubahan skor dibandingkan tes sebelumnya.
- **Tanya AI:** pengguna bisa bertanya soal hasil dan mendapatkan penjelasan lebih lanjut.
- **Export:** PDF, JSON, dan link shareable (anonim, tanpa PII).

### 7.6 Module 6 — History & Projects
- Semua tes tersimpan di akun pengguna.
- Pengguna dapat mengelompokkan URL ke dalam Project (contoh: "Klien A", "Startup Saya").
- Riwayat dapat difilter berdasarkan URL, project, tanggal, dan skor.

### 7.7 Module 7 — Recurring Tests & Alerts (Phase 2)
- Jadwalkan pemeriksaan harian/mingguan.
- Notifikasi email atau webhook jika terjadi regresi skor.

### 7.8 Module 8 — GitHub Integration (Phase 2)
- Pengguna dapat menghubungkan repo GitHub (opsional).
- Sistem membaca `package.json`, framework, dan routing untuk memberikan rekomendasi yang lebih kontekstual.
- Contoh: *"Kamu pakai Next.js 14. Gunakan `next/image` untuk optimasi gambar."*

---

## 8. Authentication for Target Site

Pilihan autentikasi untuk situs target (opsional):

1. **Tidak ada** — default untuk situs publik.
2. **Basic Auth** — username/password dikirim di header.
3. **Bearer Token** — token disuntikkan ke sesi Playwright.
4. **Cookie Injection** — paste raw cookie.

Untuk MVP, **form-based login tidak disertakan** karena kompleksitas selector manual. Direncanakan di Phase 3 dengan fitur *login flow recorder*.

---

## 9. Non-Functional Requirements

### 9.1 Performance
- Satu pemeriksaan selesai dalam **< 3 menit** untuk situs rata-rata.
- Update real-time via WebSocket dengan latensi **< 500 ms**.
- Dashboard dan laporan dimuat dalam **< 1,5 detik**.

### 9.2 Security
- Kredensial pengguna (login target, API key) dienkripsi AES-256 via Supabase Vault.
- Kredensial tidak disimpan di log atau laporan.
- Rate limiting: maksimal 10 tes konkuren per pengguna.
- Blokir URL private untuk mencegah SSRF.
- Runner dijalankan dalam container Docker yang terisolasi antar pengguna.
- API route dilindungi Supabase Row-Level Security (RLS).
- OWASP ZAP hanya berjalan dalam mode **passive scan** — tidak ada serangan aktif.
- WebQA app sendiri menerapkan Content Security Policy.

### 9.3 Privacy
- Respon target site tidak disimpan lebih lama dari yang dibutuhkan untuk laporan.
- Pengguna dapat menghapus semua data kapan saja.
- Link shareable bersifat anonim.

---

## 10. Technical Architecture

### 10.1 Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router) |
| UI | shadcn/ui + Tailwind CSS |
| Auth | Supabase Auth (email + OAuth) |
| Database | Supabase PostgreSQL + RLS |
| Realtime | Supabase Realtime |
| Storage | Supabase Storage (laporan, export) |
| Test Runners | Node.js workers di Docker container |
| Fungsionalitas | Playwright (@playwright/test, headless Chromium) |
| Performa | Lighthouse Node API |
| Keamanan | OWASP ZAP REST API (Docker sidecar, passive only) |
| Queue | Supabase Edge Functions + pg_cron |
| AI Explanation | opencode.ai / OpenAI-compatible API |
| Hosting | Vercel (frontend) + Railway/Fly.io (workers) |

### 10.2 Database Schema

```sql
-- Profil pengguna (terintegrasi Supabase Auth)
profiles (
  id uuid primary key,
  email text,
  plan text default 'free',
  created_at timestamptz
);

projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null,
  created_at timestamptz default now()
);

test_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  project_id uuid references projects(id),
  url text not null,
  status text default 'pending',
  overall_score int,
  preset text default 'quick',
  options jsonb,
  started_at timestamptz,
  completed_at timestamptz
);

test_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references test_runs(id),
  category text not null, -- functionality | performance | seo | security
  score int,
  issues jsonb,
  raw_output jsonb,
  completed_at timestamptz
);

schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  project_id uuid references projects(id),
  url text not null,
  preset text,
  frequency text, -- daily | weekly
  last_run timestamptz,
  next_run timestamptz
);
```

### 10.3 API Routes

```
POST   /api/runs/create          → validasi URL, buat run, enqueue
GET    /api/runs/[id]            → ambil run + hasil
DELETE /api/runs/[id]            → hapus run
GET    /api/projects             → daftar project
POST   /api/projects             → buat project
GET    /api/reports/[id]/export  → export PDF/JSON
POST   /api/schedules            → buat jadwal (Phase 2)
```

Semua route memerlukan token sesi Supabase. RLS memastikan pengguna hanya mengakses data sendiri.

---

## 11. Test Runner Specifications

### 11.1 Fungsionalitas (Playwright)
- Halaman berhasil dimuat tanpa error JS fatal.
- Semua link internal mengembalikan status 200.
- Form terdeteksi dan dicek apakah bisa disubmit dengan data uji.
- Navigasi utama dapat diakses.
- Gambar memiliki alt text dan tidak 404.
- Responsif pada viewport mobile (375px).
- Aksesibilitas dasar dengan axe-playwright.
- Halaman 404 tersedia.
- Console error dicatat.

### 11.2 Performa (Lighthouse)
- Core Web Vitals: LCP, INP, CLS.
- TTFB (Time to First Byte).
- Total Blocking Time.
- Speed Index.
- Ukuran bundle/asset.
- Optimasi gambar.
- Caching headers.
- Deteksi CDN.

### 11.3 SEO
- Title tag (ada, panjang 30–60 karakter).
- Meta description (ada, panjang 70–160 karakter).
- H1 tag (tepat satu).
- Canonical URL.
- robots.txt ada dan dapat diparse.
- XML sitemap ada.
- Open Graph tags.
- Twitter Card tags.
- Structured data (JSON-LD).
- Hreflang (jika multi-bahasa).
- Tidak ada tag `noindex` yang salah tempat.

### 11.4 Keamanan (Passive Only)
- HTTPS terenfor (redirect dari HTTP).
- HSTS header.
- Content-Security-Policy header.
- X-Frame-Options / frame-ancestors.
- X-Content-Type-Options.
- Referrer-Policy.
- Permissions-Policy.
- CORS policy check.
- File sensitif tidak terexpose (`.env`, `.git`, `wp-config.php`).
- Mixed content.
- Cookie flags (Secure, HttpOnly, SameSite).
- Server header disclosure.
- Petunjuk kerentanan dependency melalui analisis file JS.

---

## 12. UI/UX Specifications

### 12.1 Pages

| Route | Deskripsi |
|---|---|
| `/` | Landing page dengan input URL besar, preset cepat, dan CTA |
| `/dashboard` | Riwayat tes, project, statistik |
| `/run/[id]` | Progress real-time saat tes berjalan |
| `/report/[id]` | Laporan lengkap dengan skor, issue, dan rekomendasi AI |
| `/settings` | Akun, integrasi, billing |

### 12.2 Key UI Components
- `URLInputCard` — input URL besar dengan toggle preset dan tombol "Periksa Sekarang".
- `PresetSelector` — pilihan cepat: Setelah Deploy, Sebelum Launch, SEO, Keamanan Dasar, Ringkas.
- `TestProgressPanel` — 4 kartu kategori dengan progress bar real-time.
- `ScoreRing` — gauge skor melingkar dengan animasi.
- `IssueList` — daftar issue yang bisa diurutkan berdasarkan severity.
- `IssueExplanationCard` — penjelasan masalah, dampak, dan cara perbaikan.
- `AIChatBox` — tanya jawab soal hasil tes.
- `DiffBadge` — indikator naik/turun skor vs tes sebelumnya.
- `ExportMenu` — PDF / JSON / share link.

---

## 13. Development Phases

### Phase 1 — MVP (4 minggu)
- [ ] Next.js scaffold + Supabase setup + auth.
- [ ] URL intake, validasi, dan SSRF protection.
- [ ] Preset selector & test toggle.
- [ ] Playwright functionality runner.
- [ ] Lighthouse performance runner.
- [ ] Basic SEO runner.
- [ ] Basic security runner (custom heuristics, ZAP belum wajib).
- [ ] Real-time progress via Supabase Realtime.
- [ ] Report page dengan skor + issue list.
- [ ] AI explanation per issue (minimal penjelasan + rekomendasi).
- [ ] Export PDF & JSON.

### Phase 2 — Full Suite (3 minggu)
- [ ] Integrasi OWASP ZAP passive scan.
- [ ] Auth-aware testing: Basic Auth, Bearer Token, Cookie.
- [ ] Projects & history dashboard.
- [ ] Diff view vs previous run.
- [ ] Shareable report link.
- [ ] GitHub repo integration (baca package.json & framework).
- [ ] AI chat follow-up.

### Phase 3 — Growth (3 minggu)
- [ ] Scheduled tests (pg_cron).
- [ ] Email & webhook alerts on regression.
- [ ] Team accounts / shared projects.
- [ ] Login flow recorder untuk form-based auth.
- [ ] API access untuk CI/CD.

---

## 14. Success Metrics

| Metric | Target |
|---|---|
| Time to first result | < 3 menit |
| User completing first test | > 60% dari signup |
| Returning user (tes kedua dalam 7 hari) | > 30% |
| Report shared/exported | > 25% dari total tes |
| AI explanation used | > 40% dari pengguna yang melihat report |
| NPS | > 30 |

---

## 15. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Target site memblokir traffic otomatis | High | Medium | Rotate user-agent, tambahkan delay, opsi retry manual |
| SSRF via URL malicious | Medium | Critical | Validasi IP allowlist sebelum request |
| Kredensial bocor di log | Low | Critical | Scrub output, gunakan Supabase Vault |
| Timeout pada situs lambat | High | Low | Timeout 60s per kategori, tampilkan hasil parsial |
| False positives di security scan | Medium | Medium | Threshold severity + flag manual review |
| OWASP ZAP tidak sengaja aktif attack | Low | Critical | Passive mode only, konfigurasi policy ketat |
| Biaya infra runner tinggi | Medium | Medium | Batasi free tier, gunakan queue + concurrency cap |

---

## 16. Open Questions

1. Apakah target utama MVP adalah solo developer, tim kecil, atau enterprise?
2. Bagaimana model monetisasi? Freemium (N tes gratis/bulan) atau trial?
3. Apakah pengguna boleh memindai sembarang URL publik, atau harus verifikasi ownership?
4. Apakah AI explanation menggunakan opencode.ai sesuai stack eksisting kamu?
5. Berapa lama retensi laporan untuk pengguna gratis vs berbayar?
6. Apakah perlu menambahkan integrasi deployment platform seperti Vercel deploy hooks?

---

*Next step: Implementasi Phase 1 MVP.*
