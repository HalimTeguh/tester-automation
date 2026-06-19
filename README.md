# Tester Automation / WebQA

Asisten tester web berbasis AI untuk memeriksa kualitas website yang sudah dipublikasikan.

## Dokumen Perencanaan

- [`SRS_WebQA_Platform.md`](./SRS_WebQA_Platform.md) — Software Requirements Specification
- [`UserStoryMap_WebQA.md`](./UserStoryMap_WebQA.md) — User Story Map
- [`PRD_WebQA.md`](./PRD_WebQA_Platform.md) — Product Requirements Document
- [`docs/BACKEND_DESIGN.md`](./docs/BACKEND_DESIGN.md) — Desain database, API, dan webhook

## Aplikasi Web

Kode utama berada di folder [`web/`](./web/):

```bash
cd web
npm install
```

### Database & Seed

Proyek ini menggunakan Prisma + SQLite untuk local development. Schema dirancang kompatibel dengan PostgreSQL/Supabase untuk production.

```bash
# Jalankan migrasi
npm run db:migrate

# Isi data awal
npm run db:seed

# Buka Prisma Studio (opsional)
npm run db:studio
```

### Jalankan Aplikasi

```bash
npm run dev
# atau
npm run build
npm start
```

### Script Tambahan

- `npm run db:generate` — generate Prisma Client
- `npm run db:migrate` — jalankan migrasi
- `npm run db:seed` — isi ulang data awal
- `npm run db:studio` — Prisma Studio
- `npm run typecheck` — cek TypeScript

## Halaman yang sudah tersedia

- `/` — Landing page dengan input URL & preset
- `/tentang` — Penjelasan cara kerja, kegunaan, dan pengembangan
- `/keamanan` — Komitmen keamanan & privasi
- `/dashboard` — Ringkasan riwayat pemeriksaan & uji beban
- `/run/[id]` — Progress real-time saat tes berjalan
- `/report/[id]` — Laporan skor, issue, dan rekomendasi
- `/load-test` — Konfigurasi uji beban
- `/settings` — Pengaturan akun & integrasi

## API Routes

| Endpoint | Keterangan |
|----------|------------|
| `GET /api/company-profile` | Profil & konten home |
| `GET /api/about` | Konten halaman tentang |
| `GET /api/security` | Konten halaman keamanan |
| `GET /api/settings/public` | Pengaturan publik & tema |
| `GET/POST /api/test-runs` | Riwayat & mulai pemeriksaan |
| `GET /api/test-runs/[id]` | Detail pemeriksaan |
| `GET/POST /api/load-tests` | Riwayat & mulai uji beban |
| `GET/POST /api/users` | Manajemen user |
| `POST /api/webhooks/test-completed` | Trigger webhook |

## Teknologi

- Next.js 16 + React 19
- Tailwind CSS v4
- shadcn/ui (radix-nova)
- Prisma ORM
- SQLite (local) / Supabase Postgres (production)
- Lucide icons

## Status

UI/UX Phase 1 selesai. Backend dasar (database + API) sudah tersedia dan terhubung ke halaman home, tentang, keamanan, dashboard, serta laporan. Runner sebenarnya (Playwright/Lighthouse/ZAP) akan diintegrasikan di Phase 2.
