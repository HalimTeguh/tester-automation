# Tester Automation / WebQA

Asisten tester web berbasis AI untuk memeriksa kualitas website yang sudah dipublikasikan.

## Dokumen Perencanaan

- [`SRS_WebQA_Platform.md`](./SRS_WebQA_Platform.md) — Software Requirements Specification
- [`UserStoryMap_WebQA.md`](./UserStoryMap_WebQA.md) — User Story Map
- [`PRD_WebQA.md`](./PRD_WebQA.md) — Product Requirements Document

## Aplikasi Web (UI/UX Phase 1)

Kode UI/UX berada di folder [`web/`](./web/):

```bash
cd web
npm install
npm run dev
```

### Halaman yang sudah tersedia

- `/` — Landing page dengan input URL & preset
- `/dashboard` — Ringkasan riwayat & project
- `/run/[id]` — Progress real-time saat tes berjalan
- `/report/[id]` — Laporan skor, issue, dan rekomendasi
- `/settings` — Pengaturan akun & integrasi

### Teknologi

- Next.js 16 + React 19
- Tailwind CSS v4
- shadcn/ui (radix-nova)
- Lucide icons

## Status

UI/UX Phase 1 selesai (demo statis). Backend & runner integration masih di Phase 2.
