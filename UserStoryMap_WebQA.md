# User Story Map
## WebQA — Asisten Tester Web Berbasis AI

**Version:** 1.0.0  
**Date:** Juni 2026

---

## Tujuan Dokumen

User story map ini menyusun fitur-fitur WebQA berdasarkan aktivitas pengguna dari awal hingga akhir. Fokus utama adalah memastikan **MVP benar-benar menyelesaikan masalah inti**: pengguna dapat memeriksa website mereka dengan mudah dan mendapatkan rekomendasi yang bisa langsung ditindaklanjuti.

---

## Backbone (Aktivitas Utama Pengguna)

```
[1. Menemukan] → [2. Mengonfigurasi] → [3. Menjalankan] → [4. Memantau] → [5. Melihat Hasil] → [6. Bertindak] → [7. Mengelola & Memelihara]
```

---

## 1. Menemukan WebQA

| Task | User Story | Priority |
|---|---|---|
| Mengenal produk | Sebagai **Vibe Coder**, saya ingin memahami apa yang dilakukan WebQA dalam 10 detik, agar saya tertarik mencoba. | Must |
| Sign up / Log in | Sebagai pengguna, saya ingin mendaftar dengan email atau OAuth (Google/GitHub), agar saya bisa menyimpan riwayat tes. | Must |
| Melihat contoh laporan | Sebagai pengguna, saya ingin melihat contoh laporan sebelum signup, agar saya tahu kualitas outputnya. | Should |

---

## 2. Mengonfigurasi Pemeriksaan

| Task | User Story | Priority |
|---|---|---|
| Memasukkan URL | Sebagai pengguna, saya ingin memasukkan URL website saya dengan mudah (bahkan tanpa `https://`), agar saya bisa langsung memulai. | Must |
| Memilih preset | Sebagai pengguna, saya ingin memilih preset seperti "Cek Setelah Deploy" atau "Cek SEO", agar saya tidak bingung memilih kategori. | Must |
| Memilih kategori manual | Sebagai pengguna yang lebih advanced, saya ingin memilih kategori tes secara manual, agar saya punya kontrol penuh. | Should |
| Mengatur autentikasi target | Sebagai pengguna, saya ingin memberikan kredensial untuk situs yang diproteksi (Basic Auth / Bearer / Cookie), agar WebQA bisa memeriksa halaman private. | Could (Phase 2) |

---

## 3. Menjalankan Pemeriksaan

| Task | User Story | Priority |
|---|---|---|
| Memulai tes | Sebagai pengguna, saya ingin menekan satu tombol "Periksa Sekarang", agar tes berjalan tanpa setup tambahan. | Must |
| Validasi URL | Sebagai sistem, saya ingin memastikan URL valid, reachable, dan bukan private IP, agar tidak terjadi SSRF atau kebingungan pengguna. | Must |
| Menunjukkan progres | Sebagai pengguna, saya ingin melihat progress tiap kategori tes secara real-time, agar saya tahu estimasi selesai. | Must |
| Menangani kegagalan parsial | Sebagai pengguna, saya ingin tetap melihat hasil kategori yang berhasil meskipun ada kategori yang timeout, agar saya tidak kehilangan informasi. | Should |

---

## 4. Memantau Proses

| Task | User Story | Priority |
|---|---|---|
| Progress bar per kategori | Sebagai pengguna, saya ingin melihat 4 kartu kategori dengan progress bar, agar saya tahu mana yang sedang dikerjakan. | Must |
| Live log | Sebagai pengguna advanced, saya ingin melihat log singkat proses tes, agar saya bisa debug jika ada masalah. | Should |
| Notifikasi selesai | Sebagai pengguna, saya ingin menerima notifikasi saat tes selesai, agar saya tidak perlu menunggu di halaman. | Could (Phase 2) |

---

## 5. Melihat Hasil Laporan

| Task | User Story | Priority |
|---|---|---|
| Melihat skor keseluruhan | Sebagai pengguna, saya ingin melihat skor besar 0–100, agar saya langsung tahu kondisi website. | Must |
| Melihat skor per kategori | Sebagai pengguna, saya ingin melihat skor fungsionalitas, performa, SEO, dan keamanan, agar saya tahu area lemah. | Must |
| Melihat daftar issue | Sebagai pengguna, saya ingin melihat daftar masalah yang diurutkan berdasarkan severity, agar saya tahu prioritas. | Must |
| Memahami issue | Sebagai pengguna, saya ingin setiap issue dijelaskan dengan bahasa sederhana, agar saya mengerti tanpa belajar QA. | Must |
| Melihat rekomendasi perbaikan | Sebagai pengguna, saya ingin mendapatkan contoh kode atau langkah perbaikan, agar saya bisa langsung memperbaiki. | Must |
| Bertanya ke AI | Sebagai pengguna, saya ingin bertanya soal hasil tes dan mendapat penjelasan, agar saya tidak perlu mencari di Google. | Should |
| Melihat diff vs tes sebelumnya | Sebagai pengguna, saya ingin melihat perubahan skor dibanding tes sebelumnya, agar saya tahu apakah ada regresi. | Should |

---

## 6. Bertindak atas Hasil

| Task | User Story | Priority |
|---|---|---|
| Share report | Sebagai pengguna, saya ingin membagikan laporan via link, agar tim/klien saya bisa melihat. | Must |
| Export report | Sebagai pengguna, saya ingin mengunduh laporan dalam PDF atau JSON, agar saya bisa arsipkan. | Should |
| Tandai issue sebagai resolved | Sebagai pengguna, saya ingin menandai issue sudah diperbaiki, agar saya bisa melacak progress. | Could (Phase 2) |
| Mendapatkan rekomendasi kontekstual repo | Sebagai pengguna, saya ingin WebQA membaca repo GitHub saya, agar rekomendasi lebih sesuai framework. | Could (Phase 2) |

---

## 7. Mengelola & Memelihara

| Task | User Story | Priority |
|---|---|---|
| Melihat riwayat | Sebagai pengguna, saya ingin melihat semua tes yang pernah saya jalankan, agar saya bisa membandingkan. | Must |
| Mengelompokkan ke project | Sebagai pengguna, saya ingin membuat project untuk mengelompokkan URL, agar saya bisa mengatur banyak klien/site. | Should |
| Menghapus data | Sebagai pengguna, saya ingin menghapus riwayat tes saya, agar saya punya kontrol penuh atas data. | Should |
| Menjadwalkan tes rutin | Sebagai pengguna, saya ingin menjadwalkan tes harian/mingguan, agar saya tahu jika terjadi regresi. | Could (Phase 3) |
| Menerima alert regresi | Sebagai pengguna, saya ingin menerima email/webhook jika skor turun, agar saya bisa langsung bertindak. | Could (Phase 3) |
| Mengelola tim | Sebagai pengguna, saya ingin mengundang anggota tim ke project, agar kami bisa kolaborasi. | Could (Phase 3) |

---

## Release Plan

### Release 1 — MVP (4 minggu)
Fokus: pengguna dapat memeriksa URL, melihat laporan, dan memahami rekomendasi.

**Must-have stories:**
1. Landing page jelas & signup/login.
2. Memasukkan URL + validasi.
3. Pilih preset / kategori manual.
4. Jalankan tes satu klik.
5. Progress real-time.
6. Skor keseluruhan & per kategori.
7. Daftar issue dengan severity.
8. Penjelasan masalah + rekomendasi perbaikan.
9. Share report link.
10. Riwayat tes.

**Should-have stories:**
- Export PDF/JSON.
- AI chat follow-up dasar.
- Live log.

### Release 2 — Full Suite (3 minggu)
Fokus: kedalaman hasil, autentikasi, dan integrasi.

- Auth-aware testing (Basic Auth, Bearer, Cookie).
- OWASP ZAP passive scan.
- Projects & dashboard.
- Diff view.
- GitHub repo integration.
- AI explanation yang lebih kaya.

### Release 3 — Growth (3 minggu)
Fokus: monitoring berkelanjutan dan kolaborasi tim.

- Scheduled tests.
- Email & webhook alerts.
- Team accounts.
- Login flow recorder.
- CI/CD API access.

---

## Walking Skeleton

Urutan fitur yang harus berfungsi end-to-end sebelum iterasi lanjutan:

1. **Auth:** user bisa signup/login.
2. **URL input:** user bisa memasukkan URL.
3. **Validation:** sistem menolak URL invalid/private.
4. **Run:** sistem menjalankan minimal 1 runner (Playwright functionality).
5. **Realtime:** user melihat status tes berubah.
6. **Report:** user melihat skor dan daftar issue.
7. **History:** hasil tes tersimpan dan bisa dilihat kembali.

---

## Catatan

- Prioritas didasarkan pada **masalah inti pengguna**: memeriksa website dengan mudah dan mendapat rekomendasi yang dapat ditindaklanjuti.
- Fitur enterprise (team, schedule, CI/CD) sengaja ditunda ke Phase 3 agar MVP tetap ramping dan cepat diuji pasar.
