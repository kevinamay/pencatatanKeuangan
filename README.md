# FinPlan - Sistem Manajemen Keuangan & Portofolio Pasar Uang

Aplikasi web manajemen keuangan pribadi modern berbasis **Next.js** dan **Firebase Firestore** dengan UI/UX bertema **Executive Neo-Bank** (Light Mode) bernuansa Crimson Maroon (`#991213`) dan Blush Rose (`#FFD9D9`), diperkaya animasi vektor resmi dari **LottieFiles**.

---

## ✨ Fitur Utama

1. **Dashboard Executive Neo-Bank**:
   - Saldo **Sisa Gaji Bersih** otomatis (`Gaji - Pengeluaran - Tabungan`) dengan evaluasi status kesehatan arus kas (*Surplus* / *Defisit*).
   - Animasi interaktif bertema keuangan dari LottieFiles (*Flying Wallet & Money*).
   - Ringkasan 3 pilar: Pemasukan Gaji, Total Pengeluaran, dan Tabungan & Pasar Uang.
2. **Rekonsiliasi Gaji & Pengeluaran**:
   - Audit proporsi anggaran bulanan (evaluasi standar rasio 50/30/20: Kebutuhan Pokok, Keinginan, dan Tabungan).
   - Lembar laporan audit cetak / ekspor PDF otomatis.
3. **Tabungan & Portofolio Pasar Uang**:
   - Manajemen tabungan reguler, dana darurat, dan alokasi ke instrumen Reksa Dana Pasar Uang.
   - Perhitungan imbal hasil akumulatif secara riil (% return p.a., estimasi yield bulanan, keuntungan berjalan, dan total nilai portofolio).
   - Simulator pertumbuhan bunga majemuk (*Compound Interest Calculator*).
4. **Kelola Transaksi & Riwayat**:
   - Filter transaksi berdasarkan bulan, tipe, dan pencarian catatan.
   - Modal input cepat dengan pemformatan mata uang Rupiah (`Rp`) otomatis dan pemilihan tanggal/kategori dinamis.
5. **Penyimpanan Terintegrasi**:
   - Dual-sync engine: **Firebase Firestore** cloud realtime database dengan fallback ke **LocalStorage** browser.

---

## 🚀 Memulai (Getting Started)

1. **Instalasi Dependensi**:
   ```bash
   npm install
   ```

2. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```

3. Buka browser pada [http://localhost:3000](http://localhost:3000) atau [http://localhost:3001](http://localhost:3001).

---

## 🎨 Teknologi yang Digunakan

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS (Mode Terang dengan aksen `#991213` & `#FFD9D9`)
- **Backend & Cloud**: Firebase App & Cloud Firestore
- **Animasi & Ikon**: LottieFiles (`lottie-react` / vector SVG) & Lucide React
