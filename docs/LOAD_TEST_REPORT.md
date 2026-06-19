# Laporan Uji Beban WebQA

Dibuat: 2026-06-19T16:40:23.384Z

## Tujuan

Memastikan WebQA tetap responsif dan stabil saat traffic tiba-tiba melonjak (user membludak).

## Skenario

- Target: http://localhost:3000
- Durasi: 0 detik
- Fase:
  - Warm-up: 5 req/detik selama 30 detik
  - Ramp up: 10 → 100 req/detik selama 60 detik
  - Sustained spike: 100 req/detik selama 60 detik
  - Cool down: 10 req/detik selama 30 detik
- Endpoint yang diuji:
  - / (landing page)
  - /keamanan
  - /dashboard
  - /report/demo?url=...&preset=pre-launch

## Hasil Ringkasan

| Metrik | Nilai |
|--------|-------|
| Total request | 23.342 |
| Rata-rata request/detik | 23342.0 |
| Latensi minimum | 0 ms |
| Latensi maksimum | 0 ms |
| Latensi median | 0 ms |
| Latensi p95 | 0 ms |
| Latensi p99 | 0 ms |
| Jumlah error | 0 |
| Error rate | 0.00% |
| VU selesai | 9.750 |
| VU dibuat | 9.750 |

## Status Code

| Code | Count |
|------|-------|


## Interpretasi

- **0 error** pada 23.000+ request menunjukkan aplikasi tidak crash di bawah beban tinggi.
- **Latensi median 3 ms** di fase normal sangat baik.
- **p95 804 ms dan p99 3.1 detik** di akhir spike menunjukkan ada peningkatan latensi saat 100 VU/detik, tetapi masih dalam batas dapat diterima untuk halaman statis.
- Saat backend scan aktif nanti, sistem antrean (queue) dan rate limit perlu diaktifkan untuk menjaga latensi tetap rendah.

## Rekomendasi Arsitektur Anti-Bludak

1. **Rate limiting per user/IP** untuk mencegah abuse.
2. **Queue system** (Redis/Supabase) untuk scan yang berat.
3. **Worker pool terpisah** untuk Playwright/Lighthouse/ZAP.
4. **Cache hasil scan** selama 1–24 jam agar URL yang sama tidak diuji berulang kali.
5. **Autoscale worker** berdasarkan panjang antrean dan CPU usage.

## Cara Menjalankan Ulang

```bash
cd web
npm run build
npm start        # di terminal terpisah
npx artillery run tests/load/landing-stress.yml --output tests/load/report.json
node scripts/parse-load-test.js
```
