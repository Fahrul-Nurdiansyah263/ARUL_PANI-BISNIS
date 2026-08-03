# 🏢 Arul-Pani Agency — Project Management Platform

Arul-Pani Agency manajemen proyek adalah platform manajemen proyek yang dibuat untuk mempermudah Arul-Pani Creative untuk menjalankan proyek-proyek yang ada di arul-pani. Dilengkapi dengan **Role-Based Access Control (RBAC)**, integrasi **Supabase Storage**, dan **Gemini AI**, sistem ini menyederhanakan pelacakan tugas, pembagian peran tim, upload berkas gambar, dan analisis kinerja proyek secara cerdas.

---

## 🚀 Fitur Utama

1. **Role-Based Access Control (RBAC)**
   * Pembagian akses yang terpusat melalui [permissions.ts](src/lib/permissions.ts).
   * Mendukung 2 tingkatan peran pengguna:
     * 👑 **OWNER**: Memiliki kendali penuh atas perusahaan, manajemen anggota tim, pengelolaan tiket proyek, serta akses ke halaman AI Insights.
     * 👥 **MEMBER**: Dapat membuat, memperbarui status tiket proyek, dan memberikan komentar pada tiket tim manapun untuk menunjang kolaborasi.

2. **Manajemen Proyek (Projects)**
   * Pengelompokan tiket tugas berdasarkan proyek klien di `/dashboard/projects`.
   * **Modal Detail Proyek Interaktif**: Klik pada card proyek untuk melihat informasi detail, sampul gambar, status, dan jumlah tiket.
   * **Visual Card & Placeholder**: Menampilkan gambar sampul proyek dengan efek hover halus dan placeholder *"Gambar Tidak Ada"* jika proyek belum memiliki gambar.
   * Semua anggota dapat membuat dan mengedit proyek; hanya **OWNER** yang memiliki izin menghapus proyek.

3. **Upload Gambar (Supabase Storage)**
   * Integrasi langsung dengan Supabase Storage Bucket (`proyek`) melalui API endpoint `/api/upload`.
   * Mendukung unggah gambar untuk sampul proyek dan lampiran gambar pada komentar tiket.
   * Fitur *safe fallback* yang tetap menjaga stabilitas aplikasi jika API key belum terpasang.

4. **Kanban Task Board (Drag & Drop)**
   * Manajemen siklus tugas secara visual dengan status: `TODO`, `IN_PROGRESS`, `REVIEW`, `PRIORITY`, dan `DONE`.
   * Drag-and-drop interaktif bertenaga `@dnd-kit`.
   * Detail tiket yang kaya termasuk deadline, penanggung jawab (assignee), dan utas komentar terintegrasi.
   * Filter tiket berdasarkan proyek.

5. **AI Insights (Integrasi Gemini AI)**
   * Halaman asisten AI khusus (**AI Insights**) di `/dashboard/ai` yang ditenagai oleh Gemini AI.
   * Membantu menganalisis produktivitas tim, memberikan saran prioritas tiket, serta berinteraksi secara real-time menggunakan percakapan cerdas yang kontekstual.

---

## 🛠️ Tech Stack

* **Core Framework**: [Next.js 16.2](https://nextjs.org) (App Router, Proxy, & React 19)
* **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM v6](https://www.prisma.io/)
* **Cloud Storage**: [Supabase Storage](https://supabase.com/storage) (Storage Bucket)
* **Authentication**: [NextAuth.js v4](https://next-auth.js.org/) (Credentials Provider, JWT Strategy)
* **Styling & UI**: [TailwindCSS v4](https://tailwindcss.com/), [Base UI](https://base-ui.com/), [Shadcn UI](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/)
* **Schema Validation**: [Zod](https://zod.dev/)
* **Interactivity**: [dnd-kit](https://dndkit.com/) (Drag & Drop)
* **AI SDK**: [Google Generative AI](https://github.com/google/generative-ai-js) (Gemini SDK)

---

## ⚙️ Persyaratan Sistem

Sebelum menjalankan aplikasi, pastikan Anda telah menginstal:
* **Node.js** v20 atau versi terbaru
* Database **PostgreSQL** (bisa menggunakan instalasi lokal atau cloud-hosted seperti Supabase)
* Akun **Supabase** (untuk fitur unggah gambar ke Storage Bucket)

---

## 🚦 Memulai Penggunaan

Ikuti langkah-langkah berikut untuk menjalankan Arul-Pani Agency di komputer lokal Anda:

### 1. Clone Repository & Instal Dependensi
```bash
# Clone repository
git clone <repository-url> arul-pani
cd arul-pani

# Instal paket dependensi
npm install
```

### 2. Konfigurasi Environment Variables
Buat file bernama `.env` di direktori utama (root) proyek Anda dan tambahkan variabel berikut:
```env
# URL koneksi database PostgreSQL Anda
DATABASE_URL="postgresql://username:password@localhost:5432/arul_pani_db"

# Kunci rahasia untuk enkripsi token NextAuth
NEXTAUTH_SECRET="kunci-rahasia-acak-anda-di-sini"

# URL dasar aplikasi
NEXTAUTH_URL="http://localhost:3000"

# Kunci API Google Gemini (untuk fitur AI Insights)
GEMINI_API_KEY="kunci-api-gemini-anda"

# Konfigurasi Supabase Storage (untuk Fitur Upload Gambar)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
SUPABASE_SECRET_KEY="your-supabase-secret-key"
```

### 3. Migrasi Database & Seeding
Singkronkan skema Prisma dengan database Anda dan jalankan skrip seeding untuk mengisi data akun awal:
```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migrasi database
npx prisma migrate dev --name init

# Isi database dengan data akun awal (seed.ts)
npx prisma db seed
```

### 4. Jalankan Aplikasi
Jalankan server pengembangan lokal:
```bash
npm run dev
```
Buka browser Anda dan akses [http://localhost:3000](http://localhost:3000). Aplikasi akan otomatis mengarahkan Anda ke halaman `/login` jika Anda belum masuk.

---

## 🔑 Akun Demo (Tersedia dari Seeding)

Semua akun demo di bawah ini menggunakan kata sandi default: **`password123`**:

| Nama Pengguna | Email | Peran | Jabatan |
| :--- | :--- | :--- | :--- |
| **Fahrul Nurdiansyah** | `fahrul@arul-pani.com` | `OWNER` | Creative Director |
| **Ranu Vanny Ramadhani** | `vanny@arul-pani.com` | `OWNER` | Creative Director |

---

## 🛡️ Matriks Izin Akses (RBAC)

Sistem perizinan dikelola secara terpusat di [permissions.ts](src/lib/permissions.ts). Berikut adalah pembagian hak aksesnya:

| Fitur / Tindakan | OWNER | MEMBER | Keterangan / Detail |
| :--- | :---: | :---: | :--- |
| **Membuat Tiket** | ✅ | ✅ | Baik Owner maupun Member bisa membuat tiket baru |
| **Menghapus Tiket** | ✅ | ✅ | Memberikan kebebasan pengelolaan tiket penuh kepada seluruh tim |
| **Memperbarui Tiket** | ✅ | ✅ | Mengubah status, memindahkan kolom, mengedit detail tiket |
| **Menulis Komentar & Upload Gambar** | ✅ | ✅ | Berdiskusi di kolom komentar dan mengunggah gambar |
| **Membuat / Edit Proyek** | ✅ | ✅ | Semua anggota tim bisa membuat & memperbarui data proyek |
| **Menghapus Proyek** | ✅ | ❌ | Terbatas hanya untuk tingkat Owner |
| **Mengelola Anggota** | ✅ | ❌ | Owner dapat melihat & mengelola daftar anggota tim di `/dashboard/users` |
| **Mengakses AI Insights** | ✅ | ✅ | Semua anggota tim dapat berkonsultasi dengan Arul-Pani AI |

---

## 📂 Struktur Folder Proyek

```
arul-pani/
├── prisma/                 # Skema database & script seeding
│   ├── schema.prisma       # Skema utama database Prisma (PostgreSQL)
│   ├── seed.ts             # Skrip seeding akun owner awal
│   └── migrations/         # Riwayat migrasi skema database
├── src/
│   ├── app/                # Struktur Next.js App Router & API Route
│   │   ├── (auth)/         # Halaman autentikasi (login, register)
│   │   ├── (dashboard)/    # Halaman dashboard, proyek, tiket, dan AI
│   │   └── api/            # API Route internal (/api/chat, /api/upload, /api/projects, dll.)
│   ├── components/         # Komponen React reusable
│   │   ├── dashboard/      # Layout dashboard, Sidebar, Navbar, dan AI Chat
│   │   ├── projects/       # Create, Edit, Delete, dan ProjectDetailModal
│   │   ├── tickets/        # Board Kanban, Card Tiket, Detail & Create Modal
│   │   └── ui/             # Komponen dasar UI (button, dialog, textarea, dll.)
│   ├── lib/                # Konfigurasi, helper database, dan service bisnis
│   │   ├── services/       # Layer penanganan logika bisnis (auth, project, ticket, user)
│   │   ├── auth.ts         # Konfigurasi NextAuth.js
│   │   ├── db.ts           # Instance Prisma Client untuk koneksi database
│   │   ├── supabase.ts     # Konfigurasi Supabase Storage Client
│   │   └── permissions.ts  # Definisi aturan hak akses (RBAC)
│   ├── types/              # Deklarasi tipe TypeScript global
│   └── proxy.ts            # Route guard proxy Next.js 16 untuk otentikasi sesi JWT
├── package.json            # Daftar dependensi aplikasi & script perintah npm
└── tsconfig.json           # Konfigurasi proyek TypeScript
```
