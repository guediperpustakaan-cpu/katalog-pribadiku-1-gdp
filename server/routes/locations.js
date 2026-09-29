import { Router } from 'express'
import { query, sql } from '../index.js'
import { asyncHandler, buildInsert, buildUpdate, getUserId, toCamelCaseArray } from '../lib/helpers.js'

const router = Router()

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await sql`
      SELECT l.*, COALESCE(b.book_count, 0) AS book_count
      FROM storage_locations l
      LEFT JOIN (
        SELECT storage_location_id, COUNT(*)::int AS book_count
        FROM books WHERE user_id = ${getUserId()}
        GROUP BY storage_location_id
      ) b ON b.storage_location_id = l.id
      WHERE l.user_id = ${getUserId()}
      ORDER BY l.name ASC
    `
    res.json(toCamelCaseArray(rows))
  })
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { text, values } = buildInsert('storage_locations', { ...req.body, userId: getUserId() })
    const rows = await query(text, values)
    res.status(201).json(toCamelCaseArray(rows)[0])
  })
)

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { text, values } = buildUpdate('storage_locations', req.params.id, req.body)
    const rows = await query(text, values)
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lokasi penyimpanan tidak ditemukan.' })
    }
    res.json(toCamelCaseArray(rows)[0])
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const used =
      await sql`SELECT id FROM books WHERE storage_location_id = ${req.params.id} AND user_id = ${getUserId()} LIMIT 1`
    if (used.length > 0) {
      return res
        .status(409)
        .json({ message: 'Lokasi tidak dapat dihapus karena masih digunakan oleh buku.' })
    }
    const rows =
      await sql`DELETE FROM storage_locations WHERE id = ${req.params.id} AND user_id = ${getUserId()} RETURNING id`
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lokasi penyimpanan tidak ditemukan.' })
    }
    res.json({ success: true })
  })
)

export { router as locationsRouter }
