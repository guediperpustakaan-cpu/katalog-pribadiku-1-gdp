/**
 * Menjalankan migration database Neon: skema + data awal (seed).
 *
 *   npm run db:migrate
 *
 * Membutuhkan DATABASE_URL pada file .env (connection string Neon).
 */
import dotenv from 'dotenv'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { neon } from '@neondatabase/serverless'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error(
      '\n❌ DATABASE_URL belum diatur.\n' +
        '   Salin .env.example menjadi .env, lalu isi dengan connection string Neon Anda.\n' +
        '   Dapatkan connection string di: https://console.neon.tech\n'
    )
    process.exit(1)
  }

  console.log('🔗 Menghubungkan ke database Neon...')
  const sql = neon(databaseUrl)

  try {
    // Pastikan extension pendukung tersedia
    try {
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`
      await sql`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`
    } catch (err) {
      console.warn('⚠️  Tidak dapat membuat extension (mungkin sudah ada):', err.message)
    }

    const schemaPath = resolve(__dirname, '..', 'db', 'schema.sql')
    const seedPath = resolve(__dirname, '..', 'db', 'seed.sql')

    console.log('📄 Menjalankan skema database (db/schema.sql)...')
    const schema = readFileSync(schemaPath, 'utf-8')
    await sql.unsafe(schema)
    console.log('✅ Skema database berhasil dibuat.')

    console.log('🌱 Menambahkan data awal (db/seed.sql)...')
    const seed = readFileSync(seedPath, 'utf-8')
    await sql.unsafe(seed)
    console.log('✅ Data awal berhasil ditambahkan.')

    const [{ count: bookCount }] = await sql`SELECT COUNT(*)::int AS count FROM books`
    const [{ count: categoryCount }] = await sql`SELECT COUNT(*)::int AS count FROM categories`
    const [{ count: locationCount }] = await sql`SELECT COUNT(*)::int AS count FROM storage_locations`
    const [{ count: loanCount }] = await sql`SELECT COUNT(*)::int AS count FROM loans`

    console.log('\n📊 Ringkasan data:')
    console.log(`   Buku         : ${bookCount}`)
    console.log(`   Kategori     : ${categoryCount}`)
    console.log(`   Lokasi       : ${locationCount}`)
    console.log(`   Peminjaman   : ${loanCount}`)
    console.log('\n🎉 Migration selesai! Aplikasi siap digunakan.')
  } catch (error) {
    console.error('\n❌ Migration gagal:', error.message)
    console.error('\nTip: pastikan connection string Neon benar dan dapat diakses.')
    process.exit(1)
  }
}

runMigration()
