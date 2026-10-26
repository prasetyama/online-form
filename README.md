# PR Non-Trade & Trade Portal

Portal Web khusus untuk pengajuan dan pengelolaan **Purchase Request (PR)** Non-Trade (Operasional & Aset) dan Trade (Barang Dagang). Terintegrasi langsung dengan **Centralized SSO (Single Sign-On)** dan **Centralized Approval Engine** (Workflow ID: 10).

---

## 🚀 Fitur Utama

1. **Autentikasi Terpusat (Centralized SSO)**:
   - Login otomatis melalui SSO (`http://localhost:5173` lokal / `https://account.ceresnl.com` produksi).
   - Validasi hak akses modul `approval` via JWT Cookie `sso_token`.
   - Multi-tab synchronized logout menggunakan `BroadcastChannel` dan cookie heartbeat check.
   - App Drawer terintegrasi untuk beralih antar aplikasi ekosistem SSO.

2. **Daftar & Monitoring PR (`PRNonTradeListPage`)**:
   - Status badge (DRAFT, SUBMITTED, CANCELLED).
   - Metrik ringkasan PR (Total, Draft, Submitted).
   - Pencarian real-time berdasarkan No Transaksi, Purpose, Requestor, atau Department.
   - Aksi langsung: Edit Draft, Hapus Draft, Lihat Detail PR, serta Link Tracking Approval di Centralized Approval Hub.

3. **Formulir Pengajuan PR Dinamis (`PRNonTradeFormPage`)**:
   - **PR Non-Trade**:
     - General Data (Purpose, Lumpsum/Not Lumpsum, Non-Asset vs Asset).
     - Asset Type dinamis (Non WBS dengan modal pencarian Master Asset, WBS dengan modal pencarian Master WBS).
     - Equipment picker modal.
     - Detail Item tabel dengan pencarian Master Goods / Barang.
     - Simpan sebagai Draft & Submit ke Centralized Approval Engine.
   - **PR Trade**:
     - Formulir pengadaan barang dagang dengan katalog SKU & Supplier.
     - Simulasi interaktif pemesanan buffer distribution center.

4. **Halaman Detail Transaksi PR (`PRDetailPage`)**:
   - Tampilan lengkap data requestor, metadata pengadaan, dan rincian item.
   - Tombol langsung untuk menuju halaman tracking workflow approval di Centralized Approval Hub.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Font: Poppins, Modern Soft UI Design System)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **HTTP Client**: Axios (dengan Request/Response Interceptors untuk Bearer SSO Token & Auto 401 Redirect)
- **Routing**: React Router DOM v6

---

## ⚙️ Konfigurasi Environment (`.env`)

```env
# Local Development
VITE_SSO_URL="http://localhost:5173"
VITE_BACKEND_URL="http://localhost:8080"
VITE_SSO_BACKEND_URL="http://localhost:8000/api/v1"
VITE_APPROVAL_URL="http://localhost:5175"

# Server Production DE
# VITE_SSO_URL="https://account.ceresnl.com"
# VITE_BACKEND_URL="https://wf.ceresnl.com/api"
# VITE_SSO_BACKEND_URL="https://account.ceresnl.com/api/v1"
# VITE_APPROVAL_URL="https://wf.ceresnl.com"
```

---

## 📦 Menjalankan Project

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Mode Development (Port 5176)
```bash
npm run dev
```
Akses di browser: `http://localhost:5176`

### 3. Build untuk Produksi
```bash
npm run build
```
Bundle produksi tersimpan di direktori `dist/`.

---

## 🔗 Endpoint API yang Digunakan (Centralized Approval Backend)

- `GET /api/v1/auth/me` : Profil user & struktur organisasi
- `GET /api/v1/pr-non-trade/` : Daftar pengajuan PR
- `GET /api/v1/pr-non-trade/:id/` : Detail pengajuan PR
- `POST /api/v1/pr-non-trade/save-draft/` : Simpan draft PR
- `POST /api/v1/pr-non-trade/submit/` : Submit PR ke Centralized Approval Engine
- `DELETE /api/v1/pr-non-trade/:id/` : Hapus draft PR
- `GET /api/v1/master/assets/` : Pencarian master asset
- `GET /api/v1/master/wbs/` : Pencarian master WBS
- `GET /api/v1/master/equipments/` : Pencarian master equipment
- `GET /api/v1/master/goods/` : Pencarian master barang/goods
