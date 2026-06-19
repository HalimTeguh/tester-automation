# Desain Database & Backend WebQA

## Tujuan

- Semua data tampilan (home, tentang, keamanan, dashboard, pengaturan) disimpan di database.
- Backend menyediakan API terpusat agar maintenance lebih mudah.
- Arsitektur siap dipindahkan ke Supabase (Postgres) di production.
- Untuk local development saat ini menggunakan **SQLite** via Prisma, dengan schema yang kompatibel PostgreSQL.

---

## Stack Local

| Layer | Teknologi |
|-------|-----------|
| ORM | Prisma |
| Database local | SQLite (`prisma/dev.db`) |
| Database production | Supabase PostgreSQL |
| API | Next.js App Router API Routes (`app/api/*`) |
| Auth (nanti) | Supabase Auth / custom session |
| Webhook | Next.js API route + signature verification |

---

## Entity Relationship Diagram (konseptual)

```
CompanyProfile 1--* HomeFeature
CompanyProfile 1--* HomeBenefit
CompanyProfile 1--* TrustBadge

AboutContent 1--* TestType
AboutContent 1--* HowItWorksStep
AboutContent 1--* AboutBenefit
AboutContent 1--* RoadmapItem

SecurityContent 1--* SecurityCommitment
SecurityContent 1--* PrivacyCommitment

ThemeConfig 1--1 Settings

User 1--* UserActivity
User 1--* TestRun
User 1--* LoadTest

TestRun 1--* TestResult
TestResult 1--* Issue

WebhookEvent
```

---

## Daftar Tabel

### 1. `CompanyProfile`
Konten hero & identitas di halaman beranda.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| siteName | String | Nama aplikasi |
| homeTitle | String | Judul besar home |
| homeSubtitle | String | Subjudul home |
| heroBadgeText | String | Teks badge di atas judul |
| ctaText | String | Teks tombol utama |
| disclaimerText | String | Teks kecil di bawah form |
| footerText | String | Teks footer |
| isActive | Boolean | Apakah profil ini aktif |
| createdAt / updatedAt | DateTime | Timestamp |

### 2. `HomeFeature`
3 card keunggulan di home (Cepat, Mudah, Aman, dsb).

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| companyProfileId | String | FK |
| icon | String | Nama icon Lucide |
| title | String | Judul fitur |
| description | String | Deskripsi |
| order | Int | Urutan tampilan |

### 3. `HomeBenefit`
Card kelebihan di section bawah home.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| companyProfileId | String | FK |
| icon | String | Nama icon |
| title | String | Judul |
| value | String | Angka/teks highlight |
| description | String | Penjelasan |
| order | Int | Urutan |

### 4. `TrustBadge`
Badge kecil di bawah home (passive scan, data tidak disimpan, dsb).

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| companyProfileId | String | FK |
| icon | String | Nama icon |
| label | String | Teks badge |
| order | Int | Urutan |

### 5. `AboutContent`
Konten utama halaman `/tentang`.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| pageTitle | String | Judul halaman |
| pageSubtitle | String | Subjudul |
| howItWorksTitle | String | Judul cara kerja |
| benefitsTitle | String | Judul kegunaan |
| roadmapTitle | String | Judul pengembangan |
| roadmapSubtitle | String | Deskripsi roadmap |
| isActive | Boolean | Aktif/tidak |

### 6. `TestType`
Jenis-jenis tes di halaman tentang.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| aboutContentId | String | FK |
| slug | String | Unique |
| icon | String | Nama icon |
| title | String | Nama kategori |
| description | String | Penjelasan |
| order | Int | Urutan |

### 7. `HowItWorksStep`
Langkah-langkah cara kerja.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| aboutContentId | String | FK |
| stepNumber | Int | Nomor langkah |
| title | String | Judul |
| description | String | Penjelasan |

### 8. `AboutBenefit`
Daftar kegunaan WebQA.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| aboutContentId | String | FK |
| text | String | Kalimat benefit |
| order | Int | Urutan |

### 9. `RoadmapItem`
Item pengembangan selanjutnya.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| aboutContentId | String | FK |
| icon | String | Nama icon |
| title | String | Judul fitur |
| description | String | Penjelasan |
| order | Int | Urutan |

### 10. `SecurityContent`
Konten halaman `/keamanan`.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| pageTitle | String | Judul halaman |
| pageSubtitle | String | Subjudul |
| commitmentTitle | String | Judul komitmen |
| isActive | Boolean | Aktif/tidak |

### 11. `SecurityCommitment`
Card komitmen keamanan.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| securityContentId | String | FK |
| icon | String | Nama icon |
| title | String | Judul |
| description | String | Penjelasan |
| order | Int | Urutan |

### 12. `PrivacyCommitment`
Poin-poin komitmen privasi.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| securityContentId | String | FK |
| number | Int | Nomor poin |
| title | String | Judul singkat |
| description | String | Penjelasan |

### 13. `ThemeConfig`
Konfigurasi warna UI.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| name | String | Nama tema |
| primary | String | Warna primary hex |
| primaryForeground | String | Foreground primary |
| secondary | String | Warna secondary |
| accent | String | Warna accent |
| background | String | Background |
| foreground | String | Foreground |
| muted | String | Muted |
| border | String | Border |
| isActive | Boolean | Tema aktif |

### 14. `Settings`
Pengaturan aplikasi.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| themeConfigId | String | FK ke ThemeConfig |
| maintenanceMode | Boolean | Mode maintenance |
| allowAnonymousTest | Boolean | Boleh test tanpa login |
| maxAnonymousTests | Int | Batas test anonim per hari |
| defaultPreset | String | Preset default |
| updatedAt | DateTime | Timestamp |

### 15. `User`
Pengguna platform.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| email | String | Unique |
| name | String | Nama lengkap |
| role | String | user / admin |
| isActive | Boolean | Aktif/tidak |
| emailVerified | Boolean | Verifikasi email |
| avatarUrl | String | URL avatar |
| createdAt / updatedAt | DateTime | Timestamp |

### 16. `UserActivity`
Log aktivitas user.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| userId | String | FK |
| action | String | login / test_run / load_test / settings_update |
| metadata | JSON | Data tambahan |
| ipAddress | String | IP address |
| userAgent | String | User agent |
| createdAt | DateTime | Timestamp |

### 17. `TestRun`
Satu sesi pemeriksaan QA.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| userId | String? | FK (nullable untuk anonim) |
| url | String | URL yang diuji |
| preset | String | post-deploy / pre-launch / seo / security / quick / load-test |
| status | String | pending / running / completed / failed |
| overallScore | Int | Skor keseluruhan 0-100 |
| startedAt | DateTime | Waktu mulai |
| completedAt | DateTime? | Waktu selesai |
| config | JSON | Konfigurasi tambahan |

### 18. `TestResult`
Hasil per kategori dalam satu TestRun.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| testRunId | String | FK |
| category | String | functionality / performance / seo / security |
| score | Int | Skor 0-100 |
| status | String | pending / running / completed / failed |

### 19. `Issue`
Temuan issue dari hasil test.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| testResultId | String | FK |
| category | String | Kategori issue |
| severity | String | critical / warning / info |
| title | String | Judul issue |
| description | String | Deskripsi |
| impact | String | Dampak |
| fix | String | Cara perbaiki |
| code | String? | Contoh kode |

### 20. `LoadTest`
Sesi uji beban.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| userId | String? | FK |
| url | String | Target URL |
| vus | Int | Virtual users |
| duration | Int | Durasi detik |
| rampUp | Int | Ramp-up detik |
| maxRps | Int | Max RPS |
| paths | String | Path yang diuji, dipisah baris |
| status | String | pending / running / completed / failed |
| summaryJson | JSON | Hasil ringkasan load test |
| createdAt / completedAt | DateTime | Timestamp |

### 21. `WebhookEndpoint`
Endpoint webhook yang didaftarkan.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| userId | String? | FK pemilik |
| url | String | URL tujuan webhook |
| secret | String | Secret untuk HMAC signature |
| events | String[] | event yang didengar |
| isActive | Boolean | Aktif/tidak |
| createdAt / updatedAt | DateTime | Timestamp |

### 22. `WebhookDelivery`
Riwayat pengiriman webhook.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | PK |
| webhookEndpointId | String | FK |
| event | String | Nama event |
| payload | JSON | Data yang dikirim |
| signature | String | HMAC signature |
| statusCode | Int? | HTTP response |
| responseBody | String? | Body response |
| deliveredAt | DateTime | Timestamp |

---

## API Routes

### Public (tanpa auth)

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/company-profile` | Profil & home content |
| GET | `/api/about` | Konten halaman tentang |
| GET | `/api/security` | Konten halaman keamanan |
| GET | `/api/settings/public` | Pengaturan publik (tema, maintenance) |

### Auth-required

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/user/me` | Data user login |
| PATCH | `/api/user/me` | Update profil |
| GET | `/api/users` | List user (admin) |
| POST | `/api/users` | Buat user (admin) |
| PATCH | `/api/users/[id]` | Update user termasuk isActive (admin) |
| DELETE | `/api/users/[id]` | Nonaktifkan user (admin) |
| GET | `/api/users/[id]/activity` | Aktivitas user |

### Test & Load Test

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/test-runs` | Riwayat test user |
| POST | `/api/test-runs` | Mulai test baru |
| GET | `/api/test-runs/[id]` | Detail test |
| POST | `/api/test-runs/[id]/issues` | Update issues (runner) |
| GET | `/api/load-tests` | Riwayat load test |
| POST | `/api/load-tests` | Mulai load test |
| GET | `/api/load-tests/[id]` | Detail load test |

### Settings & Theme

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/settings` | Semua pengaturan (admin) |
| PATCH | `/api/settings` | Update pengaturan & tema (admin) |

### Webhooks

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST | `/api/webhooks/test-completed` | Trigger internal untuk mengirim webhook ke endpoint terdaftar |
| GET | `/api/webhooks/endpoints` | List endpoint (admin/user) |
| POST | `/api/webhooks/endpoints` | Daftarkan endpoint |
| DELETE | `/api/webhooks/endpoints/[id]` | Hapus endpoint |

---

## Webhook Events

- `test_run.completed` — Test selesai
- `test_run.failed` — Test gagal
- `load_test.completed` — Load test selesai
- `issue.critical_detected` — Ditemukan issue critical
- `user.created` — User baru terdaftar

Signature format: `X-Webhook-Signature: sha256=<hmac_sha256(secret, payload)>`

---

## Catatan Migrasi ke Supabase

1. Ganti `provider = "sqlite"` menjadi `provider = "postgresql"` di `schema.prisma`.
2. Update `DATABASE_URL` ke connection string Supabase.
3. Jalankan `prisma migrate deploy`.
4. Untuk auth, ganti session custom dengan Supabase Auth atau tetap pakai custom JWT.
5. Webhook internal bisa dipindahkan ke Supabase Edge Functions jika diinginkan.

---

## Keamanan

- Semua endpoint admin memeriksa `role === "admin"`.
- Webhook endpoint harus diverifikasi signature.
- Data sensitif user (password/token) tidak disimpan plaintext.
- Rate limit diterapkan di API Gateway/Edge Function production.
