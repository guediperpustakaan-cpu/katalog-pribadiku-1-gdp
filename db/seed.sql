-- ============================================================
-- Katalog Pribadiku - Data Awal (Seed)
-- ============================================================
-- 11 kategori awal + 6 lokasi contoh + 8 buku contoh + peminjaman.
-- Jalankan ulang file ini bersifat idempoten untuk data buku
-- (berdasarkan ISBN) sehingga aman dijalankan berulang kali.
--
--   npm run db:migrate   (sudah memanggil seed ini secara otomatis)
-- ============================================================

-- Reset data lama (urutan penting karena adanya foreign key)
DELETE FROM reading_logs;
DELETE FROM loans;
DELETE FROM books;
DELETE FROM categories;
DELETE FROM storage_locations;

-- ============================================================
-- KATEGORI AWAL
-- ============================================================
INSERT INTO categories (id, user_id, name) VALUES
  ('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000000', 'Fiksi'),
  ('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000000', 'Nonfiksi'),
  ('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000000', 'Teknologi'),
  ('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000000', 'Bisnis'),
  ('11111111-1111-1111-1111-111111111105', '00000000-0000-0000-0000-000000000000', 'Sejarah'),
  ('11111111-1111-1111-1111-111111111106', '00000000-0000-0000-0000-000000000000', 'Agama'),
  ('11111111-1111-1111-1111-111111111107', '00000000-0000-0000-0000-000000000000', 'Pendidikan'),
  ('11111111-1111-1111-1111-111111111108', '00000000-0000-0000-0000-000000000000', 'Biografi'),
  ('11111111-1111-1111-1111-111111111109', '00000000-0000-0000-0000-000000000000', 'Komik'),
  ('11111111-1111-1111-1111-111111111110', '00000000-0000-0000-0000-000000000000', 'Novel'),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'Lainnya');

-- ============================================================
-- LOKASI PENYIMPANAN CONTOH
-- ============================================================
INSERT INTO storage_locations (id, user_id, name, description) VALUES
  ('22222222-2222-2222-2222-222222222201', '00000000-0000-0000-0000-000000000000', 'Rak A', 'Rak buku utama di ruang tamu, susunan atas'),
  ('22222222-2222-2222-2222-222222222202', '00000000-0000-0000-0000-000000000000', 'Rak B', 'Rak buku utama di ruang tamu, susunan bawah'),
  ('22222222-2222-2222-2222-222222222203', '00000000-0000-0000-0000-000000000000', 'Lemari kamar', 'Lemari pakaian di kamar tidur, rak ketiga'),
  ('22222222-2222-2222-2222-222222222204', '00000000-0000-0000-0000-000000000000', 'Ruang tamu', 'Meja samping sofa di ruang tamu'),
  ('22222222-2222-2222-2222-222222222205', '00000000-0000-0000-0000-000000000000', 'Kardus 1', 'Kardus di gudang belakang'),
  ('22222222-2222-2222-2222-222222222206', '00000000-0000-0000-0000-000000000000', 'Kardus 2', 'Kardus cadangan di gudang belakang');

-- ============================================================
-- BUKU CONTOH (8 buku dengan variasi kategori, lokasi, status)
-- ============================================================
INSERT INTO books (
  id, user_id, title, author, isbn, publisher, publication_year, edition, language,
  category_id, description, page_count, cover_image_url, condition, storage_location_id,
  reading_status, ownership_status, rating, notes, acquired_date, created_at
) VALUES
  (
    '33333333-3333-3333-3333-333333333301',
    '00000000-0000-0000-0000-000000000000',
    'Laskar Pelangi',
    'Andrea Hirata',
    '9786020324812',
    'Bentang Pustaka',
    2005, 'Cetakan ke-12', 'Indonesia',
    '11111111-1111-1111-1111-111111111110',
    'Novel inspiratif tentang sepuluh anak miskin di Pulau Belitung yang berjuang mendapatkan pendidikan. Penuh haru, tawa, dan harapan.',
    529, NULL, 'baik', '22222222-2222-2222-2222-222222222201',
    'sudah_dibaca', 'dimiliki', 5,
    'Buku favorit sepanjang masa. Selalu teringat kutipan "Allah maha penyayang".',
    '2019-04-21', now() - interval '400 days'
  ),
  (
    '33333333-3333-3333-3333-333333333302',
    '00000000-0000-0000-0000-000000000000',
    'Bumi Manusia',
    'Pramoedya Ananta Toer',
    '9789799731234',
    'Lentera Dipantara',
    2006, 'Cetakan ke-2', 'Indonesia',
    '11111111-1111-1111-1111-111111111110',
    'Karya sastra Indonesia tentang cinta dan perlawanan Minke terhadap ketidakadilan kolonial.',
    535, NULL, 'sangat_baik', '22222222-2222-2222-2222-222222222201',
    'sudah_dibaca', 'dimiliki', 5,
    'Karya sastra yang menggetarkan. Wajib dibaca minimal sekali seumur hidup.',
    '2020-08-02', now() - interval '350 days'
  ),
  (
    '33333333-3333-3333-3333-333333333303',
    '00000000-0000-0000-0000-000000000000',
    'Atomic Habits',
    'James Clear',
    '9780735211292',
    'Avery',
    2018, 'Edisi pertama', 'Inggris',
    '11111111-1111-1111-1111-111111111104',
    'Panduan praktis membangun kebiasaan baik dan menghilangkan kebiasaan buruuk melalui perubahan kecil yang konsisten.',
    320, NULL, 'baru', '22222222-2222-2222-2222-222222222204',
    'sedang_dibaca', 'dimiliki', 4,
    'Sedang dicoba metode habit stacking-nya. Bab tentang 1% better life sangat membekas.',
    '2026-01-15', now() - interval '30 days'
  ),
  (
    '33333333-3333-3333-3333-333333333304',
    '00000000-0000-0000-0000-000000000000',
    'Sapiens: Riwayat Singkat Umat Manusia',
    'Yuval Noah Harari',
    '9786020621831',
    'Kepustakaan Populer Gramedia',
    2017, 'Cetakan ke-5', 'Indonesia',
    '11111111-1111-1111-1111-111111111105',
    'Penjelasan mendalam tentang bagaimana Homo sapiens menjadi spesies dominan di bumi, dari revolusi kognitif hingga teknologi modern.',
    624, NULL, 'baik', '22222222-2222-2222-2222-222222222202',
    'sudah_dibaca', 'dimiliki', 4,
    'Sangat provokatif dan memperluas sudut pandang. Revolusi agraria dibahas dari sisi yang tidak biasa.',
    '2021-11-10', now() - interval '320 days'
  ),
  (
    '33333333-3333-3333-3333-333333333305',
    '00000000-0000-0000-0000-000000000000',
    'Clean Code: A Handbook of Agile Software Craftsmanship',
    'Robert C. Martin',
    '9780132350884',
    'Prentice Hall',
    2008, 'Edisi pertama', 'Inggris',
    '11111111-1111-1111-1111-111111111103',
    'Buku wajib bagi programmer tentang cara menulis kode yang bersih, mudah dibaca, dan mudah dipelihara.',
    464, NULL, 'cukup', '22222222-2222-2222-2222-222222222203',
    'sedang_dibaca', 'dimiliki', 5,
    'Sudup pojok halamannya terlipat karena sering dibuka ulang. Bab Meaningful Names paling sering dirujuk.',
    '2022-03-05', now() - interval '270 days'
  ),
  (
    '33333333-3333-3333-3333-333333333306',
    '00000000-0000-0000-0000-000000000000',
    'Sejarah Indonesia Modern',
    'M.C. Ricklefs',
    '9789794334516',
    'Serambi',
    2008, 'Cetakan ke-3', 'Indonesia',
    '11111111-1111-1111-1111-111111111105',
    'Ringkasan sejarah Indonesia dari masa prasejarah hingga era reformasi, ditulis oleh sejarawan terkemuka.',
    690, NULL, 'baik', '22222222-2222-2222-2222-222222222202',
    'belum_dibaca', 'dimiliki', NULL,
    'Dibeli di pameran buku murah, belum sempat dibuka sampai halaman 50.',
    '2023-06-19', now() - interval '200 days'
  ),
  (
    '33333333-3333-3333-3333-333333333307',
    '00000000-0000-0000-0000-000000000000',
    'Tetangga Masa Gitu',
    'Eliza V. Handayani',
    '9789791269474',
    'Gramedia Pustaka Utama',
    2012, 'Cetakan pertama', 'Indonesia',
    '11111111-1111-1111-1111-111111111109',
    'Komik cerita silat Indonesia yang lucu dan menghibur tentang kehidupan tetangga sebelah.',
    176, NULL, 'rusak', '22222222-2222-2222-2222-222222222205',
    'sudah_dibaca', 'hilang', 3,
    'Sampulnya sudah robek dan beberapa halaman hilang. Katanya dipinjam sepupu dan tidak kembali.',
    '2018-12-25', now() - interval '150 days'
  ),
  (
    '33333333-3333-3333-3333-333333333308',
    '00000000-0000-0000-0000-000000000000',
    'Filosofi Teras: Berpikir Sebagai Kebiasaan',
    'Henry Manampiring',
    '9786020637174',
    'Kompas',
    2019, 'Cetakan ke-2', 'Indonesia',
    '11111111-1111-1111-1111-111111111102',
    'Pengantar filsafat Stoa yang relevan dengan kehidupan modern - tentang kesehatan mental, resiliensi, dan makna kebahagiaan.',
    312, NULL, 'baru', '22222222-2222-2222-2222-222222222204',
    'belum_dibaca', 'ingin_dijual', NULL,
    'Dibeli karena rekomendasi teman, tapi seumuran dengan Atomic Habits. Rencana dijual di pasar loak.',
    '2025-09-01', now() - interval '20 days'
  );

-- ============================================================
-- PEMINJAMAN CONTOH
-- ============================================================
INSERT INTO loans (
  id, user_id, book_id, borrower_name, borrower_contact, borrowed_at, due_at,
  returned_at, status, notes
) VALUES
  (
    '44444444-4444-4444-4444-444444444401',
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333306',
    'Budi Santoso',
    '081234567890',
    CURRENT_DATE - 20,
    CURRENT_DATE - 6,
    NULL,
    'dipinjam',
    'Katanya dipakai untuk tugas kuliah sejarah.'
  ),
  (
    '44444444-4444-4444-4444-444444444402',
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333301',
    'Sinta Dewi',
    '089876543210',
    CURRENT_DATE - 45,
    CURRENT_DATE - 15,
    CURRENT_DATE - 18,
    'dikembalikan',
    'Dikembalikan dalam kondisi baik. Terima kasih Sinta.'
  );

-- Sinkronkan status buku dengan data peminjaman
UPDATE books
SET ownership_status = 'dipinjamkan'
WHERE id = '33333333-3333-3333-3333-333333333306';

-- ============================================================
-- RIWAYAT STATUS MEMBACA CONTOH
-- ============================================================
INSERT INTO reading_logs (user_id, book_id, status, started_at, finished_at, notes) VALUES
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333301', 'sudah_dibaca',
   now() - interval '380 days', now() - interval '360 days', 'Selesai dibaca dalam 3 minggu.'),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333302', 'sudah_dibaca',
   now() - interval '330 days', now() - interval '300 days', 'Selesai dibaca di akhir pekan.'),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333303', 'sedang_dibaca',
   now() - interval '25 days', NULL, 'Sedang bab tentang habit stacking.'),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333305', 'sedang_dibaca',
   now() - interval '90 days', NULL, 'Dibaca saat butuh referensi kode.');
