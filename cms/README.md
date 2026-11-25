# Product Requirements Document (PRD)
## Layah Catering — Integrated Catering Management System (CMS)

| Metadata | Details |
| :--- | :--- |
| **Product Name** | Layah Catering CMS (`Layah. Catering · Malang`) |
| **Version** | 1.0.0 |
| **Active Branch** | Tidar Atas, Malang |
| **Frontend Stack** | Next.js (App Router), TypeScript, Tailwind CSS |
| **Backend Stack** | Golang REST API (JWT Authentication & RBAC Middleware) |
| **Database** | Neon DB (Serverless PostgreSQL) |
| **Target Users** | Customers, Kitchen Staff, Delivery Drivers, Management / Administrators |

---

## 1. Executive Summary

**Layah Catering CMS** is a multi-role web platform that unifies the end-to-end catering workflow—from customer meal ordering with per-item allergen preferences, to live kitchen display preparation and QR label printing, dual-QR driver delivery verification, and executive sales/operations management.

By connecting a responsive Next.js frontend to a high-concurrency Golang API backed by Neon PostgreSQL, the system minimizes allergen safety errors, prevents misdelivered packages, and gives management real-time visibility into revenue, orders, menus, and customer memberships.

---

## 2. Architecture & Tech Stack

### 2.1 System Architecture
* **Frontend (`C:\catering\cms\src`)**: Next.js App Router with Route Groups (`(auth)`, `(customer)`, `(kitchen)`, `(driver)`, `(management)`) isolating layouts, viewport behaviors, and role access.
* **API Layer**: Typed fetch client in `src/lib/api/*` communicating with the Golang backend via `NEXT_PUBLIC_API_URL`.
* **Backend (Golang)**: RESTful JSON API handling authentication (JWT + HTTP-only cookies or Bearer tokens), business logic, QR payload validation, PDF/CSV report generation, and PostgreSQL queries (`pgx` / `GORM`).
* **Database (Neon PostgreSQL)**: Serverless Postgres with relational constraints, indexed order statuses, and JSONB/text support for dietary notes.

### 2.2 Role-Based Access Control (RBAC)
* `src/middleware.ts` inspects the authenticated user's session cookie and role on every route request, preventing unauthorized cross-workspace navigation.
* The Golang backend independently verifies the JWT signature and role claims on every protected endpoint.

| Role | Default Redirect | Allowed Routes | Viewport Strategy |
| :--- | :--- | :--- | :--- |
| `customer` | `/catalog` | `/catalog`, `/checkout`, `/order-success/*` | Desktop + Mobile Responsive |
| `kitchen` | `/kitchen` | `/kitchen`, `/kitchen/orders/*`, `/kitchen/history` | Desktop Only (`>= 1024px` guard) |
| `driver` | `/driver` | `/driver` | Mobile App Shell (`max-w-md` centered) |
| `management` | `/management/dashboard` | `/management/*` | Desktop Admin Layout |

---

## 3. Design System & Brand Identity

All four workspaces share the **Layah Catering** visual language:

* **Color Palette**:
  * **Primary Forest Green**: `#1A3628` (Top navbars, management sidebar, login canvas, QR frames, primary dark accents)
  * **Warm Sand / Canvas**: `#D1C2A6` (Main page background across Customer, Kitchen, Driver, and Management views)
  * **Soft Parchment / Card**: `#E5DCCB` / `#F7F4EE` (Order cards, form cards, KDS tickets, login card)
  * **Burgundy CTA & Alert**: `#681D2B` (Primary action buttons: *Add to Cart*, *Checkout*, *Login*, *Print QR Label*, *Verifikasi Data*, *Download Laporan*)
  * **Allergen / Danger Tint**: `#F4DFDD` background with `#8B2635` border/text for dietary warnings and mismatch alerts
* **Typography**:
  * **Display / Headings**: Editorial Serif (e.g., *Cormorant Garamond* / *Playfair Display*) for brand titles, KPI figures, and page headers
  * **Body / UI**: Clean Sans-Serif (e.g., *Inter* / *Plus Jakarta Sans*) for tables, form inputs, labels, and tabular currency figures
* **Localization & Formatting**:
  * Currency formatted in Indonesian Rupiah (`Rp107.000`, dot thousand separators, no decimals)
  * Timestamps displayed in `WIB` (Western Indonesian Time, UTC+7)

---

## 4. Functional Requirements by Role

### 4.1 Unified Authentication (`/login`)
* **UI Elements**:
  * Deep forest-green framed background with Layah logo and tagline (*"Thoughtful food. Seamless service."*).
  * Centered parchment card (`Welcome back`) with `Username` input, `Password` input (with visibility toggle), `Remember me` checkbox, `Forgot password?` link, and burgundy `Login` CTA.
  * **4-Role Workspace Selector**: Segmented control allowing the user to select `Customer`, `Kitchen Staff`, `Driver`, or `Management`.
* **Behavior**:
  * Submits credentials + selected workspace role to `POST /api/v1/auth/login`.
  * Backend validates that the user account holds the selected role (preventing unauthorized role escalation).
  * On success, stores session/JWT and redirects to the role's default home route.

---

### 4.2 Customer Workspace (Desktop + Mobile Responsive)

#### Screen 1: Menu Katalog & Keranjang Belanja (`/catalog`)
* **Navigation Bar**: Layah logo (`CATERING · MALANG`), live debounced search bar (`Cari menu favorit Anda`), and user profile menu (e.g., `Aditya`).
* **Catalog Section**:
  * Header (`THE CATERING COLLECTION` / `Menu Katalog`) with dynamic item counter (`6 menu pilihan`).
  * Category filter tabs: `Semua Menu`, `Paket Nasi`, `Lauk Pilihan`, `Sayuran`.
  * Responsive menu grid (3 columns on desktop, 2 on tablet, 1 on mobile).
  * Each **Menu Card** displays: Menu photo (or styled fork/knife placeholder), Name, Ingredients subtitle, Price per portion (`Rp25.000 / porsi`), and `Add to Cart` button. Unavailable items are hidden or marked `Habis`.
* **Shopping Cart (`Keranjang Belanja`)**:
  * **Desktop**: Persistent right-hand sidebar showing summary (`3 menu · 4 porsi`).
  * **Mobile**: Sticky bottom summary bar showing total portions & price; tapping opens a slide-up `MobileCartDrawer`.
  * **Cart Item Row**: Thumbnail, item name, unit price, `Hapus` link, **Preferensi Alergen & Catatan Khusus** text field (e.g., *"Contoh: tanpa kacang, ganti minyak goreng, dll."*), quantity stepper (`- 2 +`), and line subtotal.
  * **Footer**: Order summary (`Total Price`) and burgundy `Checkout` button (disabled when cart is empty).

#### Screen 2: Form Pemesanan (`/checkout`)
* **Progress Stepper**: `01 Katalog — 02 Pemesanan — 03 Selesai` (step 02 active).
* **Form Card**:
  * Header with `DETAIL PENGIRIMAN` and cart summary (`4 porsi · Rp107.000`).
  * Required inputs: `Nama Lengkap`, `Nomor Telepon`, and `Alamat Pengiriman` (multiline). Pre-fills from logged-in customer profile if available.
  * CTA: `Konfirmasi Pesanan`. Submits cart items, allergen notes, and shipping details to `POST /api/v1/orders`.

#### Screen 3: Pesanan Berhasil Dibuat (`/order-success/[orderId]`)
* **Progress Stepper**: Step `03 Selesai` active.
* **Confirmation View**: Circular checkmark icon, `TERIMA KASIH ATAS PESANAN ANDA`, `Pesanan Berhasil Dibuat!`, generated Order ID (`#ORD-9021`), status message (*"Pesanan Anda sedang diproses oleh dapur."*), and `Kembali ke Katalog` button.

---

### 4.3 Kitchen Staff Workspace (Desktop Only)

> **Viewport Constraint**: Enforced via `DesktopOnlyGuard.tsx`. If accessed on screens `< 1024px`, displays an informational screen instructing staff to use a kitchen desktop/tablet monitor.

* **Persistent Chrome**:
  * Top Navbar: Layah logo, tabs (`Kitchen display`, `Order history`), real-time order/customer search bar, and staff avatar (`Ayu Pramesti · Kitchen Staff`).
  * Bottom Status Bar: Tagline + live connection & sync timestamp (`Kitchen connected · Last synced 10:42`).

#### Screen 1: Kitchen Display System (`/kitchen`)
* **Header**: `KITCHEN OPERATIONS` / `Kitchen display system` + live date, WIB clock, and shift label (`Lunch service`).
* **KPI Summary Strip**:
  1. `Active orders` (Incoming + Preparing + Ready)
  2. `Items to serve` (Total food & beverage portions across active orders)
  3. `Ready to dispatch` (Awaiting driver collection)
  4. `Dietary requests` (Highlighted in burgundy; count of active orders with allergen notes)
* **Filter Bar**: Filter pills (`All orders`, `Dietary requests`), route dropdown (`All routes`), and sort toggle (`Newest first` / `Oldest first`).
* **3-Column Kanban Board**:
  * Columns: **Incoming** (`Review & confirm`), **Preparing** (`Made with care`), **Ready to dispatch** (`Packed & checked`).
  * **Order Ticket Card**: Order ID (`#ORD-001`), live elapsed minutes, customer name, item breakdown (`2x Nasi Liwet Nusantara`), prominent red **Allergy Pill** (`⚠ Peanut allergy` / `⚠ Shellfish allergy`) or muted `No special requests`, total item count, route & scheduled delivery time (`Selatan · Kemang · 11:30`), and `View ↗` link. Cards with allergies have a distinct burgundy border highlight.
  * Auto-refreshes via polling (every 10–15 seconds) or WebSocket/SSE via `useKdsOrders.ts`.

#### Screen 2: Order Details & QR Label Printing (`/kitchen/orders/[id]`)
* **Header**: Breadcrumb (`Kitchen display / #ORD-001`), Order Title + status badge, `Back to kitchen` button.
* **Left Panel (`Order details`)**:
  * Metadata grid: Customer Name & Phone, Order Received timestamp, Delivery Route & full address, Scheduled Delivery slot, elapsed time.
  * Itemized table: Quantity badge, Dish name + inline crimson allergen note (e.g., *Vegetable salad · No peanuts*), Category (`Main`, `Side`, `Beverage`).
  * **Allergy Safety Banner** (shown whenever any item has allergen notes): Prominent crimson alert box (`WARNING: Peanut Allergy - No peanuts in Gado-Gado. Use clean utensils and a separate preparation area. Avoid cross-contact.`).
  * **Workflow Controls**: Buttons to advance order status (`Confirm & Start Preparing` -> `Mark Ready to Dispatch`).
* **Right Panel (`Action panel`)**:
  * **QR Label Preview (`70 × 90 mm`)**: Renders Layah header, Order ID (`#ORD-001`), Customer Name, scannable QR code (encoding signed Kitchen Order QR token), route/time, and red allergen warning badge if applicable.
  * `Print QR Label` burgundy button invoking a dedicated `@media print` thermal-label stylesheet.

#### Screen 3: Order History (`/kitchen/history`)
* Archive table of completed and dispatched orders (`Dispatched`, `Delivered`, `Cancelled`).
* Supports searching by Order ID or customer name, filtering by date range and dietary requests, inspecting full order details, and reprinting QR labels if needed.

---

### 4.4 Driver Workspace (Mobile App Shell — `/driver`)

* **Layout**: Mobile-optimized shell (`max-w-md` centered on desktop, full viewport on smartphones).
* **Header**: `KATERING / KURIR` on the left; state-driven status badge on the right (`VERIFIKASI`, `PERIKSA ULANG`, or `TERVERIFIKASI`).

#### State 1: Verifikasi Pengiriman (Dual QR Scanner)
* Instruction: *"Scan kedua QR sebelum menyerahkan paket."*
* **Scanner 1 (`1. Scan QR Dapur (Pesanan)`)**: Scans the QR label printed by the kitchen on the food package.
* **Scanner 2 (`2. Scan QR Resi (Tujuan)`)**: Scans the destination/manifest QR code for the delivery stop.
* Uses device camera via `useQrScanner.ts` with a manual code input fallback for testing or damaged labels.
* CTA: `Verifikasi Data` calls `POST /api/v1/driver/verify-qr` with both QR payloads.

#### State 2: Peringatan Salah Alamat (Mismatch State)
* Triggered when `QR Dapur` and `QR Resi` do not match the same order or assigned route.
* Displays large burgundy warning triangle, `PERINGATAN!`, explanation (*"Data QR tidak sesuai dengan rute pengiriman. Periksa kembali alamat atau paket sebelum melanjutkan."*), and strict hold notice (*"Jangan serahkan paket sebelum data dikonfirmasi."*).
* CTAs:
  * `Hubungi Manajemen` (opens phone dialer / WhatsApp / escalates alert to Management)
  * `Scan Ulang` (resets both scanner states back to State 1)

#### State 3: Update Status Pengiriman (Verified State)
* Triggered when both QR codes match.
* Displays checkmark circle, `Rute & Paket Sesuai!`, and a dark-green **Recipient Card** showing `PENERIMA`, tracking ID (`KTG-0248`), recipient name, and full delivery address.
* CTA: `Update Status: Diantar` calls `PATCH /api/v1/driver/orders/:id/deliver`, updating order status to `delivered` and revealing the confirmation banner (`✓ Status pengiriman berhasil diperbarui: Diantar.`).

---

### 4.5 Management Workspace (Desktop Admin Dashboard)

* **Persistent Sidebar (Dark Green `#1A3628`)**:
  * Layah logo, `RUANG KERJA` navigation (`Dashboard`, `Pesanan`, `Menu`, `Membership`).
  * Footer block: `CABANG AKTIF` (`Tidar Atas, Malang`), motto, and system version (`ADMINISTRASI · V 2.4`).
* **Topbar**: Breadcrumb (`Manajemen > [Page]`), notification bell (e.g., driver mismatch alerts & new orders), and Administrator profile dropdown (`Anindya Putri · Administrator`).

#### Page 1: Dashboard — Laporan Penjualan (`/management/dashboard`)
* **Header**: `Laporan Penjualan` + `Download Laporan (PDF)` burgundy button.
* **Period Filter**: Month/year dropdown (`Oktober 2026`) + date span summary (`01–31 Oktober 2026 · Seluruh pesanan selesai`).
* **KPI Cards (3 Columns)**:
  * `Total Pesanan` (count + MoM percentage trend vs previous month)
  * `Pendapatan` (Rupiah revenue + MoM percentage trend)
  * `Pelanggan Aktif` (active customer count + MoM percentage trend)
* **Monthly Revenue Chart (`Tren Penjualan Bulanan`)**:
  * Vertical bar chart displaying net revenue in million Rupiah (`Jan`–`Okt` / full year) with value labels inside bars, peak-month callout, and cumulative YTD total.

#### Page 2: Pesanan — Orders Management (`/management/orders`)
* **Purpose**: Full operational control over all incoming, active, delivered, and cancelled orders across the catering branch.
* **Controls**:
  * Quick status summary pills (`Semua`, `Incoming`, `Preparing`, `Ready`, `Diantar`, `Dibatalkan`).
  * Search by Order ID, Customer Name, or Route; Date range filter; Dietary/Allergen toggle filter.
* **Orders Table**:
  * Columns: `ID Pesanan`, `Pelanggan & Rute`, `Ringkasan Item`, `Catatan Alergen` (badge), `Total Harga`, `Status` (color-coded pill), `Waktu Pesan`, and `Aksi`.
* **Order Detail Modal (`ManagementOrderModal`)**:
  * Inspects full customer contact, shipping address, itemized breakdown with allergen notes, driver verification log (QR verified timestamp), manual status override dropdown, and print invoice/QR action.

#### Page 3: Menu — Menu Catalog Management (`/management/menu`)
* **Purpose**: Full CRUD management of dishes displayed in the Customer Catalog.
* **Header**: `Manajemen Menu` + `+ Tambah Menu` burgundy button.
* **Filters**: Search by menu name/ingredient, Category filter (`Semua Menu`, `Paket Nasi`, `Lauk Pilihan`, `Sayuran`), Availability filter (`Semua`, `Tersedia`, `Habis`).
* **Menu List / Grid**:
  * Displays Dish Photo, Name, Ingredients subtitle, Category badge, Price (`Rp/porsi`), live `Tersedia` toggle switch (instant `PATCH` to enable/disable item in Customer catalog), `Edit`, and `Hapus` buttons.
* **Create / Edit Menu Modal (`MenuFormModal`)**:
  * Fields: `Nama Menu`, `Kategori`, `Harga per Porsi (Rp)`, `Deskripsi / Komposisi`, `URL Foto / Upload Gambar`, `Status Ketersediaan`.
  * Includes validation and confirmation modal before deleting a menu item (soft delete to preserve historical order integrity).

#### Page 4: Membership — Data Membership (`/management/membership`)
* **Header**: `Data Membership` + `Ekspor Data (CSV)` burgundy button.
* **Summary Strip**: Total registered customers (`108 pelanggan terdaftar`), `Active` count, `Inactive` count, and cumulative date indicator.
* **Controls**: Search input (`Cari nama atau ID member`), Status dropdown (`Semua status`, `Active`, `Inactive`), Sort dropdown (`Urutkan: ID Member`, `Total Transaksi`, `Tanggal Bergabung`).
* **Membership Table**:
  * Columns: `Nama Pelanggan` (with email subtitle), `ID Member` (`LRS-001`), `Status Keanggotaan` (`Active` / `Inactive` pill), `Tanggal Bergabung`, `Total Transaksi` (`Rp24.750.000`).
  * Server-side pagination (`Menampilkan 1–10 dari 108 pelanggan`).

---

## 5. Neon PostgreSQL Database Schema

```sql
-- Enums
CREATE TYPE user_role AS ENUM ('customer', 'kitchen', 'driver', 'management');
CREATE TYPE menu_category AS ENUM ('paket_nasi', 'lauk_pilihan', 'sayuran', 'minuman');
CREATE TYPE order_status AS ENUM ('incoming', 'preparing', 'ready_to_dispatch', 'dispatched', 'delivered', 'cancelled');
CREATE TYPE member_status AS ENUM ('active', 'inactive');

-- 1. Users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(60) UNIQUE NOT NULL,
    email           VARCHAR(120) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    full_name       VARCHAR(120) NOT NULL,
    phone           VARCHAR(30),
    default_address TEXT,
    role            user_role NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Memberships (Customer Loyalty & Tracking)
CREATE TABLE memberships (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_code       VARCHAR(20) UNIQUE NOT NULL, -- e.g., LRS-001
    status            member_status NOT NULL DEFAULT 'active',
    total_spent       BIGINT NOT NULL DEFAULT 0,
    joined_at         DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 3. Menus
CREATE TABLE menus (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(120) NOT NULL,
    description     TEXT NOT NULL,                 -- e.g., "Nasi liwet · ayam suwir · sambal"
    category        menu_category NOT NULL,
    price           INTEGER NOT NULL CHECK (price >= 0),
    image_url       TEXT,
    is_available    BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at      TIMESTAMPTZ,                   -- Soft delete
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Orders
CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code          VARCHAR(20) UNIQUE NOT NULL, -- e.g., ORD-9021
    tracking_code       VARCHAR(20) UNIQUE NOT NULL, -- e.g., KTG-0248
    customer_id         UUID NOT NULL REFERENCES users(id),
    customer_name       VARCHAR(120) NOT NULL,
    customer_phone      VARCHAR(30) NOT NULL,
    delivery_address    TEXT NOT NULL,
    delivery_route      VARCHAR(80) NOT NULL DEFAULT 'Malang · Tidar Atas',
    scheduled_delivery  TIMESTAMPTZ,
    status              order_status NOT NULL DEFAULT 'incoming',
    has_allergen_alert  BOOLEAN NOT NULL DEFAULT FALSE,
    allergen_summary    TEXT,
    total_items         INTEGER NOT NULL DEFAULT 0,
    total_price         BIGINT NOT NULL DEFAULT 0,
    kitchen_qr_token    VARCHAR(128) UNIQUE NOT NULL,
    receipt_qr_token    VARCHAR(128) UNIQUE NOT NULL,
    assigned_driver_id  UUID REFERENCES users(id),
    delivered_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Order Items
CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_id         UUID NOT NULL REFERENCES menus(id),
    menu_name       VARCHAR(120) NOT NULL,
    menu_category   menu_category NOT NULL,
    unit_price      INTEGER NOT NULL,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    allergen_note   TEXT,
    subtotal        BIGINT NOT NULL
);

-- 6. Driver QR Verification Logs
CREATE TABLE driver_verifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID REFERENCES orders(id),
    driver_id           UUID NOT NULL REFERENCES users(id),
    scanned_kitchen_qr  TEXT NOT NULL,
    scanned_receipt_qr  TEXT NOT NULL,
    is_match            BOOLEAN NOT NULL,
    verified_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for KDS and Reporting Performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_menus_category_available ON menus(category, is_available) WHERE deleted_at IS NULL;
```

---

## 6. Golang Backend REST API Contract (`/api/v1`)

### 6.1 Authentication
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Authenticates `username`, `password`, and `role`; returns JWT + user profile |
| `POST` | `/auth/logout` | Auth | Clears auth cookie / invalidates token |
| `GET` | `/auth/me` | Auth | Returns current authenticated user & role |

### 6.2 Menu Catalog & Management
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/menus` | Customer, Management | Lists menus with query params: `category`, `search`, `available_only` |
| `POST` | `/menus` | Management | Creates a new dish |
| `PUT` | `/menus/:id` | Management | Updates dish details, price, or image |
| `PATCH` | `/menus/:id/availability` | Management | Quick toggle for `is_available` |
| `DELETE` | `/menus/:id` | Management | Soft-deletes a menu item |

### 6.3 Customer Orders
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders` | Customer | Creates order + items, computes totals, generates QR tokens, sets `has_allergen_alert` |
| `GET` | `/orders/:orderCode` | Customer (Owner) | Fetches confirmation details for `/order-success/[orderId]` |

### 6.4 Kitchen Operations (KDS)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/kitchen/orders` | Kitchen | Returns active Kanban orders (`incoming`, `preparing`, `ready_to_dispatch`) + KPI counts |
| `GET` | `/kitchen/orders/:id` | Kitchen | Returns full order details, allergen warnings, and QR payload for label printing |
| `PATCH` | `/kitchen/orders/:id/status` | Kitchen | Moves order along KDS stages (`incoming` -> `preparing` -> `ready_to_dispatch`) |
| `GET` | `/kitchen/history` | Kitchen | Returns paginated history of dispatched/delivered/cancelled orders |

### 6.5 Driver Delivery Verification
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/driver/verify-qr` | Driver | Validates `kitchen_qr_token` against `receipt_qr_token`, logs attempt, returns match status & recipient info |
| `PATCH` | `/driver/orders/:id/deliver` | Driver | Marks verified order as `delivered`, sets `delivered_at`, updates customer membership `total_spent` |

### 6.6 Management Analytics, Orders & Membership
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/management/dashboard` | Management | Returns KPI cards (with MoM % deltas) and monthly revenue series for selected period (`?month=2026-10`) |
| `GET` | `/management/dashboard/export-pdf` | Management | Streams downloadable PDF sales report for the selected period |
| `GET` | `/management/orders` | Management | Paginated full orders list with `status`, `search`, `dietary`, and date filters |
| `PATCH` | `/management/orders/:id/status` | Management | Administrative status override |
| `GET` | `/management/memberships` | Management | Paginated membership table with `search`, `status`, `sort`, and active/inactive summary |
| `GET` | `/management/memberships/export-csv` | Management | Streams downloadable CSV of membership records |

---

## 7. Non-Functional Requirements

1. **Allergen Safety Priority**: Any order item containing a non-empty `allergen_note` must automatically flag `has_allergen_alert = true` in the backend so it immediately surfaces with crimson borders on KDS cards, red alert banners on Order Details, and warning badges on printed QR labels.
2. **Thermal Label Printing**: The Kitchen Order Detail QR Label panel must support clean `70 × 90 mm` `@media print` output without printing navigation bars or sidebars.
3. **Security**: Passwords hashed using `bcrypt` or `argon2id` in Go; parameterized SQL queries to prevent SQL injection; strict CORS configured between Next.js and Go API; JWT expiry with `Remember me` support (24h default vs 14d extended).
4. **Responsiveness**:
   * Customer routes smoothly adapt between desktop 2-pane layout and mobile bottom-bar + drawer layout (`360px` to `1920px`).
   * Driver route operates cleanly on mobile browsers with camera permissions (`getUserMedia`) and touch-friendly tap targets (`>= 44px`).
   * Kitchen and Management routes optimize for desktop productivity (`>= 1280px`).
5. **Data Integrity**: Transactional writes (`BEGIN`/`COMMIT`) in Neon DB when creating orders and when completing deliveries (updating order status + incrementing `memberships.total_spent` atomically).

---

## 8. Recommended Implementation Roadmap

| Phase | Milestone | Key Deliverables |
| :--- | :--- | :--- |
| **Phase 1** | Foundation & Database | Neon DB SQL migrations + seed data (4 role test accounts, 6 Layah menus, sample orders/members) + Golang server setup with JWT auth |
| **Phase 2** | Shared Frontend & Auth | Next.js Layah theme (`globals.css`), UI primitives, `AuthContext`, `middleware.ts`, and `/login` 4-role workspace screen |
| **Phase 3** | Customer Experience | `/catalog` (desktop + mobile cart drawer), `/checkout`, `/order-success/[orderId]` wired to Go API |
| **Phase 4** | Kitchen Display System | `/kitchen` Kanban board + live polling, `/kitchen/orders/[id]` with allergy alerts & QR print CSS, `/kitchen/history` |
| **Phase 5** | Driver Mobile App | `/driver` dual QR scanner, mismatch warning state, verified recipient card & status update endpoint |
| **Phase 6** | Management Dashboard | `/management/dashboard` (chart + PDF), `/management/orders`, `/management/menu` (full CRUD), `/management/membership` (table + CSV) |