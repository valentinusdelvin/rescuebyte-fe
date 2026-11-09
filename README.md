# RescueByte — Frontend Web Application

RescueByte adalah platform web penyelamatan makanan (*food rescue*) yang menghubungkan pelanggan dengan merchant mitra (restoran, kafe, toko roti) untuk mendistribusikan surplus makanan berkualitas dan higienis melalui konsep **Mystery Box** dengan harga terjangkau.

---

## Tech Stack

- **Framework**: React 19 dengan TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 (menggunakan token tema *Botanical Rescue*)
- **HTTP Client**: Axios (dengan interceptor Bearer Token dan transparent 401 token refresh queue)
- **Icons**: Lucide React
- **Linter**: Oxlint & ESLint

---

## Panduan Memulai

### Prasyarat
- Node.js (versi 18 ke atas)
- npm (versi 9 ke atas)

### Instalasi Dependensi
Jalankan perintah berikut untuk menginstal seluruh dependensi:

```bash
npm install
```

### Menjalankan Server Pengembangan (Dev Server)
Jalankan dev server secara lokal:

```bash
npm run dev
```

Aplikasi dapat diakses melalui browser pada `http://localhost:5173`.

### Menjalankan Build Produksi
Lakukan typecheck TypeScript dan bundling aset untuk kebutuhan produksi:

```bash
npm run build
```

Hasil build yang siap dideploy akan dibuat pada direktori `dist/`.

### Preview Build Produksi
Untuk menguji hasil build produksi secara lokal:

```bash
npm run preview
```

---

## Konfigurasi Environment Variable

Konfigurasikan variabel environment pada file `.env` di root proyek:

```env
# URL dasar backend API RescueByte
VITE_API_BASE_URL=https://dolpin-fourthree.bccdev.id/
```

Jika variabel `VITE_API_BASE_URL` tidak didefinisikan, aplikasi secara otomatis menggunakan URL default `https://dolpin-fourthree.bccdev.id/`.

---

## Struktur Direktori Proyek

```text
src/
├── api/                      # Layer transportasi API terpusat
│   ├── client.ts             # Instance Axios, interceptor token, dan auto-refresh
│   ├── types.ts              # Definisi TypeScript DTO sesuai kontrak Swagger 2.0
│   └── services/             # Pemanggil endpoint API per modul Swagger (auth, product, cart, dll.)
├── assets/                   # Aset statis (gambar, SVG, logo, ilustrasi)
├── components/               # Komponen UI modular
│   ├── ui/                   # Primitif UI atomik (Button, Input, Badge, Modal, Skeleton, dll.)
│   ├── layout/               # Header, Sidebar, Footer, dan navigasi mobile
│   ├── customer/             # Komponen khusus domain pelanggan (MysteryBoxCard, modal, dsb.)
│   ├── seller/               # Komponen khusus domain merchant mitra
│   └── common/               # Komponen bersama (Toast, BrandLoadingOverlay)
├── context/                  # React Contexts (AuthContext, CartContext, LocationContext, ToastContext)
├── hooks/                    # Custom React hooks (useAuth, useCart, useGeolocation, useReviews, dll.)
├── pages/                    # Tampilan halaman utama
│   ├── customer/             # CustomerHome, CustomerMarketplace, CustomerStoreDetail, CustomerCart, dll.
│   ├── seller/               # Dashboard, BuatDagangan, Daganganku, StoreProfile, dll.
│   └── auth/                 # AuthRoleSelection, CustomerAuth
├── services/                 # Layer service domain dan integrasi bisnis
├── utils/                    # Utilitas murni (formatRupiah, manipulasi waktu, markdown parser)
├── types/                    # Tipe data bersama aplikasi
├── app/                      # Hash routing helper dan modular routes
├── App.tsx                   # Root shell aplikasi dengan routing hash terproteksi
├── index.css                 # Konfigurasi Tailwind CSS v4 tema Botanical Rescue
└── main.tsx                  # Bootstrap aplikasi React dengan Providers
```

---

## Arsitektur & Pola Desain

1. **Modular Hash Routing**:
   Aplikasi menggunakan pola hash routing (`#beranda-customer`, `#marketplace`, `#detail-produk?id=...`) yang mendukung deep-linking dan navigasi riwayat browser tanpa memerlukan konfigurasi rewrite server.

2. **Autentikasi & Interceptor Otomatis**:
   Sesi autentikasi dikelola oleh `AuthContext`. Instance `apiClient` pada `src/api/client.ts` secara otomatis menyisipkan Bearer token pada setiap request terproteksi dan menangani pembaruan token 401 via endpoint refresh token tanpa mengganggu alur pengguna.

3. **Geolokasi Terpusat**:
   `LocationContext` dan hook `useGeolocation` mengelola deteksi koordinat lokasi pelanggan untuk perhitungan jarak geospasial pada katalog produk di sekitar, dengan fallback mulus ke koordinat default (Kota Malang).

4. **Aksesibilitas & Standar Desain**:
   Semua kontrol interaktif dirancang memenuhi kriteria aksesibilitas keyboard (indikator *focus-visible* jelas), standar kontras warna WCAG AA, serta target sentuh minimal 44x44 piksel pada perangkat mobile.
