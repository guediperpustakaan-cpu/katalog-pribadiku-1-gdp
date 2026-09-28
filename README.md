# 📚 Katalog Pribadiku

Aplikasi katalog buku pribadi untuk mencatat, mengelola, mencari, dan memantau koleksi buku di rumah Anda. Dibangun dengan React + Vite + TypeScript, menggunakan **Neon PostgreSQL** sebagai database.

---

## ✨ Fitur Utama

- **Dashboard** — statistik koleksi (total buku, sudah dibaca, sedang dibaca, dipinjamkan, rating rata-rata), progres membaca, dan aksi cepat.
- **Koleksi Buku** — tampilan *grid* atau *tabel*, pencarian *debounced*, filter (kategori, lokasi, status membaca, status kepemilikan, kondisi), 5 opsi pengurutan, dan pagination.
- **Tambah/Ubah Buku** — 17 field dengan validasi Zod berbahasa Indonesia, upload foto sampul dengan kompresi otomatis, pratinjau gambar, dan *drag-and-drop*.
- **Pindai ISBN** — scan kode ISBN via kamera (ZXing) dengan *fallback* input manual, plus lookup otomatis metadata buku dari Open Library.
- **Detail Buku** — informasi lengkap, aksi cepat ubah status, dan *share*.
- **Kategori & Lokasi** — CRUD penuh dengan jumlah buku per kategori/lokasi.
- **Peminjaman** — catat peminjam, kontak, tanggal, dan jatuh tempo; buku terlambat ditandai dengan warna khusus.
- **Statistik** — chart (bar/pie/line) sebaran kategori, lokasi, kondisi, tahun terbit, dan aktivitas per bulan.
- **Pengaturan** — tema terang/gelap, ukuran font, impor/ekspor CSV, cadangan JSON, dan hapus data lokal.
- **Offline-first** — jika backend tidak dapat dijangkau, aplikasi otomatis *fallback* ke penyimpanan lokal (localStorage), jadi tetap berjalan tanpa konfigurasi server.
- **Responsif** — *sidebar* di desktop, *bottom navigation* di mobile.

---

## 🛠️ Tech Stack

| Bagian | Teknologi |
| --- | --- |
| Frontend | React 18, Vite 5, TypeScript, Tailwind CSS |
| Routing | React Router v6 (lazy-loaded routes) |
| State/Cache | TanStack Query v5 |
| Validasi | Zod (pesan bahasa Indonesia) |
| Database | Neon PostgreSQL (`@neondatabase/serverless`) |
| Backend | Express (Node.js) |
| Chart | Recharts |
| Scanner | ZXing (`@zxing/browser`) |
| Toast | Sonner |
| Icon | Lucide React |

---

## 📁 Struktur Folder

```
katalog-pribadiku/
├── db/
│   ├── schema.sql          # Skema database Neon (tabel, index, RLS)
│   └── seed.sql            # Data awal: 11 kategori, 6 lokasi, 8+ buku contoh
├── server/                 # Backend Express + Neon
│   ├── index.js            # Entry point server
│   ├── migrate.js          # Menjalankan migrasi schema.sql
│   ├── constants.js
│   ├── lib/helpers.js
│   └── routes/             # books, categories, locations, loans, readingLogs, stats
├── src/
│   ├── components/         # Komponen UI (BookForm, BookCard, BarcodeScanner, dll)
│   │   ├── layout/         # AppLayout, Sidebar, Header, MobileNavigation, ErrorBoundary
│   │   └── ui/             # Button, Input, Select, Modal, Card, Badge, Label, Textarea
│   ├── pages/              # 11 halaman (lazy-loaded)
│   ├── hooks/              # queries.ts (TanStack Query), useTheme, useDebounce, dll
│   ├── services/           # apiClient.ts + localRepository.ts (fallback offline)
│   ├── utils/              # validation, csv, image, date (locale id), cn
│   ├── types/              # Tipe TypeScript global
│   ├── constants/          # Opsi status, kategori/lokasi default, dll
│   └── styles/             # Tailwind + CSS variables theming
├── .env.example            # Contoh environment variable
├── vite.config.ts
└── package.json
```

---

## 🚀 Cara Menjalankan

### 1. Install Dependencies

```bash
npm install
```

### 2. Konfigurasi Environment

Salin file contoh:

```bash
cp .env.example .env
```

Isi `.env`:

```env
# URL API backend (opsional). Default: http://localhost:3001/api
VITE_API_URL=

# Connection string Neon PostgreSQL
# Dapatkan di: https://console.neon.tech
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require

# Port server (default 3001)
PORT=3001

# Origin frontend untuk CORS
CLIENT_ORIGIN=http://localhost:5173
```

> 🔐 **Keamanan**: `DATABASE_URL` hanya dibaca di server (Node), **tidak pernah** diekspos ke browser. Hanya variabel dengan prefiks `VITE_` yang tersedia di client.

### 3. Setup Database Neon

Buat project baru di [Neon](https://console.neon.tech), salin connection string ke `DATABASE_URL`, lalu jalankan migrasi:

```bash
npm run db:migrate
```

Skrip ini membuat seluruh tabel, index, dan RLS sesuai `db/schema.sql`.

**(Opsional)** Muat data seed (11 kategori, 6 lokasi, dan 8 buku contoh):

```bash
# Jalankan seed via psql / Neon SQL Editor
psql "YOUR_DATABASE_URL" -f db/seed.sql
```

### 4. Jalankan Aplikasi

**Development (frontend + backend sekaligus):**

```bash
npm run dev:all
```

- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:3001/api>

**Atau jalankan terpisah:**

```bash
npm run dev:server   # backend saja
npm run dev          # frontend saja
```

> 💡 **Tanpa konfigurasi server pun aplikasi tetap jalan** — data akan tersimpan di localStorage browser (mode "Lokal", ditandai di Header).

### 5. Build untuk Production

```bash
npm run build
npm run preview      # preview hasil build
```

Output ada di folder `dist/`. Serve folder ini dengan static host mana pun, dan deploy `server/` ke platform Node.js (mis. Render, Railway, Fly.io).

---

## 📜 NPM Scripts

| Script | Fungsi |
| --- | --- |
| `npm run dev` | Jalankan Vite dev server (frontend) |
| `npm run dev:server` | Jalankan backend Express |
| `npm run dev:all` | Jalankan keduanya bersamaan (concurrently) |
| `npm run build` | Type-check (`tsc -b`) + build production (`vite build`) |
| `npm run preview` | Preview hasil build |
| `npm run lint` | Type-check tanpa emit |
| `npm run db:migrate` | Jalankan migrasi schema ke Neon |

---

## 🗄️ Skema Database

Tabel utama di `db/schema.sql`:

- **`books`** — data inti (judul, penulis, ISBN, penerbit, tahun, kondisi, status, rating, sampul, dll)
- **`categories`** — kategori buku
- **`storage_locations`** — lokasi penyimpanan
- **`loans** — catatan peminjaman (peminjam, kontak, tanggal, jatuh tempo)
- **`reading_logs** — riwayat status membaca

Dilengkapi foreign key, index untuk pencarian & pagination, serta **Row Level Security (RLS)**.

### Nilai Enum

- **Status membaca**: `belum_dibaca`, `sedang_dibaca`, `sudah_dibaca`, `tidak_ingin_dibaca`
- **Status kepemilikan**: `dimiliki`, `dipinjamkan`, `hilang`, `ingin_dijual`, `rusak`
- **Kondisi**: `baru`, `sangat_baik`, `baik`, `cukup`, `rusak`
- **Status peminjaman**: `dipinjam`, `terlambat`, `dikembalikan`

---

## 📖 Halaman & Route

| Route | Halaman |
| --- | --- |
| `/` | Dashboard |
| `/koleksi` | Koleksi Buku (grid/tabel, filter, sort, pagination) |
| `/buku/tambah` | Tambah Buku (+ pindai ISBN) |
| `/buku/:id` | Detail Buku |
| `/buku/:id/edit` | Ubah Buku |
| `/kategori` | Kategori |
| `/lokasi` | Lokasi Penyimpanan |
| `/peminjaman` | Peminjaman |
| `/statistik` | Statistik |
| `/pengaturan` | Pengaturan |
| `*` | 404 Not Found |

Semua route di-*lazy load* (code-splitting per halaman) untuk load awal yang cepat.

---

## 📥 Impor / Ekspor CSV

- **Ekspor**: halaman Pengaturan → "Ekspor CSV" (semua buku, format UTF-8 dengan BOM agar kompatibel Excel).
- **Template**: "Unduh Template CSV" untuk struktur kolom yang benar.
- **Impor**: "Impor CSV" — pratinjau baris demi baris, validasi (judul wajib, format ISBN, duplikat, status/kondisi), lalu simpan massal. Baris yang error tidak menggagalkan baris valid.

Kolom: Judul, Penulis, ISBN, Penerbit, Tahun Terbit, Edisi, Bahasa, Kategori, Deskripsi, Jumlah Halaman, Kondisi, Lokasi Penyimpanan, Status Membaca, Status Kepemilikan, Rating, Catatan, Tanggal Diperoleh.

---

## ⚡ Optimasi Performa

- **Code-splitting** per route (React.lazy) — halaman hanya dimuat saat dibutuhkan
- **Manual chunks** vendor (react, tanstack-query, recharts, zxing dipisah)
- **Debounce** pencarian (350ms) untuk mengurangi request
- **Pagination** server-side (12 buku/halaman default)
- **TanStack Query caching** dengan `staleTime` & `keepPreviousData` (UI tidak "blink" saat ganti halaman)
- **Kompresi gambar** via Canvas — maksimal 1200px (full) / 400px (thumbnail), diblokir di 5MB
- **Skeleton loading** di seluruh halaman

---

## 🎨 UI/UX

- Sepenuhnya berbahasa Indonesia, format tanggal & angka locale `id-ID`
- Tema terang/gelap + 3 ukuran font (tersimpan di localStorage)
- Status selalu ditandai **ikon + warna** (tidak hanya warna), untuk aksesibilitas
- Konfirmasi sebelum menghapus (Modal)
- Empty state informatif di setiap halaman
- Toast notifikasi untuk setiap aksi
- Fokus ring yang terlihat, `aria-label`, `aria-sort` pada tabel, dan screen-reader friendly

---

## 📦 Deploy

**Frontend** (folder `dist/`): Vercel, Netlify, Cloudflare Pages, atau static host apa pun. Pastikan `VITE_API_URL` di-set ke URL backend produksi saat build.

**Backend** (`server/`): platform Node.js apa pun (Render, Railway, Fly.io). Set `DATABASE_URL`, `PORT`, dan `CLIENT_ORIGIN`.

**Database**: Neon PostgreSQL (serverless, free tier tersedia).

---

## 📝 Lisensi

MIT — bebas digunakan untuk kebutuhan pribadi Anda.

Dibuat untuk para pecinta buku 📖
