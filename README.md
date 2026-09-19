# REJASA — Rapid Access Journal (SMAN 3 Salatiga)

Jurnal laboratorium digital dengan **Teacher Flow** end-to-end:

`SCAN QR → LAB TERIDENTIFIKASI → LOGIN GURU → JADWAL → FORM JURNAL → SUBMIT → NOMOR JURNAL → REVIEW → KOREKSI → RESUBMIT`

Stack: React 19 + Vite + Tailwind (frontend, TypeScript) • Express + SQLite/`better-sqlite3` (backend, TypeScript).

## Menjalankan (development)

```bash
npm install
cp .env.example .env      # opsional
npm run dev               # API :3001 + Vite :3000 (proxy /api)
```
Buka http://localhost:3000. Database dibuat otomatis di `data/rejasa.db` (di-ignore git).

## Produksi

```bash
npm run build
SEED_DEMO_DATA=false APP_URL=https://alamat-publik-anda npm start
```
Satu proses Node melayani API **dan** hasil build frontend. `APP_URL` dipakai untuk isi QR
(pastikan alamat ini bisa dibuka dari HP guru). GitHub Pages (statis) **tidak** dapat menjalankan backend ini.

## Akun (PLACEHOLDER — login memakai KODE saja)

| Kode | Role | Keterangan |
|------|------|-----------|
| `ADM1` | ADMIN | QR, inventaris, jadwal, semua jurnal |
| `LB1`  | LABORAN | review jurnal, insiden |
| `GR1`–`GR4` | GURU | portal guru di `/guru` |

Tambah/ganti pengguna asli: `npm run user:add -- KODE "Nama Lengkap" GURU`
(nonaktifkan akun placeholder dengan `UPDATE users SET active=0 WHERE code='GR1'` di SQLite).

> Login tanpa PIN berarti siapa pun yang tahu kode seorang guru dapat masuk sebagai guru itu.
> Percobaan login dibatasi (`LOGIN_RATE_LIMIT`, default 10/menit/IP). Sangat disarankan menambah PIN sebelum dipakai luas.

## Hak akses

| | ADMIN | LABORAN | GURU |
|---|:-:|:-:|:-:|
| Kelola QR / inventaris (`/api/qr`, `/api/inventory`) | ✅ | ❌ 403 | ❌ 403 |
| Jadwal (lihat) / (kelola) | ✅ / ✅ | ✅ / ❌ | ✅ / ❌ |
| Lihat semua jurnal (non-draft), review | ✅ | ✅ | ❌ |
| Buat/edit/kirim jurnal sendiri, `GET /api/journals/me` | ❌ | ❌ | ✅ |
| Insiden (`/api/incidents`) | ✅ | ✅ | ❌ 403 |

Role selalu dibaca server dari database via sesi (cookie httpOnly) — bukan dari klien.

## API

```
POST /api/auth/login | GET /api/auth/me | POST /api/auth/logout
GET  /api/qr/:token                       (publik; hanya identitas lab)
GET|POST /api/qr                          (ADMIN)
GET  /api/labs, /api/labs/:id, /api/labs/:id/schedule
POST|PATCH|DELETE /api/schedules[/:id]    (ADMIN)
POST /api/journals   GET /api/journals/me   GET /api/journals (staf)
GET|PATCH /api/journals/:id   POST /api/journals/:id/resubmit
POST|GET /api/journals/:id/reviews
GET|POST|PATCH|DELETE /api/inventory      (ADMIN)
GET /api/incidents   PATCH /api/incidents/:id/disposition   (ADMIN/LABORAN)
```
Status jurnal: `DRAFT → SUBMITTED → REVIEWED | NEEDS_CORRECTION → (edit) → SUBMITTED`.
Nomor jurnal `JR-YYYYMMDD-NNNN` dibuat server. Riwayat tersimpan di tabel `journal_reviews`.

## Pengujian

```bash
npm run dev:server   # terminal 1 (gunakan DB baru: hapus data/ bila perlu; LOGIN_RATE_LIMIT=1000 untuk tes)
npm run test:api     # 45 skenario akseptansi API (Test A–F)
npm run test:ui      # alur UI (jsdom) terhadap API sungguhan
npm run lint         # typecheck
```

## Belum dikerjakan / masih data contoh
- Kartu status bilik (`RoomStatusGrid`), grafik alokasi jam, dan statistik pemakaian lab di dashboard staf masih data statis (`src/data/labData.ts`).
- UI untuk mengelola jadwal, pengguna, dan CRUD inventaris belum ada (API jadwal & inventaris sudah tersedia).
- Pelaporan insiden oleh guru belum ada (insiden hanya dikelola staf).
