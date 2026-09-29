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
// Origin yang diizinkan CORS. Pada deployment Vercel, frontend dan API
// berbagi origin yang sama sehingga CORS tidak diperlukan; tetapi jika
// frontend di-host terpisah, isi CLIENT_ORIGIN dengan URL frontend.
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'

if (!process.env.DATABASE_URL) {
  console.warn(
    '\n⚠️  DATABASE_URL belum diatur. Server akan berjalan namun setiap permintaan ' +
      'ke database akan gagal. Frontend otomatis beralih ke penyimpanan lokal.\n' +
      '   Salin .env.example menjadi .env lalu isi connection string Neon Anda.\n'
  )
}

// Client Neon. Dibuat secara defensif: neon() memvalidasi connection string
// saat dipanggil, jadi bungkus dengan try/catch agar server tetap bisa
// start (dan mengembalikan respons error yang jelas) jika DATABASE_URL
// belum diatur atau tidak valid.
let sql
try {
  sql = neon(process.env.DATABASE_URL)
} catch (error) {
  console.warn('⚠️  DATABASE_URL tidak valid, endpoint database akan gagal:', error.message)
  sql = () => {
    throw new Error('DATABASE_URL tidak valid atau belum dikonfigurasi.')
  }
}

/**
 * Jalankan parameterized query dengan aman pada driver Neon.
 *
 * Driver `@neondatabase/serverless` tidak mendukung pola
 * `sql('SELECT ... WHERE id = $1', [value])` (argumen array) dan
 * membutuhkan pemanggilan sebagai tagged template:
 * `sql\`SELECT ... WHERE id = ${value}\``. Fungsi ini menerjemahkan
 * placeholder `$1, $2, ...` menjadi interpolasi tag-template, termasuk
 * untuk placeholder yang dipakai berulang (mis. `ILIKE $2 ... ILIKE $2`).
 *
 * @param {string} text - query dengan placeholder `$1`, `$2`, ...
 * @param {unknown[]} values - nilai tiap placeholder (diindeks dari 1)
 */
function query(text, values = []) {
  const tokens = String(text).split(/(\$\d+)/)
  const strings = []
  const interpolated = []
  let buffer = ''
  let used = 0
  for (const token of tokens) {
    if (token === '') continue
    const match = /^(\$\d+)$/.exec(token)
    if (match) {
      const index = Number(match[1].slice(1)) - 1
      if (index < 0 || index >= values.length) {
        throw new Error(`Placeholder ${match[1]} tidak punya nilai (diberikan ${values.length} nilai).`)
      }
      strings.push(buffer)
      buffer = ''
      interpolated.push(values[index])
      used += 1
    } else {
      buffer += token
    }
  }
  strings.push(buffer)
  if (used === 0 && values.length > 0) {
    throw new Error('Query tidak memuat placeholder, tetapi nilai diberikan.')
  }
  return sql(strings, ...interpolated)
}

export { sql, query }

const app = express()

app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan: same-origin (browser tidak mengirim header Origin), origin
      // yang dikonfigurasi via CLIENT_ORIGIN, atau semua origin jika
      // CLIENT_ORIGIN diisi '*' (umum untuk deployment Vercel).
      if (!origin || CLIENT_ORIGIN === '*' || origin === CLIENT_ORIGIN) {
        callback(null, true)
      } else {
        callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS`))
      }
    },
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

export { app }

// Hanya jalankan server HTTP standalone di luar Vercel. Di Vercel, app
// diekspor sebagai serverless function (lihat api/index.js) dan tidak
// perlu memanggil app.listen().
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server API berjalan di http://localhost:${PORT}`)
    console.log(`   Origin frontend yang diizinkan: ${CLIENT_ORIGIN}`)
  })
}
