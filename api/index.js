/**
 * Entry point serverless untuk Vercel.
 *
 * Vercel menjalankan file di folder `api/` sebagai serverless function.
 * Kita cukup mengekspor aplikasi Express dari `server/index.js`; Vercel
 * secara otomatis membungkusnya sebagai handler HTTP.
 *
 * Semua permintaan ke `/api/*` diarahkan ke function ini melalui
 * `rewrites` di `vercel.json`, sehingga rute Express (`/api/books`, dll.)
 * tetap berfungsi tanpa perubahan kode.
 */
import { app } from '../server/index.js'

export default app
