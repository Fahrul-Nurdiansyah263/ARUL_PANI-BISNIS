# 🏢 Sadhana — Discipline Your Workflow

Sadhana adalah aplikasi manajemen proyek, tugas, dan pelaporan harian (Kanban Task Board & Daily Reporting) berbasis **multi-tenant** yang dilengkapi dengan fitur **Role-Based Access Control (RBAC)** dan integrasi **AI Insights**. Aplikasi ini dirancang untuk mendisiplinkan alur kerja tim, memantau kemajuan tugas secara visual, dan menganalisis kinerja tim secara cerdas menggunakan kecerdasan buatan.

---

## 🚀 Fitur Utama

1. **Multi-Tenancy (Isolasi Perusahaan)**
   * Pemisahan data yang aman antar-perusahaan (`Company`).
   * Setiap data tugas, divisi, laporan harian, dan pengguna terikat secara ketat pada `companyId` masing-masing.

2. **Role-Based Access Control (RBAC)**
   * Pembatasan akses terpusat melalui [permissions.ts](file:///c:/Learning/Next/sadhana/src/lib/permissions.ts).
   * Mendukung 4 tingkatan peran:
     * 👑 **Super Admin**: Otoritas penuh atas perusahaan, pembuatan divisi, pengelolaan pengguna, analitik, dan AI Insights.
     * 🛡️ **Admin**: Mengelola pengguna dalam divisinya, tiket, analitik, dan AI Insights.
     * 👥 **Employee**: Mengelola tiket (membuat, memperbarui status), berkomentar di semua tiket, dan melihat analitik.
     * 🎓 **Intern**: Mengubah status tiket yang ditugaskan kepadanya dan berkomentar khusus pada tiket tersebut.

3. **Kanban Task Board (Drag & Drop)**
   * Manajemen siklus hidup tugas visual dengan status: `TODO`, `IN_PROGRESS`, `REVIEW`, dan `DONE`.
   * Perpindahan status interaktif menggunakan drag-and-drop bertenaga `@dnd-kit`.
   * Informasi detail tiket, tanggal tenggat (*deadline*), penanggung jawab (*assignee*), serta kolom komentar interaktif.

4. **Laporan Harian (Daily Report)**
   * Pengguna dapat mengirimkan ringkasan aktivitas harian beserta kendala (*blockers*) yang dihadapi untuk transparansi tim.

5. **AI Insights & Summaries (Integrasi Gemini AI)**
   * Rencana integrasi dengan Google Gemini AI untuk analisis otomatis aktivitas mingguan (`WEEKLY_DIGEST`), kinerja tim (`PERFORMANCE`), deteksi anomali/kendala (`ANOMALY`), dan rekomendasi prioritas (`PRIORITY`).

6. **Notifikasi Sistem**
   * Informasi real-time mengenai aktivitas penugasan tiket dan pembaruan penting lainnya.

---

## 🛠️ Teknologi yang Digunakan

* **Core Framework**: [Next.js 16.2](https://nextjs.org) (App Router, Middleware, & React 19)
* **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM v6](https://www.prisma.io/)
* **Autentikasi**: [NextAuth.js v4](https://next-auth.js.org/) (Credentials Provider, JWT Strategy)
* **Styling & UI**: [TailwindCSS v4](https://tailwindcss.com/), [Base UI](https://base-ui.com/), [Shadcn UI](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/)
* **Validasi Skema**: [Zod](https://zod.dev/)
* **Interaktivitas**: [dnd-kit](https://dndkit.com/) (Drag & Drop)
* **AI Provider**: [Google Generative AI](https://github.com/google/generative-ai-js) (Gemini SDK)

---

## ⚙️ Persyaratan Sistem

Pastikan Anda telah memasang dependensi berikut di lingkungan pengembangan Anda:
* **Node.js** v20 atau lebih baru (direkomendasikan)
* **PostgreSQL** database (lokal atau cloud seperti Supabase)

---

## 🚦 Langkah Instalasi & Memulai

Ikuti langkah-langkah di bawah ini untuk menjalankan Sadhana di komputer lokal Anda:

### 1. Kloning Repositori & Pasang Dependensi
```bash
# Clone repositori ini (ganti URL jika diperlukan)
git clone <repository-url> sadhana
cd sadhana

# Pasang paket dependensi
npm install
```

### 2. Konfigurasi Environment Variables
Salin atau buat file `.env` di direktori utama proyek, dan isi variabel-variabel berikut:
```env
# URL koneksi ke database PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/sadhana_db"

# Kunci rahasia untuk enkripsi token NextAuth JWT
NEXTAUTH_SECRET="buat-random-secret-string-di-sini"

# URL dasar aplikasi
NEXTAUTH_URL="http://localhost:3000"

# Kunci API Google Gemini (untuk fitur AI Insights)
GEMINI_API_KEY="AIzaSy..."
```

### 3. Migrasi & Seeding Database
Lakukan sinkronisasi skema database Prisma dan jalankan script seeder untuk membuat data awal (perusahaan, divisi, tiket, dan akun demo):
```bash
# Jalankan migrasi database
npx prisma migrate dev --name init

# Jalankan seeder database
npx prisma db seed
```

### 4. Jalankan Aplikasi
Jalankan server pengembangan lokal:
```bash
npm run dev
```
Buka browser Anda dan akses [http://localhost:3000](http://localhost:3000). Aplikasi akan mengarahkan Anda ke halaman `/login`.

---

## 🔑 Akun Demo (Hasil Seed)

Setelah menjalankan perintah `npx prisma db seed`, Anda dapat masuk ke sistem menggunakan salah satu akun demo berikut (semua akun menggunakan password: **`password123`**):

| Nama Akun | Email | Peran (Role) | Ruang Lingkup Divisi |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@sadhana.com` | `SUPER_ADMIN` | Lintas Divisi (Global) |
| **Admin Engineering** | `admin.eng@sadhana.com` | `ADMIN` | Engineering |
| **Admin Marketing** | `admin.mkt@sadhana.com` | `ADMIN` | Marketing |
| **Budi Santoso** | `budi@sadhana.com` | `EMPLOYEE` | Engineering |
| **Sari Dewi** | `sari@sadhana.com` | `EMPLOYEE` | Marketing |
| **Andi Pratama** | `andi@sadhana.com` | `INTERN` | Engineering |
| **Rina Kusuma** | `rina@sadhana.com` | `INTERN` | Design |

---

## 🛡️ Matriks Perizinan (RBAC permissions)

Sistem otorisasi dikonfigurasi terpusat pada file [permissions.ts](file:///c:/Learning/Next/sadhana/src/lib/permissions.ts). Berikut adalah rangkuman hak aksesnya:

| Fitur / Tindakan | SUPER_ADMIN | ADMIN | EMPLOYEE | INTERN | Detail / Ketentuan |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Membuat Tiket** | ✅ | ✅ | ✅ | ❌ | Hanya role non-intern |
| **Menghapus Tiket** | ✅ | ✅ | ❌ | ❌ | Terbatas untuk Admin dan Super Admin |
| **Memperbarui Tiket** | ✅ | ✅ | ✅ | ✅ | Semua role dapat memperbarui detail & status tugas |
| **Komentar Tiket** | ✅ (Semua) | ✅ (Semua) | ✅ (Semua) | ⚠️ (Terbatas) | Intern hanya bisa komentar di tiket yang di-assign padanya |
| **Mengelola Divisi** | ✅ | ❌ | ❌ | ❌ | Hanya tingkat Super Admin perusahaan |
| **Mengelola Pengguna** | ✅ | ✅ | ❌ | ❌ | Mengundang atau mengubah status aktif staf |
| **Melihat Semua Divisi** | ✅ | ❌ | ❌ | ❌ | Super Admin dapat mengakses data lintas divisi |
| **Melihat Analitik** | ✅ | ✅ | ✅ | ❌ | Laporan statistik kemajuan tim |
| **Melihat AI Insights** | ✅ | ✅ | ❌ | ❌ | Rangkuman cerdas bertenaga kecerdasan buatan |

---

## 📂 Struktur Direktori Proyek

Berikut adalah gambaran umum folder-folder utama di aplikasi Sadhana:

```
sadhana/
├── prisma/                 # Skema basis data & skrip seeder
│   ├── schema.prisma       # Definisi model database PostgreSQL
│   ├── seed.ts             # Skrip pembuatan data awal (demo accounts & tasks)
│   └── migrations/         # Riwayat migrasi skema database
├── src/
│   ├── app/                # Next.js App Router (Rute halaman & API)
│   │   ├── (auth)/         # Rute autentikasi (login, register)
│   │   ├── (dashboard)/    # Halaman utama workspace & dasbor
│   │   └── api/            # API Route endpoints (/api/tickets, /api/divisions, etc.)
│   ├── components/         # Komponen UI modular
│   │   ├── dashboard/      # Layout Sidebar, Navbar, dan Shell dashboard
│   │   ├── tickets/        # Kanban board, Ticket card, Create & Detail modals
│   │   └── ui/             # Komponen visual dasar (buttons, dialogs, dsb.)
│   ├── lib/                # Konfigurasi & utilitas bisnis
│   │   ├── services/       # Service layer penanganan logic database (ticket, auth, dll.)
│   │   ├── validations/    # Validasi skema input request menggunakan Zod
│   │   ├── auth.ts         # Konfigurasi NextAuth.js
│   │   ├── db.ts           # Inisialisasi PrismaClient singleton
│   │   └── permissions.ts  # Konfigurasi RBAC & navigasi menu sidebar
│   ├── types/              # Deklarasi tipe global TypeScript (extending NextAuth types)
│   └── middleware.ts       # Rute pelindung/middleware verifikasi sesi JWT
├── package.json            # Informasi paket rilis & script perintah NPM
└── tsconfig.json           # Konfigurasi kompilasi TypeScript
```
