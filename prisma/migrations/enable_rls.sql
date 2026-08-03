-- ============================================================
-- SQL Script untuk Mengaktifkan Row Level Security (RLS) di Supabase
-- ============================================================

-- 1. Mengaktifkan RLS pada seluruh Tabel Database Utama
ALTER TABLE IF EXISTS "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Ticket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "TicketComment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "AiSummary" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "VerificationToken" ENABLE ROW LEVEL SECURITY;

-- 2. Membuat Kebijakan RLS (Policies) untuk PostgreSQL Tables
-- Kebijakan ini mengizinkan akses ke tabel-tabel utama
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access to Company') THEN
    CREATE POLICY "Allow public access to Company" ON "Company" FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access to User') THEN
    CREATE POLICY "Allow public access to User" ON "User" FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access to Project') THEN
    CREATE POLICY "Allow public access to Project" ON "Project" FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access to Ticket') THEN
    CREATE POLICY "Allow public access to Ticket" ON "Ticket" FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access to TicketComment') THEN
    CREATE POLICY "Allow public access to TicketComment" ON "TicketComment" FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access to AiSummary') THEN
    CREATE POLICY "Allow public access to AiSummary" ON "AiSummary" FOR ALL USING (true);
  END IF;
END $$;

-- 3. Mengaktifkan RLS dan Mengatur Kebijakan untuk Supabase Storage
-- Pastikan bucket 'uploads' dibuat dan RLS di storage.objects diaktifkan
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Kebijakan Pembacaan Gambar Publik (SELECT)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for Uploads Bucket') THEN
    CREATE POLICY "Public Access for Uploads Bucket"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'uploads');
  END IF;

-- Kebijakan Pengunggahan Gambar (INSERT)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow Insert for Uploads Bucket') THEN
    CREATE POLICY "Allow Insert for Uploads Bucket"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'uploads');
  END IF;

-- Kebijakan Pembaruan Gambar (UPDATE)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow Update for Uploads Bucket') THEN
    CREATE POLICY "Allow Update for Uploads Bucket"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'uploads');
  END IF;

-- Kebijakan Penghapusan Gambar (DELETE)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow Delete for Uploads Bucket') THEN
    CREATE POLICY "Allow Delete for Uploads Bucket"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'uploads');
  END IF;
END $$;
