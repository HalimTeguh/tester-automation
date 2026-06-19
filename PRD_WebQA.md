# Product Requirements Document (PRD)
## WebQA — Asisten Tester Web Berbasis AI

**Version:** 1.0.0  
**Date:** Juni 2026  
**Status:** Draft — Siap Review  
**Author:** Senior Software Developer

---

## 1. Overview

WebQA adalah asisten tester web berbasis AI yang dirancang untuk membantu developer — terutama solo developer dan tim kecil tanpa QA khusus — memeriksa kualitas website yang sudah dipublikasikan dengan cara yang sangat mudah.

Pengguna hanya perlu **memasukkan URL**, memilih **preset** pemeriksaan, dan menekan tombol **"Periksa Sekarang"**. Dalam hitungan menit, WebQA menghasilkan laporan lengkap yang mencakup fungsionalitas, performa, SEO, dan keamanan dasar, lengkap dengan **penjelasan manusiawi** dan **rekomendasi perbaikan konkret**.

---

## 2. Problem Statement

### 2.1 Masalah yang Dihadapi Pengguna
1. **Rasio developer jauh lebih besar daripada QA.** Tim kecil sering tidak memiliki QA khusus, sehingga developer harus menguji sendiri.
2. **Vibe coding membuat deploy cepat, tetapi testing tertinggal.** Developer dapat membangun dan menerbitkan fitur dalam hitungan jam, tapi sering tidak tahu apa yang harus diperiksa setelahnya.
3. **Tool yang ada terfragmentasi dan membutuhkan setup.** Lighthouse, Playwright, OWASP ZAP masing-masing memerlukan konfigurasi dan outputnya tidak terintegrasi.
4. **Laporan tool konvensional sulit dipahami.** Istilah teknis seperti LCP, CLS, CSP tidak langsung menjelaskan apa yang harus diperbaiki.
5. **Tidak ada bantuan AI untuk menjelaskan dan memberikan solusi.** Developer butuh rekomendasi yang bisa langsung ditindaklanjuti, bukan sekadar daftar error.

### 2.2 Peluang Produk
Membuat satu produk yang:
- Menggabungkan fungsionalitas, performa, SEO, dan keamanan dasar.
- Dapat digunakan hanya dengan URL.
- Menghasilkan laporan yang mudah dipahami.
- Memberikan penjelasan dan rekomendasi berbasis AI.
- Aman dan tidak menyerang target situs.

---

## 3. Product Vision

> **Menjadi asisten tester default bagi setiap developer yang ingin memastikan websitenya berfungsi dengan baik setelah deploy, tanpa perlu menjadi ahli QA.**

---

## 4. Objectives & Success Metrics

### 4.1 Objectives
1. Mengurangi waktu yang dibutuhkan developer untuk memeriksa kualitas website pasca-deploy.
2. Meningkatkan kepercayaan developer terhadap kualitas aplikasi yang dibangun dengan vibe coding.
3. Menyederhanakan pengujian web menjadi alur 3 klik.
4. Memberikan rekomendasi perbaikan yang dapat langsung ditindaklanjuti.

### 4.2 Success Metrics (3 bulan pasca-launch)

| Metric | Target | Rationale |
|---|---|---|
| Signup-to-first-test completion | > 60% | Mengukur apakah onboarding cukup mudah |
| Median time to first result | < 3 menit | Janji nilai inti produk |
| Returning users (tes kedua dalam 7 hari) | > 30% | Mengukur keterlibatan berkelanjutan |
| Reports shared/exported | > 25% dari total tes | Mengukur nilai komunikasi laporan |
| AI explanation used | > 40% dari viewer report | Mengukur adopsi fitur asisten |
| NPS | > 30 | Mengukur kepuasan pengguna |
| Free-to-paid conversion | > 5% | Mengukur daya tarik monetisasi |

---

## 5. Target Users

### 5.1 Primary Persona: Vibe Coder Solo
- **Background:** Menggunakan Cursor, Lovable, v0, Bolt, atau ChatGPT untuk membangun web.
- **Stack:** Next.js, Tailwind, Vercel/Netlify.
- **Pain:** Tidak tahu apa yang harus diperiksa setelah deploy.
- **Goal:** Website berfungsi, cepat, dan aman tanpa belajar QA.
- **Tech-savviness:** Medium. Paham kode, tapi malas setup tool.

### 5.2 Secondary Persona: Full-Stack Developer di Tim Kecil
- **Background:** 2–5 developer, tidak ada QA khusus.
- **Pain:** Harus menggabungkan data dari banyak tool secara manual.
- **Goal:** Laporan yang bisa dibagikan ke founder/client dengan cepat.
- **Tech-savviness:** High.

### 5.3 Tertiary Persona: Technical Founder
- **Background:** Punya ide produk, membuat MVP, bukan developer hardcore.
- **Pain:** Ingin validasi kualitas sebelum membayar audit profesional.
- **Goal:** Tahu apakah web layak diluncurkan.
- **Tech-savviness:** Low-Medium.

---

## 6. Value Proposition

**Untuk:** solo developer dan tim kecil tanpa QA  
**Yang frustrasi dengan:** proses pengujian manual dan tool terfragmentasi  
**WebQA adalah:** asisten tester web berbasis AI  
**Yang memungkinkan:** memeriksa website hanya dengan URL dalam 3 menit  
**Berbeda dengan:** Lighthouse, Playwright, ZAP yang harus di-setup satu per satu  
**Karena:** WebQA menggabungkan semuanya, menjelaskan hasil dalam bahasa manusiawi, dan memberikan rekomendasi perbaikan.

---

## 7. Key Features

### 7.1 One-Click Test from URL
- Input URL besar dan jelas di landing page.
- Validasi otomatis format, reachability, dan akses publik.
- Blokir URL private untuk mencegah SSRF.

### 7.2 Preset Pemeriksaan
- Cek Setelah Deploy
- Cek Sebelum Launch
- Cek SEO
- Cek Keamanan Dasar
- Cek Ringkas

### 7.3 Real-Time Progress
- 4 kartu kategori dengan progress bar.
- Log ringkas yang dapat dibuka.
- Estimasi waktu tersisa.

### 7.4 AI-Powered Report
- Skor 0–100 per kategori dan keseluruhan.
- Severity: Critical / Warning / Info.
- Untuk tiap issue: Apa ini? Mengapa penting? Cara perbaiki?
- AI chat untuk tanya jawab hasil tes.

### 7.5 Share & Export
- Link shareable anonim.
- Export PDF dan JSON.

### 7.6 History & Projects
- Riwayat semua tes.
- Pengelompokan URL ke dalam project.

### 7.7 Recurring Tests & Alerts (Phase 2)
- Jadwal harian/mingguan.
- Email/webhook saat regresi.

### 7.8 GitHub Integration (Phase 2)
- Membaca repo untuk rekomendasi kontekstual.

---

## 8. Functional Requirements

### 8.1 Authentication & User Management
- Sign up dengan email dan password.
- Sign up/login dengan OAuth Google dan GitHub.
- Password reset via email.
- Profil pengguna dengan plan (free/paid).

### 8.2 URL Input & Validation
- Terima URL dengan atau tanpa protokol.
- Validasi format URL.
- HEAD request untuk cek reachability.
- Blokir private IP ranges dan localhost.
- Deteksi halaman login (opsional).
- Disclaimer ownership sebelum run.

### 8.3 Test Configuration
- Pilihan preset default.
- Toggle manual per kategori.
- Simpan konfigurasi default per project.

### 8.4 Test Orchestration
- Jalankan runner secara paralel:
  - Functionality (Playwright)
  - Performance (Lighthouse)
  - SEO (custom scraper + Lighthouse SEO)
  - Security (custom heuristics + OWASP ZAP passive)
- Timeout 60 detik per kategori.
- Tangani hasil parsial.

### 8.5 Real-Time Updates
- Streaming status via WebSocket (Supabase Realtime).
- Update progress tiap kategori.
- Notifikasi saat selesai.

### 8.6 Report Generation
- Skor keseluruhan dan per kategori.
- Daftar issue dengan severity.
- Penjelasan masalah dan rekomendasi perbaikan.
- Diff score vs run sebelumnya.
- AI chat box.

### 8.7 Export & Sharing
- Shareable public link (anonim).
- PDF export.
- JSON export.

### 8.8 History & Projects
- List semua test runs.
- Filter by URL, project, date, score.
- Create/read/update/delete project.
- Delete test run dan datanya.

### 8.9 Recurring Tests (Phase 2)
- Create schedule: URL + preset + frequency.
- pg_cron trigger.
- Email/webhook on regression.

### 8.10 GitHub Integration (Phase 2)
- OAuth connect GitHub.
- Read repo file tree, package.json, framework detection.
- Contextual recommendations.

---

## 9. Non-Functional Requirements

### 9.1 Performance
- Test run selesai < 3 menit untuk situs rata-rata.
- Latensi WebSocket update < 500 ms.
- Dashboard load < 1,5 detik.
- Report page load < 1,5 detik.

### 9.2 Scalability
- Queue-based runner untuk handle banyak request.
- Concurrency cap per user: 10 concurrent runs.
- Horizontal scaling worker pool.

### 9.3 Security
- AES-256 encryption untuk credentials via Supabase Vault.
- No credentials in logs/reports.
- SSRF protection via URL allowlist.
- Isolated Docker containers per run.
- Supabase RLS on all tables.
- Passive scan only for security.
- CSP on WebQA app.

### 9.4 Privacy
- Target responses not stored beyond report generation.
- GDPR-compliant data deletion.
- Anonymized share links.

### 9.5 Reliability
- Runner timeout handling.
- Retry logic untuk transient failures.
- Partial result presentation on failure.

---

## 10. UI/UX Requirements

### 10.1 Design Principles
1. **Minimal cognitive load** — pengguna tidak perlu memahami QA untuk menggunakan.
2. **Progressive disclosure** — informasi teknis disembunyikan hingga dibutuhkan.
3. **Actionable** — setiap masalah punya langkah perbaikan.
4. **Trustworthy** — jelas bahwa WebQA aman dan tidak menyerang target.

### 10.2 Key Screens

#### Landing Page (`/`)
- Hero copy yang jelas: "Periksa website kamu dalam 3 menit."
- Input URL besar di tengah.
- Preset selector horizontal.
- CTA "Periksa Sekarang".
- Contoh laporan / demo report.
- Trust badges: passive scan, no setup, free tier.

#### Run Progress Page (`/run/[id]`)
- 4 kartu kategori dengan progress bar.
- Status besar: "Memeriksa..." / "Hampir selesai".
- Collapsible live log.
- Tombol cancel (jika masih berjalan).

#### Report Page (`/report/[id]`)
- Skor besar di atas.
- 4 ring score untuk kategori.
- Issue list sorted by severity.
- Expandable issue card dengan penjelasan & rekomendasi.
- AI chat box.
- Diff badge vs previous run.
- Export & share buttons.

#### Dashboard (`/dashboard`)
- Statistik: total tests, rata-rata skor, tests minggu ini.
- Riwayat tes terakhir.
- List project.
- Tombol new test.

#### Settings (`/settings`)
- Profil akun.
- Integrasi (GitHub).
- Billing / plan.
- Data deletion.

### 10.3 Mobile Considerations
- Semua halaman responsif.
- Input URL tetap besar dan mudah digunakan di mobile.
- Report card dapat di-scroll vertikal.

---

## 11. Technical Architecture

### 11.1 Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| UI Library | shadcn/ui + Tailwind CSS |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL |
| Realtime | Supabase Realtime |
| Storage | Supabase Storage |
| Queue | Supabase Edge Functions + pg_cron |
| Workers | Node.js + Docker |
| Functionality | Playwright |
| Performance | Lighthouse Node API |
| Security | OWASP ZAP (passive) |
| AI | opencode.ai / OpenAI-compatible API |
| Hosting | Vercel (frontend) + Railway/Fly.io (workers) |

### 11.2 High-Level Flow

```
User → Next.js Frontend → Supabase Auth/API
                          ↓
                   Supabase Database
                          ↓
                 Edge Function Queue
                          ↓
               Docker Worker Pool
                          ↓
            Playwright / Lighthouse / ZAP
                          ↓
            Save results → Stream via Realtime
                          ↓
                   User sees report
```

### 11.3 Data Model

#### profiles
- id (uuid)
- email (text)
- plan (text)
- created_at (timestamp)

#### projects
- id (uuid)
- user_id (uuid)
- name (text)
- created_at (timestamp)

#### test_runs
- id (uuid)
- user_id (uuid)
- project_id (uuid, nullable)
- url (text)
- status (text)
- overall_score (int)
- preset (text)
- options (jsonb)
- started_at (timestamp)
- completed_at (timestamp)

#### test_results
- id (uuid)
- run_id (uuid)
- category (text)
- score (int)
- issues (jsonb)
- raw_output (jsonb)
- completed_at (timestamp)

#### schedules
- id (uuid)
- user_id (uuid)
- project_id (uuid, nullable)
- url (text)
- preset (text)
- frequency (text)
- last_run (timestamp)
- next_run (timestamp)

---

## 12. API Requirements

### 12.1 REST Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /api/runs/create | Validasi URL, buat run, enqueue | Required |
| GET | /api/runs/[id] | Ambil detail run + hasil | Required |
| DELETE | /api/runs/[id] | Hapus run | Required |
| GET | /api/projects | List project user | Required |
| POST | /api/projects | Buat project | Required |
| GET | /api/reports/[id]/export | Export PDF/JSON | Required / Share token |
| POST | /api/schedules | Buat jadwal | Required |

### 12.2 Realtime Events

| Event | Payload | Trigger |
|---|---|---|
| `run.status_changed` | { run_id, status } | Status run berubah |
| `run.progress_updated` | { run_id, category, progress } | Progress per kategori |
| `run.completed` | { run_id, overall_score } | Tes selesai |

---

## 13. Phased Roadmap

### Phase 1 — MVP (4 minggu)
- Landing page + auth.
- URL input + validation + SSRF protection.
- Preset selector.
- Playwright + Lighthouse runners.
- Basic SEO + security heuristics.
- Real-time progress.
- Report page: score + issues + AI explanation.
- Export PDF/JSON.
- History dasar.

### Phase 2 — Full Suite (3 minggu)
- OWASP ZAP passive integration.
- Auth-aware testing.
- Projects & dashboard.
- Diff view.
- Shareable report link.
- GitHub repo integration.
- AI chat follow-up.

### Phase 3 — Growth (3 minggu)
- Scheduled tests.
- Email & webhook alerts.
- Team accounts.
- Login flow recorder.
- CI/CD API.

---

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Target site memblokir traffic otomatis | High | Medium | Rotate UA, delay, respect robots.txt |
| SSRF via malicious URL | Medium | Critical | Strict URL allowlist |
| Kredensial bocor di log | Low | Critical | Scrub logs, encrypt via Vault |
| Timeout pada situs lambat | High | Low | Partial results, 60s timeout |
| False positives security | Medium | Medium | Severity threshold + manual review flag |
| Biaya infra tinggi | Medium | Medium | Concurrency cap, free tier limit |
| ZAP tidak sengaja aktif | Low | Critical | Enforce passive mode |

---

## 15. Open Questions

1. Target utama pertama: solo developer atau tim kecil?
2. Model monetisasi: freemium berdasarkan jumlah run, atau tier fitur?
3. Verifikasi ownership: apakah user boleh scan sembarang URL publik?
4. Provider AI untuk explanation: opencode.ai atau alternatif?
5. Retensi laporan untuk free vs paid user?
6. Integrasi deployment platform seperti Vercel deploy hooks?
7. Apakah perlu white-label report untuk agency?

---

## 16. Appendix

### A. Glossary
- **LCP:** Largest Contentful Paint — metrik kecepatan muat elemen besar.
- **CLS:** Cumulative Layout Shift — metrik stabilitas tata letak.
- **INP:** Interaction to Next Paint — metrik responsivitas interaksi.
- **CSP:** Content Security Policy — header keamanan.
- **SSRF:** Server-Side Request Forgery — serangan via permintaan dari server.
- **Passive scan:** pemindaian keamanan yang hanya mengamati respon, tanpa serangan aktif.

### B. Related Documents
- `SRS_WebQA_Platform.md`
- `UserStoryMap_WebQA.md`
