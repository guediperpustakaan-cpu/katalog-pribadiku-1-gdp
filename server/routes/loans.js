import { Router } from 'express'
import { sql } from '../index.js'
import { asyncHandler, buildInsert, buildUpdate, getUserId, toCamelCaseArray } from '../lib/helpers.js'

const router = Router()

/**
 * Update status peminjaman yang sudah lewat batas waktu (due_at)
 * agar selalu konsisten antara database dan tampilan aplikasi.
 */
async function syncOverdueLoans() {
  await sql`
    UPDATE loans
    SET status = 'terlambat'
    WHERE user_id = ${getUserId()}
      AND status = 'dipinjam'
      AND due_at IS NOT NULL
      AND due_at < CURRENT_DATE
      AND returned_at IS NULL
  `
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    await syncOverdueLoans()
    const status = req.query.status && req.query.status !== 'all' ? String(req.query.status) : null

    const rows = await sql`
      SELECT l.*, b.title AS book_title, b.author AS book_author, b.isbn AS book_isbn
      FROM loans l
      LEFT JOIN books b ON b.id = l.book_id
      WHERE l.user_id = ${getUserId()}
      ${status ? sql`AND l.status = ${status}` : sql``}
      ORDER BY l.borrowed_at DESC
    `
    res.json(toCamelCaseArray(rows))
  })
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = { ...req.body, userId: getUserId(), status: req.body.status ?? 'dipinjam' }
    const { text, values } = buildInsert('loans', body)
    const rows = await sql(text, values)

    // Tandai buku sebagai dipinjamkan
    await sql`
      UPDATE books SET ownership_status = 'dipinjamkan', updated_at = now()
      WHERE id = ${body.bookId} AND user_id = ${getUserId()}
    `

    res.status(201).json(toCamelCaseArray(rows)[0])
  })
)

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing =
      await sql`SELECT * FROM loans WHERE id = ${req.params.id} AND user_id = ${getUserId()}`
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Data peminjaman tidak ditemukan.' })
    }

    const { text, values } = buildUpdate('loans', req.params.id, req.body)
    const rows = await sql(text, values)
    const updated = toCamelCaseArray(rows)[0]

    // Jika sudah dikembalikan, kembalikan status kepemilikan buku
    if (updated.status === 'dikembalikan' || updated.returnedAt) {
      await sql`
        UPDATE books SET ownership_status = 'dimiliki', updated_at = now()
        WHERE id = ${updated.bookId} AND user_id = ${getUserId()}
      `
    }

    res.json(updated)
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const rows =
      await sql`DELETE FROM loans WHERE id = ${req.params.id} AND user_id = ${getUserId()} RETURNING id`
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Data peminjaman tidak ditemukan.' })
    }
    res.json({ success: true })
  })
)

export { router as loansRouter }
