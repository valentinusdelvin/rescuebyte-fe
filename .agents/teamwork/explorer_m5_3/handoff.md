# Handoff Report — Explorer M5.3 (Code Comments & Documentation Localization Audit)

## 1. Observation

### 1.1 Context & Authority
- **Original User Clarification** (`.agents/teamwork/ORIGINAL_REQUEST.md:68-75`):
  > "eh itu yang kumaksud tuh command pada kode loh ya, kek dokumentasi nya! bukan pada UI FrontEnd nya oke."
  > Scope Adjustment: DO NOT change user-facing UI copy/text across components/pages. The UI text is already established. The localization / natural Indonesian instruction applies strictly to CODE COMMENTS, JSDoc, and CODEBASE DOCUMENTATION per antislop-code guidelines. Technical English terms must be preserved (API, Backend, Dashboard, Marketplace, Bearer Token, Hooks, etc.).
- **Baseline Verification**:
  Executed `npm run build` (`tsc -b && vite build`):
  `✓ built in 1.33s` with **0 errors**.

### 1.2 Quantitative Code Comments Inventory
Using automated AST/regex inventory across `src/`:
- **Total TypeScript / TSX files scanned**: 148 files.
- **Total files containing comments**: 102 files.
- **Total comment lines**: 1,232 lines.
- **Language distribution**:
  - English comments: ~1,180 lines (~96%).
  - Incidental Indonesian keywords (e.g. references to route hashes like `#ulasan-pelanggan` or domain data): ~52 lines (~4%).
- **Distribution by architectural layer**:
  | Architectural Layer | Files with Comments | Total Comment Lines |
  |---------------------|---------------------|---------------------|
  | `src/api/`          | 11                  | 259                 |
  | `src/services/`     | 17                  | 306                 |
  | `src/components/`   | 37                  | 276                 |
  | `src/pages/`        | 18                  | 229                 |
  | `src/utils/`        | 3                   | 52                  |
  | `src/hooks/`        | 6                   | 49                  |
  | `src/context/`      | 3                   | 32                  |
  | `src/app/` & `App`  | 4                   | 20                  |
  | Other (`types`, etc)| 3                   | 9                   |

### 1.3 Observed AI Slop Patterns (per `antislop-code`)
Directly observed code comment antipatterns:
1. **Decorative Banner Separators (`antislop-code` § Decorative Separators)**:
   - `src/api/types.ts`: 11 occurrences of multi-line uppercase boxed banners:
     ```ts
     // Lines 7-9, 49-51, 95-97, 142-144, 159-161, 219-221, 311-313, 377-379, 510-512, 521-523, 564-566:
     /* ==========================================================================
      * Universal Envelope & Error Contracts
      * ========================================================================== */
     ```
   - `src/api/client.ts`: 2 occurrences:
     ```ts
     // Lines 129-131:
     /* ==========================================================================
      * Request Interceptor: Injects Authorization Header from localStorage
      * ========================================================================== */
     // Lines 145-147:
     /* ==========================================================================
      * Response Interceptor: Unwraps Payload + Transparent 401 Refresh Queue
      * ========================================================================== */
     ```
2. **Workflow Narration / Numbered Steps (`antislop-code` § Workflow Narration)**:
   - `src/services/orderService.ts:237, 242, 290`:
     `// 1. Prepend new order to customer list`
     `// 2. Also register in merchant order queue if already paid / waiting confirmation`
     `// 3. Clear cart if order originated from cart`
   - `src/services/sellerAnalyticsService.ts:204, 211, 214, 217, 227, 234`:
     `// 1. Fetch freshest orders...`, `// 2. Read normalized...`, `// 3. Filter orders...`, `// 4. Calculate Total Pemasukan...`
   - `src/pages/customer/CustomerStoreDetail.tsx:188, 294`:
     `// 1. Fetch live stores from backend...`, `// 2. Fetch live products from backend...`
   - `src/pages/seller/BuatDagangan.tsx:155, 175`:
     `// 1. Upload photo if selected by user`, `// 2. Submit product to backend API POST /api/v1/products`
3. **Restating the Obvious / Trivial Echo (`antislop-code` § Restating the Obvious)**:
   - `src/api/client.ts:179`: `// If sealed/frozen, skip definition`
   - `src/api/client.ts:257`: `// Update localStorage`
   - `src/services/productService.ts:101`: `// Save all products to localStorage.`
   - `src/services/productService.ts:149`: `// Delete a product.`
   - `src/components/ui/Modal.tsx:76`: `// Lock body scrolling`
   - `src/components/ui/Modal.tsx:80`: `// Attach key listener`
   - `src/components/ui/Modal.tsx:83`: `// Initial focus on dialog`
   - `src/pages/seller/BuatDagangan.tsx:204`: `// Reset form`
4. **Empty Category Labels (`antislop-code` § Empty Labels)**:
   - `src/pages/seller/BuatDagangan.tsx:45, 52, 55`: `// Form state`, `// Modal editor state`, `// Photo state`
   - `src/pages/auth/CustomerAuth.tsx:62, 67, 74`: `// Login form states`, `// Register form states`, `// Submission state`
   - `src/pages/customer/CustomerHome.tsx:239`: `// Modal states`

### 1.4 Observed High-Value Comments Warranting Preservation & Localization
Comments that explain architectural constraints, non-obvious workarounds, API contracts, and edge cases:
- `src/api/client.ts:37, 59, 91, 154, 159-160, 206, 236`:
  Explains the transparent 401 refresh queue, non-enumerable `.payload` property for dual compatibility (`res.data` vs `res.data.payload`), isolated axios instance avoiding recursion, and sanitization of transport errors.
- `src/api/services/*.ts` (all 9 service callers):
  JSDoc documenting exact Swagger endpoints, HTTP verbs, and data payloads.
- `src/context/AuthContext.tsx:20, 35, 50, 222, 235, 247`:
  JWT timestamp calculation with 24-hour absolute cap, cross-tab synchronization via storage events, session wipe.
- `src/context/LocationContext.tsx:41, 138, 184`:
  Single startup prompt guard, silent fallback to Malang coordinates without intrusive toasts, handling browser permission denial.
- `src/hooks/useReviews.ts:24, 36, 54, 139, 254, 315, 439`:
  Review aggregation math, rating distribution, parallel fetching via `Promise.allSettled`.
- `src/utils/currency.ts` & `src/utils/time.ts`:
  Indonesian Rupiah formatting rules (id-ID, dot separator, no space after Rp), 24-hour operational time conversion (handling API HH:mm vs Indonesian HH.mm).
- `src/components/ui/Badge.tsx:18-31`:
  Design tokens, WCAG AA contrast ratios (6.8:1, 4.8:1, 5.8:1, etc.).
- `src/app/hashRouting.ts:1, 16` & `src/App.tsx:22, 236, 398`:
  Hash-based deep linking query parsing (`#detail-produk?id=...`), auth guards for protected routes.
- `src/services/userService.ts:57, 67`:
  Architectural note documenting that `GET /api/v1/users/{id}` does not exist in Swagger 2.0 backend and must return null cleanly to prevent 404 network spam.

---

## 2. Logic Chain

### 2.1 Separation of Concerns: Code Comments vs UI Copy
1. **User Requirement & Clarification**:
   The user clearly instructed: `"eh itu yang kumaksud tuh command pada kode loh ya, kek dokumentasi nya! bukan pada UI FrontEnd nya oke."`
2. **Analysis of Codebase Boundaries**:
   - UI copy lives inside JSX elements (e.g. `<button>Checkout</button>`, `<span>Lihat Selengkapnya</span>`, placeholder attributes `placeholder="Cari makanan..."`, and toast notification strings).
   - Code comments live exclusively in `// ...`, `/* ... */`, and `/** ... */` syntax blocks outside executable tokens.
   - Codebase documentation lives in `README.md` and `.agents/docs/`.
3. **Deduction**:
   Any modification must touch ONLY comment delimiters (`//`, `/*`, `/**`), JSDoc docstrings, and developer markdown documentation. Zero JSX children, string literals passed to props, or backend payload keys will be modified.

### 2.2 Application of `antislop-code` Hygiene
1. **Filter Rule**:
   Decorative separators (`/* ======= */`), restating the obvious (`// Update localStorage`), workflow numbers (`// 1. ...`), and empty labels (`// Form state`) do not add technical understanding (`antislop-code` § Comments That Add Nothing).
2. **Preservation Rule**:
   Comments explaining business rules, API endpoints, error handling strategies, security considerations, and workarounds must be kept (`antislop-code` § Not a Ban).
3. **Tone & Style Guideline for Indonesian Localization**:
   - The localized comments must not read like rigid, literal machine translations (e.g. avoid *"Fungsi ini bertanggung jawab untuk mengeksekusi operasi penambahan..."*).
   - The tone must be natural, clean, concise, and professional Indonesian — written like a real Indonesian software engineer or university computer science student (*mahasiswa Teknik Informatika*).
   - Technical English terms must remain in English: `API`, `Backend`, `Frontend`, `Dashboard`, `Marketplace`, `Bearer Token`, `Hooks`, `DTO`, `Endpoint`, `Query`, `Cache`, `Interceptor`, `LocalStorage`, `Payload`, `Session`, `State`, `Props`, `Context`, `Promise`, `Callback`, `Mount`, `Routing`, `UUID`, `Midtrans`, `Snap`, `Geolocation`.

---

## 3. Detailed Targets & Translation Mapping for Worker M5.3

### 3.1 Layer 1: Centralized API Layer (`src/api/`)

#### A. `src/api/types.ts`
- **Action**: Remove the 11 decorative banners `/* =================== ... =================== */`. Replace with clean, single-line section headers.
- **Header**:
  ```ts
  // Sebelum:
  /**
   * Comprehensive Backend API TypeScript Definitions matching Swagger 2.0 contract.
   * Source Swagger: https://dolpin-fourthree.bccdev.id/swagger/doc.json
   * Base URL: https://dolpin-fourthree.bccdev.id/
   */
  // Menjadi:
  /**
   * Definisi TypeScript API Backend selaras kontrak Swagger 2.0.
   * Sumber Swagger: https://dolpin-fourthree.bccdev.id/swagger/doc.json
   * Base URL: https://dolpin-fourthree.bccdev.id/
   */
  ```
- **Section Headers**:
  - Line 7: `// Kontrak universal response & format error`
  - Line 49: `// Enum sistem`
  - Line 95: `// DTO autentikasi`
  - Line 142: `// DTO profil user`
  - Line 159: `// DTO keranjang belanja`
  - Line 219: `// DTO produk & varian`
  - Line 311: `// DTO profil & jadwal toko`
  - Line 377: `// DTO pesanan & transaksi`
  - Line 510: `// DTO cloud storage`
  - Line 521: `// DTO ulasan & ringkasan toko`
  - Line 564: `// Alias kompatibilitas tipe Swagger lama`

#### B. `src/api/client.ts`
- **Action**: Remove decorative banners at lines 129 and 145; delete obvious restatements at lines 179 and 257; localize key architectural comments into natural Indonesian.
- **Specific Mappings**:
  | Line | Existing English Comment | Proposed Natural Indonesian Comment | Action |
  |------|--------------------------|-------------------------------------|--------|
  | 37 | `/** Queue item for requests stalled while an access token refresh is in flight. */` | `/** Antrean request yang ditahan saat proses refresh token sedang berjalan. */` | Localize |
  | 59 | `/** Extracts a normalized, human-friendly error message from any backend API or network error. */` | `/** Ekstrak pesan error yang user-friendly dan ternormalisasi dari error API maupun network. */` | Localize |
  | 91 | `// Keep actionable business messages from the API, but never expose transport/server internals.` | `// Pertahankan pesan bisnis dari API, jangan tampilkan internal server/transport ke user.` | Localize |
  | 129 | `/* === Request Interceptor: Injects Authorization Header from localStorage === */` | `// Request Interceptor: Sisipkan Bearer token autentikasi dari localStorage` | Simplify & Localize |
  | 145 | `/* === Response Interceptor: Unwraps Payload + Transparent 401 Refresh Queue === */` | `// Response Interceptor: Unwrap payload dan tangani antrean refresh token 401 otomatis` | Simplify & Localize |
  | 154 | `// Unwraps { request_id, payload } envelope while keeping backward-compatibility` | `// Unwrap envelope { request_id, payload } dengan tetap menjaga backward compatibility` | Localize |
  | 159-160 | `// Expose self-referencing .payload and .request_id property non-enumerably...` | `// Pasang properti .payload dan .request_id secara non-enumerable agar kompatibel untuk pemanggil data maupun data.payload` | Localize |
  | 179 | `// If sealed/frozen, skip definition` | *(Hapus - restating code)* | Delete |
  | 191 | `// Attach normalized message on error for easy UI consumption` | `// Lampirkan pesan error yang sudah dinormalisasi agar mudah dipakai di UI` | Localize |
  | 206 | `// Handle 401 Unauthorized on protected routes with automatic token refresh` | `// Tangani 401 Unauthorized pada route terproteksi lewat refresh token otomatis` | Localize |
  | 211 | `// No refresh token available, session is completely expired` | `// Tidak ada refresh token, sesi user sudah kedaluwarsa penuh` | Localize |
  | 236 | `// Perform direct token refresh using an isolated axios call to avoid interceptor recursion` | `// Jalankan refresh token memakai instance axios terisolasi agar tidak loop rekursif di interceptor` | Localize |
  | 257 | `// Update localStorage` | *(Hapus - restating code)* | Delete |
  | 271 | `// Ignore parse errors on cached user` | `// Abaikan jika cache user gagal diparse` | Localize |
  | 274 | `// Broadcast auth refreshed event` | `// Broadcast event pembaruan token autentikasi` | Localize |
  | 292 | `// Wipe credentials on hard refresh failure` | `// Bersihkan seluruh kredensial sesi jika refresh token gagal total` | Localize |

#### C. `src/api/services/*.ts` (9 Domain Callers)
- **`authApi.ts`**:
  - L13: `/** Ambil URL otorisasi Google OAuth2 (GET /api/v1/auth/google). */`
  - L22: `/** Tukar authorization code callback Google OAuth2 (GET /api/v1/auth/google/callback). */`
  - L33: `/** Autentikasi user dengan email dan password (POST /api/v1/auth/login). */`
  - L42: `/** Cabut sesi dan batalkan refresh token aktif (POST /api/v1/auth/logout). */`
  - L53: `/** Ambil profil user yang sedang login (GET /api/v1/auth/me). */`
  - L62: `/** Perbarui access token kedaluwarsa memakai refresh token (POST /api/v1/auth/refresh). */`
  - L73: `/** Daftarkan akun baru pelanggan atau merchant (POST /api/v1/auth/register). */`
- **`cartApi.ts`**:
  - L11: `/** Ambil data keranjang pelanggan dan kelompokkan berdasarkan toko (GET /api/v1/cart). */`
  - L20: `/** Kosongkan seluruh item dari keranjang belanja (DELETE /api/v1/cart). */`
  - L29: `/** Ambil total jumlah item di keranjang (GET /api/v1/cart/count). */`
  - L38: `/** Tambah varian produk ke dalam keranjang (POST /api/v1/cart/items). */`
  - L47: `/** Hapus satu item spesifik dari keranjang (DELETE /api/v1/cart/items/{id}). */`
  - L56: `/** Update kuantitas item keranjang belanja (PATCH /api/v1/cart/items/{id}). */`
  - L65: `/** Hapus semua item dari toko tertentu di keranjang (DELETE /api/v1/cart/stores/{store_id}). */`
- **`orderApi.ts`**:
  - L21: `/** Ambil riwayat pesanan pelanggan (GET /api/v1/orders). */`
  - L30: `/** Buat pesanan baru dan peroleh Snap token Midtrans (POST /api/v1/orders/checkout). */`
  - L39: `/** Ambil daftar pesanan masuk dan riwayat pesanan merchant (GET /api/v1/orders/seller). */`
  - L48: `/** Ambil detail lengkap pesanan berdasarkan ID (GET /api/v1/orders/{id}). */`
  - L57: `/** Pembatalan pesanan oleh pelanggan (POST /api/v1/orders/{id}/cancel). */`
  - L69: `/** Update status progres pesanan oleh merchant (PATCH /api/v1/orders/{id}/status). */`
  - L84: `/** Cek status transaksi pembayaran pesanan (GET /api/v1/payments/order/{order_id}). */`
- **`productApi.ts`**:
  - L32: `/** Query produk marketplace dengan filter dan kalkulasi jarak geospasial (GET /api/v1/products). */`
  - L41: `/** Merchant membuat produk baru beserta variannya (POST /api/v1/products). */`
  - L50: `/** Merchant mengambil katalog produk miliknya sendiri (GET /api/v1/products/me/list). */`
  - L59: `/** Ambil detail produk publik, galeri foto, dan variannya (GET /api/v1/products/{id}). */`
  - L68: `/** Merchant memperbarui informasi dan stok produk (PUT /api/v1/products/{id}). */`
  - L77: `/** Merchant menghapus produk dari katalog (DELETE /api/v1/products/{id}). */`
  - L86: `/** Merchant mengubah status aktif/nonaktif produk (PATCH /api/v1/products/{id}/status). */`
- **`reviewApi.ts`**:
  - L16: `/** Ambil ulasan terbaru untuk produk tertentu (GET /api/v1/products/{product_id}/reviews). */`
  - L31: `/** Kirim rating dan ulasan produk sebagai user terautentikasi (POST /api/v1/products/{product_id}/reviews). */`
  - L46: `/** Ambil ulasan terbaru untuk toko tertentu (GET /api/v1/stores/{store_id}/reviews). */`
  - L61: `/** Kirim rating dan ulasan toko sebagai user terautentikasi (POST /api/v1/stores/{store_id}/reviews). */`
  - L76: `/** Ambil ringkasan rating toko (rata-rata rating & total ulasan) (GET /api/v1/stores/{id}/summary). */`
  - L87: `/** Edit isi ulasan dan rating (oleh pembuat ulasan atau admin) (PATCH /api/v1/reviews/{id}). */`
  - L102: `/** Hapus ulasan (oleh pembuat ulasan atau admin) (DELETE /api/v1/reviews/{id}). */`
- **`storeApi.ts`**:
  - L18: `/** Ambil daftar toko merchant publik (GET /api/v1/stores). */`
  - L27: `/** Daftarkan profil toko baru merchant (POST /api/v1/stores). */`
  - L36: `/** Perbarui jam buka dan jadwal operasional toko (PUT /api/v1/stores/me/operational). */`
  - L45: `/** Ambil profil toko merchant yang sedang login (GET /api/v1/stores/me/profile). */`
  - L54: `/** Perbarui informasi detail profil toko (PUT /api/v1/stores/me/profile). */`
  - L63: `/** Ubah status operasional toko (ACTIVE / INACTIVE) (PATCH /api/v1/stores/me/status). */`
  - L72: `/** Ambil detail toko publik berdasarkan ID (GET /api/v1/stores/{id}). */`
- **`storageApi.ts`**:
  - L7: `/** Upload satu file gambar ke cloud storage (POST /api/v1/storage/upload). */`
  - L27: `/** Upload banyak file gambar sekaligus ke cloud storage (POST /api/v1/storage/upload-multiple). */`
- **`userApi.ts`**:
  - L9: `/** Ambil profil user yang sedang login (GET /api/v1/users/profile). */`
  - L18: `/** Perbarui informasi profil user terautentikasi (PUT /api/v1/users/profile). */`
  - L27: `/** Ganti role user (berpindah antara customer dan merchant) (PATCH /api/v1/users/role). */`
- **`enumApi.ts`**:
  - L5: `/** Ambil enum sistem backend (jenis kelamin, role, status aktif) (GET /api/v1/enums). */`
  - L16: `/** Cek status kesehatan server backend (GET /health). */`

---

### 3.2 Layer 2: State & Business Logic Layer (`src/context/` & `src/hooks/`)

#### A. `src/context/AuthContext.tsx`
- L20: `/** Parse timestamp kedaluwarsa JWT (claim exp dalam milidetik). */`
- L35: `/** Hitung batas kedaluwarsa sesi efektif berdasarkan exp JWT dan batas maksimal 24 jam. */`
- L50: `/** Bersihkan seluruh data autentikasi sensitif dan sesi toko dari storage. */`
- L215: `// Inisialisasi sesi saat komponen mount`
- L222: `// Pengecekan instan apakah sesi sudah kedaluwarsa saat aplikasi dibuka`
- L235: `// Listener visibility dan focus untuk pemulihan token saat tab browser aktif kembali`
- L247: `// Sinkronisasi lintas tab browser via storage event`
- L121, L164, L202, L346, L358: Remove or keep minimal `// Abaikan parse error cache`

#### B. `src/context/CartContext.tsx`
- L59: `// Sinkronkan isi keranjang saat status autentikasi berubah`
- L158: `// Hitung akumulasi total kuantitas item dan subtotal harga`

#### C. `src/context/LocationContext.tsx`
- L41: `// Guard level modul agar dialog prompt lokasi hanya muncul sekali saat inisialisasi`
- L138: `// Fallback mulus ke koordinat Malang tanpa memunculkan error atau toast mengganggu`
- L160: `// Permintaan geolokasi otomatis saat aplikasi pertama kali dimuat`
- L184: `// Izin lokasi sebelumnya ditolak; jangan paksa prompt ulang untuk mencegah peringatan browser`
- L189: `// Status 'prompt': lakukan permintaan izin lokasi non-blocking`

#### D. `src/hooks/useAuth.ts` & `src/hooks/useCart.ts`
- `useAuth.ts:3`: `/** Custom hook untuk mengakses state autentikasi dan operasi login/logout/register. */`
- `useCart.ts:3`: `/** Custom hook untuk mengelola state keranjang belanja dan mutasi tersinkronisasi ke API. */`

#### E. `src/hooks/useReviews.ts`
- L24: `/** Hitung rata-rata rating (1 angka desimal) dari daftar ulasan. Mengembalikan 0 jika ulasan kosong. */`
- L36: `/** Hitung sebaran jumlah ulasan dari bintang 1 hingga 5. */`
- L54: `/** Custom hook untuk mengambil dan mengelola daftar ulasan produk. */`
- L139: `/** Custom hook untuk mengambil ulasan toko serta ringkasan rating toko. */`
- L254: `/** Custom hook untuk mengambil ringkasan rating toko (average_rating & total_reviews). */`
- L315: `/** Custom hook untuk mutasi ulasan (buat ulasan produk/toko, edit, dan hapus) dengan feedback toast otomatis. */`
- L439: `/** Mengambil dan mengagregasi ulasan seluruh produk milik sebuah toko via Promise.allSettled secara paralel. */`

#### F. `src/hooks/useCustomerCart.ts`
- L76: `// Catat item yang dicentang/dipilih di keranjang (default: semua terpilih)`
- L84: `// Sinkronkan isi keranjang dari database backend jika user sudah login`
- L130: `// Perkaya data cartStores dengan foto profil toko dan jam operasional langsung dari backend`
- L203: `// Hitung subtotal dan ringkasan pembayaran hanya dari item yang dipilih/dicentang`
- L257: `// Mengurangi kuantitas saat bernilai 1 akan memicu modal konfirmasi hapus`

#### G. `src/hooks/useGeolocation.ts`
- L13: `/** Custom hook untuk kontrol dan pemantauan geolokasi terpusat (koordinat live, status izin, dan fallback otomatis). */`

---

### 3.3 Layer 3: Utilities (`src/utils/`)

#### A. `src/utils/currency.ts`
- L1: `/** Utilitas pemformatan mata uang Rupiah terpusat (standar id-ID). */`
- L6: `/** Format nominal angka menjadi string ribuan bertitik (contoh: 35000 -> "35.000"). */`
- L20: `/** Format nominal dengan awalan "Rp" tanpa spasi sesuai panduan desain RescueByte (contoh: "Rp35.000"). */`
- L30: `/** Format input teks mentah menjadi format ribuan bertitik secara realtime saat user mengetik. */`
- L44: `/** Parse kembali string angka bertitik menjadi nilai integer (contoh: "10.000" -> 10000). */`

#### B. `src/utils/time.ts`
- L1: `/** Utilitas penanganan dan pemformatan jam operasional toko sesuai spesifikasi API backend. */`
- L6: `/** Validasi format jam 24 jam (00.00 - 23.59 atau 00:00 - 23:59). */`
- L19: `/** Konversi format jam backend ("07:00:00", "07:00") ke format titik standar Indonesia ("07.00"). */`
- L35: `/** Konversi format jam Indonesia ("22.00") ke format yang diterima backend ("22:00", tanpa detik). */`

#### C. `src/utils/markdown.ts`
- L3: `/** Parser inline markdown sederhana ke elemen React (bold, italic, bold-italic). */`

---

### 3.4 Layer 4: UI Primitives (`src/components/ui/`)

#### A. `src/components/ui/Button.tsx`
- L27: `// Style interaktif dasar dengan indikator focus yang aksesibel`
- L33: `// Varian warna Botanical Rescue`
- L47: `// Standar ukuran responsive dan target sentuh minimal`

#### B. `src/components/ui/Badge.tsx`
- L18: `// Geometri badge kapsul dengan kontras warna memenuhi standar WCAG AA`
- L23: `// Halal Verified: background daun lembut dengan teks zamrud (kontras 6.8:1)`
- L25: `// Stok Mendesak: background blush dengan teks merah marun (kontras 4.8:1)`
- L27: `// Rasio Diskon: hijau botani pekat dengan teks putih (kontras 5.8:1)`
- L29: `// Kotak Misteri: marigold hangat dengan teks amber (kontras 4.9:1)`
- L31: `// Netral: kontainer netral dengan teks arang (kontras 7.2:1)`

#### C. `src/components/ui/Modal.tsx`
- L36: `// Penjaga fokus keyboard dan penutup modal via tombol Escape`
- L73: `// Simpan elemen aktif sebelumnya agar fokus kembali saat modal ditutup`
- L76: `// Kunci scroll body saat modal aktif`

---

### 3.5 Layer 5: App Routing & Root Shell (`src/app/` & `src/App.tsx`)

#### A. `src/app/hashRouting.ts` & `src/app/useHashNavigation.ts`
- `hashRouting.ts:1`: `/** Helper untuk parsing route berbasis hash dan parameter query URL. */`
- `hashRouting.ts:16`: `// Ekstrak secondary anchor jika ada (contoh: #toko?name=abc#ulasan-pelanggan)`
- `useHashNavigation.ts:29`: `// Sinkronkan state navigasi dengan tombol back/forward browser serta deep linking`

#### B. `src/app/AppRoutes.tsx`
- L11: `// Code splitting level route menggunakan React.lazy() agar bundle size efisien`

#### C. `src/App.tsx`
- L22: `/** Komponen Shell Utama Aplikasi: Mengatur modular routing hash, deep linking, dan auth guard. */`
- L240: `// Deep linking untuk halaman detail produk: #detail-produk?id=...`
- L278: `// Deep linking untuk halaman detail pesanan: #detail-pesanan?id=...`
- L329: `// Deep linking untuk halaman toko: #toko?name=... atau #toko?id=...`
- L340: `// Tangani callback otorisasi Google OAuth`
- L398: `// Auth guard: Wajib login untuk mengakses marketplace, checkout, dan pesanan`
- L491: `// Redirect otomatis ke halaman login jika user logout saat berada di route terproteksi`

---

### 3.6 Layer 6: Domain Services (`src/services/`)
- **`userService.ts:57, 67`**:
  ```ts
  /**
   * Catatan Arsitektur: Endpoint GET /api/v1/users/:id tidak ada pada Swagger 2.0 backend.
   * Informasi pemesan sudah tersedia di dalam DTO pesanan, sehingga fungsi ini langsung
   * mengembalikan null secara aman tanpa memicu request 404 ke network.
   */
  ```
- **`authService.ts`**:
  - JSDoc method: `/** Simpan payload autentikasi ke localStorage dan broadcast ke listener. */`, `/** Logout user dengan mengirim refresh_token ke /api/v1/auth/logout. */`, dll.
  - Hapus trivial comments: `// ignore parse error` -> sederhanakan.
- **`productService.ts`**:
  - L71: `/** Ambil seluruh produk merchant dari localStorage dan saring dummy legacy. */`
  - L183: `/** Mapper DTO ProductResponse backend ke model frontend ProductItem. */`
  - L250: `/** Buat produk baru di backend via POST /api/v1/products dan sinkronkan ke cache lokal. */`
  - L275: `/** Ambil daftar produk merchant dari GET /api/v1/products/me/list. */`
  - L486: `/** Ambil produk publik marketplace via GET /api/v1/products dengan dukungan kalkulasi jarak koordinat. */`
- **`orderService.ts`**:
  - L182: `/** Buat pesanan baru dari data pembayaran checkout, bersihkan keranjang, dan masukkan ke antrean merchant. */`
  - L456: `/** Request pembuatan pesanan checkout ke backend via POST /api/v1/orders/checkout. */`
  - Hapus numbering `// 1.`, `// 2.` -> ubah jadi penjelasan kalimat deskriptif.

---

### 3.7 Layer 7: Codebase Documentation (`README.md`)
- Update `README.md` to reflect natural Indonesian developer documentation matching project reality:
  - Deskripsi arsitektur RescueByte (Frontend React + TypeScript + Tailwind CSS).
  - Cara instalasi (`npm install`), menjalankan dev server (`npm run dev`), dan build produksi (`npm run build`).
  - Penjelasan struktur folder (`src/api`, `src/components`, `src/context`, `src/hooks`, `src/utils`, `src/pages`).
  - Seluruh istilah teknis (React, TypeScript, Tailwind CSS, Vite, API, Interceptor) tetap dalam bahasa Inggris.

---

## 4. Caveats
1. **User-Facing UI Strings strictly untouched**:
   As explicitly requested by user clarification, NO text strings displayed in the user interface (button labels, section titles, placeholders, modal dialogs) may be changed under this task.
2. **Backend API Contracts preserved**:
   Property keys in DTOs (`request_id`, `payload`, `store_id`, `order_status`, etc.) and endpoint path strings (`/api/v1/orders/checkout`) must never be translated.
3. **TypeScript Build Integrity**:
   Because comment changes are purely syntactic non-executable tokens, `npm run build` must continue to pass cleanly without any type or syntax regressions.

---

## 5. Conclusion
1. **Root Cause of Localization Ambiguity Resolved**:
   The user's clarification (`ORIGINAL_REQUEST.md:68-75`) established that the request for "natural Indonesian" applies to **code comments, JSDoc, and developer documentation** (per `antislop-code`), NOT user-facing UI text.
2. **Current State**:
   Currently, 96% of comments across 102 files are in English, with multiple instances of AI slop (decorative banners in `src/api/types.ts` and `src/api/client.ts`, step numbering in services, trivial echo comments).
3. **Actionable Roadmap**:
   Worker M5.3 can execute the cleanup and localization with surgical precision using the exact before/after mappings cataloged in Section 3, achieving 100% compliance with antislop-code standards while leaving UI copy and business logic completely pristine.

---

## 6. Verification Method

### 6.1 Static Build & Typecheck Verification
Execute the project build command:
```powershell
npm run build
```
**Pass Criteria**:
- Exit code: 0.
- `tsc -b` completes with 0 errors.
- `vite build` bundles all chunks cleanly in `dist/`.

### 6.2 Antislop-Code Comment Hygiene Verification
Run the verification script to inspect that:
1. No decorative separator comments (`/* ====== */` or `// ======`) remain in `src/api/types.ts` or `src/api/client.ts`.
2. No numbered workflow steps (`// 1.`, `// Step 1:`) remain.
3. Core JSDoc headers in `src/api/`, `src/hooks/`, `src/context/`, and `src/utils/` are localized into clear, natural Indonesian while keeping technical terms in English.
4. Git diff check confirms that NO user-facing UI copy or JSX strings have been modified.
