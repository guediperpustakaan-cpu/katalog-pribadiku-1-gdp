-- ============================================================
-- Katalog Pribadiku - Skema Database Neon PostgreSQL
-- ============================================================
-- Jalankan file ini di Neon SQL Editor, atau melalui perintah:
--   npm run db:migrate
--
-- Skema ini dinormalisasi: books -> categories, books -> storage_locations,
-- loans -> books, reading_logs -> books. Semua tabel memiliki foreign key
-- dan index pada kolom yang sering dipakai untuk pencarian/filter.
-- ============================================================

-- Extension: pgcrypto untuk gen_random_uuid(), pg_trgm untuk pencarian teks
-- (Neon menyediakannya; pernyataan ini aman jika extension sudah ada)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- 1. KATEGORI
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID,
  name         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories (user_id);
CREATE INDEX IF NOT EXISTS idx_categories_name    ON categories (name);

-- ============================================================
-- 2. LOKASI PENYIMPANAN
-- ============================================================
CREATE TABLE IF NOT EXISTS storage_locations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID,
  name         TEXT NOT NULL,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_storage_locations_user_id ON storage_locations (user_id);
CREATE INDEX IF NOT EXISTS idx_storage_locations_name    ON storage_locations (name);

-- ============================================================
-- 3. BUKU
-- ============================================================
CREATE TABLE IF NOT EXISTS books (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID,
  title              TEXT NOT NULL,
  author             TEXT,
  isbn               TEXT,
  publisher          TEXT,
  publication_year   INTEGER,
  edition            TEXT,
  language           TEXT,
  category_id        UUID REFERENCES categories(id) ON DELETE SET NULL,
  description        TEXT,
  page_count         INTEGER,
  cover_image_url    TEXT,
  condition          TEXT NOT NULL DEFAULT 'baik',
  storage_location_id UUID REFERENCES storage_locations(id) ON DELETE SET NULL,
  reading_status     TEXT NOT NULL DEFAULT 'belum_dibaca',
  ownership_status   TEXT NOT NULL DEFAULT 'dimiliki',
  rating             SMALLINT CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  notes              TEXT,
  acquired_date      DATE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index untuk pencarian & filter yang sering dipakai
CREATE INDEX IF NOT EXISTS idx_books_user_id          ON books (user_id);
CREATE INDEX IF NOT EXISTS idx_books_title            ON books (title);
CREATE INDEX IF NOT EXISTS idx_books_author           ON books (author);
CREATE INDEX IF NOT EXISTS idx_books_isbn             ON books (isbn);
CREATE INDEX IF NOT EXISTS idx_books_category_id      ON books (category_id);
CREATE INDEX IF NOT EXISTS idx_books_storage_location ON books (storage_location_id);
CREATE INDEX IF NOT EXISTS idx_books_reading_status   ON books (reading_status);
CREATE INDEX IF NOT EXISTS idx_books_ownership_status ON books (ownership_status);
CREATE INDEX IF NOT EXISTS idx_books_created_at       ON books (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_year             ON books (publication_year);

-- Pencarian teks lengkap (judul, penulis, ISBN, catatan)
CREATE INDEX IF NOT EXISTS idx_books_search_trgm ON books
  USING gin (lower(title) gin_trgm_ops, lower(author) gin_trgm_ops, isbn gin_trgm_ops, lower(notes) gin_trgm_ops);

-- ============================================================
-- 4. PEMINJAMAN
-- ============================================================
CREATE TABLE IF NOT EXISTS loans (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID,
  book_id          UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  borrower_name    TEXT NOT NULL,
  borrower_contact TEXT,
  borrowed_at      DATE NOT NULL DEFAULT CURRENT_DATE,
  due_at           DATE,
  returned_at      DATE,
  status           TEXT NOT NULL DEFAULT 'dipinjam',
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loans_user_id     ON loans (user_id);
CREATE INDEX IF NOT EXISTS idx_loans_book_id     ON loans (book_id);
CREATE INDEX IF NOT EXISTS idx_loans_status      ON loans (status);
CREATE INDEX IF NOT EXISTS idx_loans_borrowed_at ON loans (borrowed_at DESC);

-- ============================================================
-- 5. RIWAYAT STATUS MEMBACA
-- ============================================================
CREATE TABLE IF NOT EXISTS reading_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID,
  book_id     UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  started_at  DATE,
  finished_at DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reading_logs_user_id ON reading_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_reading_logs_book_id ON reading_logs (book_id);

-- ============================================================
-- TRIGGER: otomatis perbarui kolom updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_categories_updated_at   ON categories;
CREATE TRIGGER trg_categories_updated_at   BEFORE UPDATE ON categories   FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_storage_locations_updated_at ON storage_locations;
CREATE TRIGGER trg_storage_locations_updated_at BEFORE UPDATE ON storage_locations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_books_updated_at ON books;
CREATE TRIGGER trg_books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_loans_updated_at ON loans;
CREATE TRIGGER trg_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- KEAMANAN: ROW LEVEL SECURITY
-- ============================================================
-- Pengguna hanya boleh mengakses data miliknya sendiri (user_id).
-- Jika aplikasi dipakai tanpa autentikasi (mode pribadi/single-user),
-- isi user_id dengan satu nilai konsisten, misalnya '00000000-0000-0000-0000-000000000000'.
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_logs ENABLE ROW LEVEL SECURITY;

-- ---------- categories ----------
DROP POLICY IF EXISTS categories_select_policy ON categories;
CREATE POLICY categories_select_policy ON categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS categories_insert_policy ON categories;
CREATE POLICY categories_insert_policy ON categories
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS categories_update_policy ON categories;
CREATE POLICY categories_update_policy ON categories
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS categories_delete_policy ON categories;
CREATE POLICY categories_delete_policy ON categories
  FOR DELETE USING (true);

-- ---------- storage_locations ----------
DROP POLICY IF EXISTS storage_locations_select_policy ON storage_locations;
CREATE POLICY storage_locations_select_policy ON storage_locations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS storage_locations_insert_policy ON storage_locations;
CREATE POLICY storage_locations_insert_policy ON storage_locations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS storage_locations_update_policy ON storage_locations;
CREATE POLICY storage_locations_update_policy ON storage_locations
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS storage_locations_delete_policy ON storage_locations;
CREATE POLICY storage_locations_delete_policy ON storage_locations
  FOR DELETE USING (true);

-- ---------- books ----------
DROP POLICY IF EXISTS books_select_policy ON books;
CREATE POLICY books_select_policy ON books
  FOR SELECT USING (true);

DROP POLICY IF EXISTS books_insert_policy ON books;
CREATE POLICY books_insert_policy ON books
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS books_update_policy ON books;
CREATE POLICY books_update_policy ON books
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS books_delete_policy ON books;
CREATE POLICY books_delete_policy ON books
  FOR DELETE USING (true);

-- ---------- loans ----------
DROP POLICY IF EXISTS loans_select_policy ON loans;
CREATE POLICY loans_select_policy ON loans
  FOR SELECT USING (true);

DROP POLICY IF EXISTS loans_insert_policy ON loans;
CREATE POLICY loans_insert_policy ON loans
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS loans_update_policy ON loans;
CREATE POLICY loans_update_policy ON loans
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS loans_delete_policy ON loans;
CREATE POLICY loans_delete_policy ON loans
  FOR DELETE USING (true);

-- ---------- reading_logs ----------
DROP POLICY IF EXISTS reading_logs_select_policy ON reading_logs;
CREATE POLICY reading_logs_select_policy ON reading_logs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS reading_logs_insert_policy ON reading_logs;
CREATE POLICY reading_logs_insert_policy ON reading_logs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS reading_logs_delete_policy ON reading_logs;
CREATE POLICY reading_logs_delete_policy ON reading_logs
  FOR DELETE USING (true);

-- ============================================================
-- CATATAN PENTING TENTANG RLS
-- ============================================================
-- Kebijakan di atas menggunakan "USING (true)" karena aplikasi ini
-- dirancang untuk pemakaian pribadi (single-user) di mana backend
-- (Express) yang menjadi satu-satunya jalur akses ke database.
-- Karena server memegang DATABASE_URL, database wajib TIDAK boleh
-- diekspos langsung ke browser.
--
-- Jika nanti Anda ingin menambahkan autentikasi multi-user,
-- ganti "true" dengan pengecekan kepemilikan data, contoh:
--
--   FOR SELECT USING (auth.uid() = user_id);
--   FOR INSERT WITH CHECK (auth.uid() = user_id);
--   FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
--   FOR DELETE USING (auth.uid() = user_id);
--
-- Pastikan setiap INSERT juga mengisi user_id dari sesi pengguna.
-- ============================================================
