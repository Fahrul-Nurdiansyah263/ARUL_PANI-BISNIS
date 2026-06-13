-- 0. Buat kolom 'position' di tabel User jika belum ada (Bypass migration)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "position" TEXT;

-- 1. Bersihkan database terlebih dahulu (Reset data)
TRUNCATE TABLE "DailyReport", "TicketComment", "Ticket", "Invitation", "User", "Division", "Company", "Account", "Session", "VerificationToken", "AiSummary", "Notification" CASCADE;

-- 2. Insert Company
INSERT INTO "Company" ("id", "name", "slug", "logoUrl", "createdAt")
VALUES ('comp_sadhana', 'PT Sadhana Indonesia', 'pt-sadhana-indonesia', NULL, NOW());

-- 3. Insert Division
INSERT INTO "Division" ("id", "companyId", "name", "description", "createdAt")
VALUES 
('div_developers', 'comp_sadhana', 'Developers', 'Tim pengembangan produk & rekayasa perangkat lunak', NOW()),
('div_marketing', 'comp_sadhana', 'Marketing', 'Tim pemasaran dan campaign kreatif', NOW()),
('div_ui_ux', 'comp_sadhana', 'UI/UX', 'Tim desain antarmuka dan pengalaman pengguna', NOW());

-- 4. Insert User
-- Catatan: Password hash di bawah adalah untuk 'password123'
INSERT INTO "User" ("id", "companyId", "divisionId", "name", "email", "passwordHash", "role", "avatarUrl", "position", "isActive", "createdAt")
VALUES 
('usr_superadmin', 'comp_sadhana', NULL, 'Super Admin', 'superadmin@sadhana.com', '$2b$12$obtUdnjpuOoutEpqUGmmIu0liQVFHt.3jlg3Gx1mPker6UO0qDjkK', 'SUPER_ADMIN'::"Role", NULL, 'Super Administrator', TRUE, NOW()),
('usr_lead_dev', 'comp_sadhana', 'div_developers', 'Lead Developer', 'admin.eng@sadhana.com', '$2b$12$obtUdnjpuOoutEpqUGmmIu0liQVFHt.3jlg3Gx1mPker6UO0qDjkK', 'ADMIN'::"Role", NULL, 'Fullstack Developer', TRUE, NOW()),
('usr_marketing_mgr', 'comp_sadhana', 'div_marketing', 'Marketing Manager', 'admin.mkt@sadhana.com', '$2b$12$obtUdnjpuOoutEpqUGmmIu0liQVFHt.3jlg3Gx1mPker6UO0qDjkK', 'ADMIN'::"Role", NULL, 'Marketing Manager', TRUE, NOW()),
('usr_employee_1', 'comp_sadhana', 'div_developers', 'Budi Santoso', 'budi@sadhana.com', '$2b$12$obtUdnjpuOoutEpqUGmmIu0liQVFHt.3jlg3Gx1mPker6UO0qDjkK', 'EMPLOYEE'::"Role", NULL, 'Frontend Developer', TRUE, NOW()),
('usr_employee_2', 'comp_sadhana', 'div_marketing', 'Sari Dewi', 'sari@sadhana.com', '$2b$12$obtUdnjpuOoutEpqUGmmIu0liQVFHt.3jlg3Gx1mPker6UO0qDjkK', 'EMPLOYEE'::"Role", NULL, 'Marketing Specialist', TRUE, NOW()),
('usr_intern_1', 'comp_sadhana', 'div_developers', 'Andi Pratama', 'andi@sadhana.com', '$2b$12$obtUdnjpuOoutEpqUGmmIu0liQVFHt.3jlg3Gx1mPker6UO0qDjkK', 'INTERN'::"Role", NULL, 'Backend Developer Intern', TRUE, NOW()),
('usr_intern_2', 'comp_sadhana', 'div_ui_ux', 'Rina Kusuma', 'rina@sadhana.com', '$2b$12$obtUdnjpuOoutEpqUGmmIu0liQVFHt.3jlg3Gx1mPker6UO0qDjkK', 'INTERN'::"Role", NULL, 'UI/UX Designer Intern', TRUE, NOW());

-- 5. Generator untuk Tickets (30 Tiket per Divisi = 90 Tiket Total)
INSERT INTO "Ticket" ("id", "companyId", "divisionId", "title", "description", "assigneeId", "createdById", "status", "deadline", "createdAt", "updatedAt")
SELECT
  'tkt_' || row_number() OVER () as id,
  'comp_sadhana' as "companyId",
  divs.id as "divisionId",
  CASE (num.n % 8)
    WHEN 0 THEN 'Optimasi performa query database & indexing'
    WHEN 1 THEN 'Implementasi unit testing module'
    WHEN 2 THEN 'Redesign landing page utama'
    WHEN 3 THEN 'Riset keyword & SEO optimization'
    WHEN 4 THEN 'Fixing bug auth token expired'
    WHEN 5 THEN 'Integrasi middleware payment gateway'
    WHEN 6 THEN 'Desain banner promosi media sosial'
    ELSE 'Setup CI/CD pipeline deployment'
  END || ' #' || num.n as "title",
  'Deskripsi tiket simulasi untuk divisi ' || divs.id || '. Dibuat secara otomatis untuk data historis.' as "description",
  -- Ambil assignee secara deterministik dari user divisi tersebut
  (
    SELECT id FROM "User" 
    WHERE "divisionId" = divs.id 
    ORDER BY (num.n + ascii(substring(id from 1 for 1))) % 2
    LIMIT 1
  ) as "assigneeId",
  'usr_lead_dev' as "createdById",
  CASE (num.n % 6)
    WHEN 0 THEN 'TODO'::"TicketStatus"
    WHEN 1 THEN 'TODO'::"TicketStatus"
    WHEN 2 THEN 'IN_PROGRESS'::"TicketStatus"
    WHEN 3 THEN 'REVIEW'::"TicketStatus"
    WHEN 4 THEN 'REVIEW'::"TicketStatus"
    ELSE 'DONE'::"TicketStatus"
  END as "status",
  NOW() - ((30 - num.n) * 3 || ' days')::interval + INTERVAL '7 days' as "deadline",
  NOW() - ((30 - num.n) * 3 || ' days')::interval as "createdAt",
  NOW() - ((30 - num.n) * 3 || ' days')::interval + INTERVAL '1 day' as "updatedAt"
FROM
  (SELECT id FROM "Division") divs
CROSS JOIN
  generate_series(1, 30) num(n);

-- 6. Generator untuk DailyReport (5 Bulan Terakhir / ~150 Hari)
-- Mengisi laporan harian secara otomatis untuk setiap user di divisi masing-masing
INSERT INTO "DailyReport" ("id", "userId", "divisionId", "date", "content", "blockers", "createdAt")
SELECT 
  'rep_' || row_number() OVER () as id,
  u.id as "userId",
  u."divisionId" as "divisionId",
  d.date as "date",
  CASE (row_number() OVER () % 4)
    WHEN 0 THEN 'Mengerjakan task sprint, update standar coding, dan review PR rekan tim.'
    WHEN 1 THEN 'Riset kompetitor, merancang materi promosi mingguan, dan evaluasi ad-campaign.'
    WHEN 2 THEN 'Refactor controller API, perbaikan login error, dan menulis dokumentasi teknis.'
    ELSE 'Merancang wireframe landing page, menyusun styleguide warna, dan koordinasi dengan klien.'
  END as "content",
  CASE WHEN (random() < 0.12) THEN 
    CASE (row_number() OVER () % 3)
      WHEN 0 THEN 'Menunggu approval PR dari lead dev.'
      WHEN 1 THEN 'Koneksi ke API staging server mengalami lambat/timeout.'
      ELSE 'Menunggu aset visual final dari tim desainer.'
    END
    ELSE NULL
  END as "blockers",
  d.date as "createdAt"
FROM 
  (SELECT id, "divisionId" FROM "User" WHERE "divisionId" IS NOT NULL) u
CROSS JOIN
  (SELECT date::timestamp as date FROM generate_series(NOW() - INTERVAL '150 days', NOW(), '1 day'::interval) date) d
WHERE random() < 0.85; -- 85% tingkat kepatuhan submit report harian

-- 7. Generator untuk TicketComments (Komentar Acak pada Tiket)
INSERT INTO "TicketComment" ("id", "ticketId", "userId", "content", "createdAt")
SELECT
  'com_' || row_number() OVER () as id,
  t.id as "ticketId",
  u.id as "userId",
  CASE (row_number() OVER () % 5)
    WHEN 0 THEN 'Pekerjaan ini sudah selesai saya push, mohon di-review.'
    WHEN 1 THEN 'Ada beberapa kendala minor di test run, sedang diinvestigasi.'
    WHEN 2 THEN 'Aset desain sudah di-upload di share drive.'
    WHEN 3 THEN 'Sudah siap dideploy ke server staging.'
    ELSE 'Saran tambahan: sebaiknya warna button disesuaikan kembali.'
  END as "content",
  t."createdAt" + INTERVAL '4 hours' as "createdAt"
FROM
  "Ticket" t
CROSS JOIN
  (SELECT id FROM "User" WHERE "role" != 'SUPER_ADMIN') u
WHERE random() < 0.25; -- Mengomentari ~25% kombinasi secara acak
