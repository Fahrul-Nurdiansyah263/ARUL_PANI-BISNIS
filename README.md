# 🏢 Sadhana — Discipline Your Workflow

Sadhana is a multi-tenant workspace, task, and daily reporting management application (Kanban Task Board & Daily Reporting) equipped with **Role-Based Access Control (RBAC)** and **Gemini AI Integration**. This system is designed to streamline team workflows, visually track task progression, and intelligently analyze team performance using artificial intelligence.

---

## 🚀 Key Features

1. **Multi-Tenancy (Company Isolation)**
   * Complete data isolation between different companies (`Company`).
   * Every task, division, daily report, and user is strictly bound to their respective `companyId`.

2. **Role-Based Access Control (RBAC)**
   * Centralized permission checks defined in [permissions.ts](file:///c:/Learning/Next/sadhana/src/lib/permissions.ts).
   * Supports 4 distinct roles:
     * 👑 **Super Admin**: Full company authority, creates divisions, manages all users, and accesses analytics and AI Insights.
     * 🛡️ **Admin**: Manages users within their assigned division, manages tickets, accesses analytics, and views AI Insights.
     * 👥 **Employee**: Manages tickets (create and update status), comments on all tickets, and accesses analytics.
     * 🎓 **Intern**: Updates the status of tickets assigned specifically to them and comments only on those assigned tickets.

3. **Kanban Task Board (Drag & Drop)**
   * Visual task lifecycle management with statuses: `TODO`, `IN_PROGRESS`, `REVIEW`, and `DONE`.
   * Interactive drag-and-drop state changes powered by `@dnd-kit`.
   * Detailed ticket previews, deadline scheduling, assignees, and nested comment threads.

4. **Daily Reporting**
   * Users can submit a daily summary of their work activities and document any blockers they encounter for team transparency.

5. **AI Insights & Summaries (Gemini AI Integration)**
   * Planned integration with Google Gemini AI to automatically generate weekly digests (`WEEKLY_DIGEST`), team performance analyses (`PERFORMANCE`), blocker/anomaly detection (`ANOMALY`), and priority recommendations (`PRIORITY`).

6. **System Notifications**
   * Real-time notifications for ticket assignments and critical project updates.

---

## 🛠️ Tech Stack

* **Core Framework**: [Next.js 16.2](https://nextjs.org) (App Router, Middleware, & React 19)
* **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM v6](https://www.prisma.io/)
* **Authentication**: [NextAuth.js v4](https://next-auth.js.org/) (Credentials Provider, JWT Strategy)
* **Styling & UI**: [TailwindCSS v4](https://tailwindcss.com/), [Base UI](https://base-ui.com/), [Shadcn UI](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/)
* **Schema Validation**: [Zod](https://zod.dev/)
* **Interactivity**: [dnd-kit](https://dndkit.com/) (Drag & Drop)
* **AI Provider**: [Google Generative AI](https://github.com/google/generative-ai-js) (Gemini SDK)

---

## ⚙️ System Prerequisites

Make sure you have the following installed in your development environment:
* **Node.js** v20 or newer
* **PostgreSQL** database (local or cloud-hosted instance like Supabase)

---

## 🚦 Getting Started

Follow these steps to run Sadhana locally on your machine:

### 1. Clone the Repository & Install Dependencies
```bash
# Clone the repository (replace with your repository URL)
git clone <repository-url> sadhana
cd sadhana

# Install dependency packages
npm install
```

### 2. Configure Environment Variables
Copy or create a `.env` file in the root of the project directory and supply the following variables:
```env
# Connection URL for your PostgreSQL database
DATABASE_URL="postgresql://username:password@localhost:5432/sadhana_db"

# Secret key used by NextAuth to encrypt and sign JWT tokens
NEXTAUTH_SECRET="your-random-secret-string-here"

# Base URL of the application
NEXTAUTH_URL="http://localhost:3000"

# Google Gemini API key (for AI Insights generation)
GEMINI_API_KEY="AIzaSy..."
```

### 3. Run Database Migrations & Seeding
Sync the Prisma schema with your database and run the seeder script to populate seed data (companies, divisions, tickets, and demo users):
```bash
# Run database migrations
npx prisma migrate dev --name init

# Seed the database
npx prisma db seed
```

### 4. Launch the Application
Run the local development server:
```bash
npm run dev
```
Open your browser and navigate to [http://localhost:3000](http://localhost:3000). The middleware will automatically redirect you to the `/login` page if you are not authenticated.

---

## 🔑 Demo Accounts (Seeded)

After successfully running `npx prisma db seed`, you can log into the system using the following credentials (all accounts use the password: **`password123`**):

| User Name | Email | Role | Division Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@sadhana.com` | `SUPER_ADMIN` | Global (Cross-Division) |
| **Admin Engineering** | `admin.eng@sadhana.com` | `ADMIN` | Engineering |
| **Admin Marketing** | `admin.mkt@sadhana.com` | `ADMIN` | Marketing |
| **Budi Santoso** | `budi@sadhana.com` | `EMPLOYEE` | Engineering |
| **Sari Dewi** | `sari@sadhana.com` | `EMPLOYEE` | Marketing |
| **Andi Pratama** | `andi@sadhana.com` | `INTERN` | Engineering |
| **Rina Kusuma** | `rina@sadhana.com` | `INTERN` | Design |

---

## 🛡️ Permission Matrix (RBAC permissions)

The authorization system is centrally managed in [permissions.ts](file:///c:/Learning/Next/sadhana/src/lib/permissions.ts). Here is an overview of the access levels:

| Feature / Action | SUPER_ADMIN | ADMIN | EMPLOYEE | INTERN | Notes / Details |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Create Ticket** | ✅ | ✅ | ✅ | ❌ | Allowed for all non-intern roles |
| **Delete Ticket** | ✅ | ✅ | ❌ | ❌ | Restricted to Admins and Super Admins |
| **Update Ticket** | ✅ | ✅ | ✅ | ✅ | Every role can update ticket details & status |
| **Ticket Comments** | ✅ (All) | ✅ (All) | ✅ (All) | ⚠️ (Restricted) | Interns can only comment on tickets assigned to them |
| **Manage Divisions** | ✅ | ❌ | ❌ | ❌ | Limited to Super Admin level |
| **Manage Users** | ✅ | ✅ | ❌ | ❌ | Ability to invite or edit active status of users |
| **View All Divisions** | ✅ | ❌ | ❌ | ❌ | Super Admin can inspect cross-division data |
| **View Analytics** | ✅ | ✅ | ✅ | ❌ | Statistical reports on team progress |
| **View AI Insights** | ✅ | ✅ | ❌ | ❌ | Smart AI-powered weekly digest/anomaly reviews |

---

## 📂 Project Folder Structure

Here is a structural overview of the Sadhana application directories:

```
sadhana/
├── prisma/                 # Database schema configuration & seeding scripts
│   ├── schema.prisma       # Prisma schema defining PostgreSQL models
│   ├── seed.ts             # Seeder script setting up companies, divisions, users, and tasks
│   └── migrations/         # History of database schema migrations
├── src/
│   ├── app/                # Next.js App Router (Routes & API endpoints)
│   │   ├── (auth)/         # Authentication routes (login, register)
│   │   ├── (dashboard)/    # Core dashboard pages & views
│   │   └── api/            # API endpoints (/api/tickets, /api/divisions, etc.)
│   ├── components/         # Reusable React components
│   │   ├── dashboard/      # Navigation Sidebar, Navbar, and Dashboard shell components
│   │   ├── tickets/        # Kanban board, Ticket cards, Create & Detail modals
│   │   └── ui/             # Basic UI elements (buttons, inputs, dialogs, etc.)
│   ├── lib/                # Config files & database helper functions
│   │   ├── services/       # Service layer executing business logic (ticket, auth, etc.)
│   │   ├── validations/    # Input request schemas using Zod validation
│   │   ├── auth.ts         # NextAuth.js authentication configuration
│   │   ├── db.ts           # PrismaClient database connection helper
│   │   └── permissions.ts  # Centralized RBAC permissions & navigation setup
│   ├── types/              # Global TypeScript declarations (extends NextAuth types)
│   └── middleware.ts       # Route guard middleware inspecting JWT sessions
├── package.json            # Application dependencies and package scripts
└── tsconfig.json           # TypeScript configuration
```
