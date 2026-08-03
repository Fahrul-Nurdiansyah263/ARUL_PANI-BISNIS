-- 1. Bersihkan database terlebih dahulu (Reset data)
TRUNCATE TABLE "TicketComment", "Ticket", "Session", "VerificationToken", "User", "Company", "AiSummary" CASCADE;

-- 2. Insert Company
INSERT INTO "Company" ("id", "name", "slug", "logoUrl", "createdAt")
VALUES ('comp_Arul-Pani', 'Arul-Pani Agency', 'Arul-Pani-agency', NULL, NOW());

-- 3. Insert User
-- Catatan: Password hash di bawah adalah untuk 'password123'
INSERT INTO "User" ("id", "companyId", "name", "email", "passwordHash", "role", "avatarUrl", "position", "isActive", "createdAt")
VALUES 
('usr_fahrul', 'comp_Arul-Pani', 'Fahrul Nurdiansyah', 'fahrul@Arul-Pani.agency', '$2b$12$obtUdnjpuOoutEpqUGmmIu0liQVFHt.3jlg3Gx1mPker6UO0qDjkK', 'OWNER'::"Role",  NULL, 'Creative Director',  TRUE, NOW()),
('usr_rina',   'comp_Arul-Pani', 'Rina Kusuma',        'rina@Arul-Pani.agency',   '$2b$12$obtUdnjpuOoutEpqUGmmIu0liQVFHt.3jlg3Gx1mPker6UO0qDjkK', 'MEMBER'::"Role", NULL, 'Branding',           TRUE, NOW()),
('usr_budi',   'comp_Arul-Pani', 'Budi Santoso',       'budi@Arul-Pani.agency',   '$2b$12$obtUdnjpuOoutEpqUGmmIu0liQVFHt.3jlg3Gx1mPker6UO0qDjkK', 'MEMBER'::"Role", NULL, 'Content Writer',     TRUE, NOW()),
('usr_andi',   'comp_Arul-Pani', 'Andi Pratama',       'andi@Arul-Pani.agency',   '$2b$12$obtUdnjpuOoutEpqUGmmIu0liQVFHt.3jlg3Gx1mPker6UO0qDjkK', 'MEMBER'::"Role", NULL, 'Frontend Developer', TRUE, NOW()),
('usr_sari',   'comp_Arul-Pani', 'Sari Dewi',          'sari@Arul-Pani.agency',   '$2b$12$obtUdnjpuOoutEpqUGmmIu0liQVFHt.3jlg3Gx1mPker6UO0qDjkK', 'MEMBER'::"Role", NULL, 'Social Media',       TRUE, NOW()),
('usr_rizky',  'comp_Arul-Pani', 'Rizky Pratama',      'rizky@Arul-Pani.agency',  '$2b$12$obtUdnjpuOoutEpqUGmmIu0liQVFHt.3jlg3Gx1mPker6UO0qDjkK', 'MEMBER'::"Role", NULL, 'Graphic Designer',   TRUE, NOW()),
('usr_dewi',   'comp_Arul-Pani', 'Dewi Lestari',       'dewi@Arul-Pani.agency',   '$2b$12$obtUdnjpuOoutEpqUGmmIu0liQVFHt.3jlg3Gx1mPker6UO0qDjkK', 'MEMBER'::"Role", NULL, 'Copywriter',         TRUE, NOW());

-- 4. Generator untuk Tickets (90 Tiket)
INSERT INTO "Ticket" ("id", "companyId", "title", "description", "assigneeId", "createdById", "status", "deadline", "createdAt", "updatedAt")
SELECT
  'tkt_' || row_number() OVER () as id,
  'comp_Arul-Pani' as "companyId",
  CASE (num.n % 8)
    WHEN 0 THEN 'Optimasi landing page klien'
    WHEN 1 THEN 'Desain visual konten media sosial'
    WHEN 2 THEN 'Pengembangan fitur dashboard'
    WHEN 3 THEN 'Riset keyword & SEO optimization'
    WHEN 4 THEN 'Fixing bug form registrasi'
    WHEN 5 THEN 'Buat proposal kreatif klien'
    WHEN 6 THEN 'Setup campaign iklan digital'
    ELSE 'Review & revisi materi branding'
  END || ' #' || num.n as "title",
  'Deskripsi tiket untuk proyek Arul-Pani Agency. Dibuat secara otomatis untuk data historis.' as "description",
  (
    SELECT id FROM "User"
    WHERE role = 'MEMBER'
    ORDER BY (num.n + ascii(substring(id from 1 for 1))) % 5
    LIMIT 1
  ) as "assigneeId",
  'usr_fahrul' as "createdById",
  CASE (num.n % 6)
    WHEN 0 THEN 'TODO'::"TicketStatus"
    WHEN 1 THEN 'TODO'::"TicketStatus"
    WHEN 2 THEN 'IN_PROGRESS'::"TicketStatus"
    WHEN 3 THEN 'REVIEW'::"TicketStatus"
    WHEN 4 THEN 'REVIEW'::"TicketStatus"
    ELSE 'DONE'::"TicketStatus"
  END as "status",
  NOW() - ((90 - num.n) * 3 || ' days')::interval + INTERVAL '7 days' as "deadline",
  NOW() - ((90 - num.n) * 3 || ' days')::interval as "createdAt",
  NOW() - ((90 - num.n) * 3 || ' days')::interval + INTERVAL '1 day' as "updatedAt"
FROM generate_series(1, 90) num(n);

-- 5. Generator untuk TicketComments
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
  (SELECT id FROM "User" WHERE "role" = 'MEMBER') u
WHERE random() < 0.25;