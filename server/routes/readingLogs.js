import { Router } from 'express'
import { query, sql } from '../index.js'
import { asyncHandler, buildInsert, getUserId, toCamelCaseArray } from '../lib/helpers.js'

const router = Router()

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const bookId = req.query.bookId
    const bookFilter = bookId ? `AND r.book_id = $2` : ''
    const rows = await query(
      `SELECT r.*, b.title AS book_title, b.author AS book_author
       FROM reading_logs r
       LEFT JOIN books b ON b.id = r.book_id
       WHERE r.user_id = $1 ${bookFilter}
       ORDER BY r.created_at DESC`,
      [getUserId(), ...(bookId ? [bookId] : [])]
    )
    res.json(toCamelCaseArray(rows))
  })
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { text, values } = buildInsert('reading_logs', { ...req.body, userId: getUserId() })
    const rows = await query(text, values)
    res.status(201).json(toCamelCaseArray(rows)[0])
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const rows =
      await sql`DELETE FROM reading_logs WHERE id = ${req.params.id} AND user_id = ${getUserId()} RETURNING id`
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Riwayat tidak ditemukan.' })
    }
    res.json({ success: true })
  })
)

export { router as readingLogsRouter }
