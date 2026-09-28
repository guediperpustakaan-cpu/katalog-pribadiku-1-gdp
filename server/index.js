/**
 * Server API untuk Katalog Pribadiku.
 *
 * Backend memakai Express + Neon PostgreSQL (serverless Postgres).
 * Server ini menjadi satu-satunya jalur akses aplikasi ke database,
 * sehingga secret (DATABASE_URL) tetap aman di server dan tidak
 * pernah diekspos ke browser.
 *
 * Jalankan:  npm run dev:all   (frontend + backend bersamaan)
 */
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { neon } from '@neondatabase/serverless'
import { booksRouter } from './routes/books.js'
import { categoriesRouter } from './routes/categories.js'
import { locationsRouter } from './routes/locations.js'
import { loansRouter } from './routes/loans.js'
import { readingLogsRouter } from './routes/readingLogs.js'
import { statsRouter } from './routes/stats.js'

dotenv.config()

const PORT = Number(process.env.PORT ?? 3001)
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'

if (!process.env.DATABASE_URL) {
  console.warn(
    '\n⚠️  DATABASE_URL belum diatur. Server akan berjalan namun setiap permintaan ' +
      'ke database akan gagal. Frontend otomatis beralih ke penyimpanan lokal.\n' +
      '   Salin .env.example menjadi .env lalu isi connection string Neon Anda.\n'
  )
}

// Client Neon. Jika DATABASE_URL kosong, set string koneksi tidak valid
// yang akan memicu fallback di sisi frontend.
export const sql = neon(process.env.DATABASE_URL ?? 'postgresql://localhost:5432/placeholder')

const app = express()

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
)
app.use(express.json({ limit: '15mb' }))

// Middleware: pastikan koneksi database tersedia
app.use((req, res, next) => {
  if (!process.env.DATABASE_URL) {
    return res.status(503).json({
      message:
        'Database belum dikonfigurasi. Isi DATABASE_URL pada file .env dengan connection string Neon Anda.',
    })
  }
  next()
})

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Rute API
app.use('/api/books', booksRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/locations', locationsRouter)
app.use('/api/loans', loansRouter)
app.use('/api/reading-logs', readingLogsRouter)
app.use('/api/stats', statsRouter)

// Handler error global
app.use((err, _req, res, _next) => {
  console.error('Error server:', err.message)
  res.status(err.status ?? 500).json({
    message: err.message ?? 'Terjadi kesalahan pada server.',
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server API berjalan di http://localhost:${PORT}`)
  console.log(`   Origin frontend yang diizinkan: ${CLIENT_ORIGIN}`)
})
