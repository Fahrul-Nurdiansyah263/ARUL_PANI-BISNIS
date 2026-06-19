# 🏢 Sejiwa Agency — Project Management Platform

Sejiwa Agency manajemen proyek adalah platform manajemen proyek yang dibuat untuk mempermudah sejiwa creative untuk menjalankan proyek proyek yang ada di sejiwa. Dilengkapi dengan **Role-Based Access Control (RBAC)** dan integrasi **Gemini AI**, sistem ini menyederhanakan pelacakan tugas, pembagian peran tim, dan analisis kinerja proyek secara cerdas.

---

## 🚀 Fitur Utama

1. **Role-Based Access Control (RBAC)**
   * Pembagian akses yang terpusat melalui [permissions.ts](file:///c:/Learning/Next/sadhana/src/lib/permissions.ts).
   * Mendukung 2 tingkatan peran pengguna:
     * 👑 **OWNER**: Memiliki kendali penuh atas perusahaan, manajemen anggota tim, pengelolaan tiket proyek, serta akses penuh ke halaman AI Insights.
     * 👥 **MEMBER**: Dapat membuat, memperbarui status tiket proyek, dan memberikan komentar pada tiket tim manapun untuk menunjang kolaborasi.

2. **Kanban Task Board (Drag & Drop)**
   * Manajemen siklus tugas secara visual dengan status: `TODO`, `IN_PROGRESS`, `REVIEW`, `PRIORITY`, dan `DONE`.
   * Drag-and-drop interaktif bertenaga `@dnd-kit`.
   * Detail tiket yang kaya termasuk deadline, penanggung jawab (assignee), dan utas komentar terintegrasi.

3. **AI Insights (Integrasi Gemini AI)**
   * Halaman asisten AI khusus (**AI Insights**) di `/dashboard/ai` yang ditenagai oleh Gemini AI (`gemini-2.5-flash`).
   * Membantu menganalisis produktivitas tim, memberikan saran prioritas tiket, serta berinteraksi secara real-time menggunakan percakapan cerdas yang kontekstual.

---

## 🛠️ Tech Stack

* **Core Framework**: [Next.js 16.2](https://nextjs.org) (App Router, Middleware, & React 19)
* **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM v6](https://www.prisma.io/)
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

---

## 🚦 Memulai Penggunaan

Ikuti langkah-langkah berikut untuk menjalankan Sejiwa Agency di komputer lokal Anda:

### 1. Clone Repository & Instal Dependensi
```bash
# Clone repository
git clone <repository-url> sejiwa
cd sejiwa

# Instal paket dependensi
npm install
```

### 2. Konfigurasi Environment Variables
Buat file bernama `.env` di direktori utama (root) proyek Anda dan tambahkan variabel berikut:
```env
# URL koneksi database PostgreSQL Anda
DATABASE_URL="postgresql://username:password@localhost:5432/sejiwa_db"

# Kunci rahasia untuk enkripsi token NextAuth
NEXTAUTH_SECRET="kunci-rahasia-acak-anda-di-sini"

# URL dasar aplikasi
NEXTAUTH_URL="http://localhost:3000"

# Kunci API Google Gemini (untuk fitur AI Insights)
GEMINI_API_KEY="..."
```

### 3. Migrasi Database & Seeding
Singkronkan skema Prisma dengan database Anda dan jalankan skrip seeding untuk mengisi data demo awal (perusahaan, pengguna, dan tiket awal):
```bash
# Jalankan migrasi database
npx prisma migrate dev --name init

# Isi database dengan data demo
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
| **Fahrul Nurdiansyah** | `fahrul@sejiwa.agency` | `OWNER` | Creative Director |
| **Rina Kusuma** | `rina@sejiwa.agency` | `MEMBER` | Branding |
| **Budi Santoso** | `budi@sejiwa.agency` | `MEMBER` | Content Writer |
| **Andi Pratama** | `andi@sejiwa.agency` | `MEMBER` | Frontend Developer |
| **Sari Dewi** | `sari@sejiwa.agency` | `MEMBER` | Social Media |
| **Rizky Pratama** | `rizky@sejiwa.agency` | `MEMBER` | Graphic Designer |
| **Dewi Lestari** | `dewi@sejiwa.agency` | `MEMBER` | Copywriter |

---

## 🛡️ Matriks Izin Akses (RBAC)

Sistem perizinan dikelola secara terpusat di [permissions.ts](file:///c:/Learning/Next/sadhana/src/lib/permissions.ts). Berikut adalah pembagian hak aksesnya:

| Fitur / Tindakan | OWNER | MEMBER | Keterangan / Detail |
| :--- | :---: | :---: | :--- |
| **Membuat Tiket** | ✅ | ✅ | Baik Owner maupun Member bisa membuat tiket baru |
| **Menghapus Tiket** | ✅ | ✅ | Memberikan kebebasan pengelolaan tiket penuh kepada seluruh tim |
| **Memperbarui Tiket** | ✅ | ✅ | Mengubah status, memindahkan kolom, mengedit detail tiket |
| **Menulis Komentar** | ✅ | ✅ | Berdiskusi di kolom komentar pada tiket manapun |
| **Mengelola Divisi** | ✅ | ❌ | Terbatas hanya untuk tingkat Owner |
| **Mengelola Anggota** | ✅ | ❌ | Owner dapat mengundang, mengedit, atau menonaktifkan pengguna |
| **Mengakses AI Insights** | ✅ | ✅ | Semua anggota tim dapat berkonsultasi dengan Sejiwa AI |

---

## 📂 Struktur Folder Proyek

```
sejiwa/
├── prisma/                 # Skema database & script seeding
│   ├── schema.prisma       # Skema utama database Prisma (PostgreSQL)
│   ├── seed.ts             # Skrip seeding akun demo & tiket awal
│   └── migrations/         # Riwayat migrasi skema database
├── src/
│   ├── app/                # Struktur Next.js App Router & API Route
│   │   ├── (auth)/         # Halaman autentikasi (login, register)
│   │   ├── (dashboard)/    # Halaman dashboard, tiket, dan AI
│   │   └── api/            # API Route internal (/api/chat, /api/users, /api/tickets)
│   ├── components/         # Komponen React reusable
│   │   ├── dashboard/      # Layout dashboard, Sidebar, Navbar, dan AI Chat
│   │   ├── tickets/        # Board Kanban, Card Tiket, Detail & Create Modal
│   │   └── ui/             # Komponen dasar UI (button, dialog, textarea, dll.)
│   ├── lib/                # Konfigurasi, helper database, dan service bisnis
│   │   ├── services/       # Layer penanganan logika bisnis (auth, ticket, user)
│   │   ├── auth.ts         # Konfigurasi NextAuth.js
│   │   ├── db.ts           # Instance Prisma Client untuk koneksi database
│   │   └── permissions.ts  # Definisi aturan hak akses (RBAC)
│   ├── types/              # Deklarasi tipe TypeScript global
│   └── middleware.ts       # Route guard middleware untuk otentikasi sesi JWT
├── package.json            # Daftar dependensi aplikasi & script perintah npm
└── tsconfig.json           # Konfigurasi proyek TypeScript
```
