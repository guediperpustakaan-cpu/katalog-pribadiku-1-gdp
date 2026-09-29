/**
 * Menjalankan migration database Neon: skema + data awal (seed).
 *
 *   npm run db:migrate
 *
 * Membutuhkan DATABASE_URL pada file .env (connection string Neon).
 *
 * Catatan: migration memakai driver `pg` (node-postgres) karena ia
 * mendukung eksekusi multi-statement & dollar-quoted strings ($$...$$)
 * yang dipakai di schema.sql. Driver serverless `@neondatabase/serverless`
 * (dipakai oleh API) hanya mendukung satu statement per permintaan HTTP,
 * sehingga tidak cocok untuk menjalankan migration.
 */
import dotenv from 'dotenv'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

dotenv.config()

const { Pool } = pg
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
  // Neon memerlukan SSL. Karena connection string sudah memuat
  // sslmode=require, pg akan memakai SSL otomatis.
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: true },
  })
  const client = await pool.connect()

  try {
    // Pastikan extension pendukung tersedia
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')
      await client.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm"')
    } catch (err) {
      console.warn('⚠️  Tidak dapat membuat extension (mungkin sudah ada):', err.message)
    }

    const schemaPath = resolve(__dirname, '..', 'db', 'schema.sql')
    const seedPath = resolve(__dirname, '..', 'db', 'seed.sql')

    console.log('📄 Menjalankan skema database (db/schema.sql)...')
    const schema = readFileSync(schemaPath, 'utf-8')
    await client.query(schema)
    console.log('✅ Skema database berhasil dibuat.')

    console.log('🌱 Menambahkan data awal (db/seed.sql)...')
    const seed = readFileSync(seedPath, 'utf-8')
    await client.query(seed)
    console.log('✅ Data awal berhasil ditambahkan.')

    const { rows: bookRows } = await client.query('SELECT COUNT(*)::int AS count FROM books')
    const { rows: categoryRows } = await client.query('SELECT COUNT(*)::int AS count FROM categories')
    const { rows: locationRows } = await client.query(
      'SELECT COUNT(*)::int AS count FROM storage_locations'
    )
    const { rows: loanRows } = await client.query('SELECT COUNT(*)::int AS count FROM loans')

    console.log('\n📊 Ringkasan data:')
    console.log(`   Buku         : ${bookRows[0].count}`)
    console.log(`   Kategori     : ${categoryRows[0].count}`)
    console.log(`   Lokasi       : ${locationRows[0].count}`)
    console.log(`   Peminjaman   : ${loanRows[0].count}`)
    console.log('\n🎉 Migration selesai! Aplikasi siap digunakan.')
  } catch (error) {
    console.error('\n❌ Migration gagal:', error.message)
    console.error('\nTip: pastikan connection string Neon benar dan dapat diakses.')
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigration()
