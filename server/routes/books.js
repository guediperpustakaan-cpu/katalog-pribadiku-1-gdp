import { Router } from 'express'
import { query, sql } from '../index.js'
import { asyncHandler, buildInsert, buildUpdate, getUserId, toCamelCase, toCamelCaseArray } from '../lib/helpers.js'

const router = Router()

// ----------------------------------------------------------
// GET /api/books - daftar buku dengan filter, search, sort, pagination
// ----------------------------------------------------------
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = getUserId()
    const {
      search,
      categoryId,
      locationId,
      condition,
      readingStatus,
      ownershipStatus,
      sort,
      order,
      page = '1',
      limit = '12',
    } = req.query

    const pageNum = Math.max(1, Number(page) ?? 1)
    const limitNum = Math.max(1, Math.min(100, Number(limit) ?? 12))
    const offset = (pageNum - 1) * limitNum

    const where = ['user_id = $1']
    const values = [userId]
    let paramCount = 1

    const addCondition = (column, value) => {
      paramCount += 1
      where.push(`${column} = $${paramCount}`)
      values.push(value)
    }

    if (search && String(search).trim()) {
      paramCount += 1
      where.push(
        `(lower(title) ILIKE $${paramCount} OR lower(author) ILIKE $${paramCount} OR isbn ILIKE $${paramCount} OR lower(notes) ILIKE $${paramCount})`
      )
      values.push(`%${String(search).trim().toLowerCase()}%`)
    }
    if (categoryId) addCondition('category_id', categoryId)
    if (locationId) addCondition('storage_location_id', locationId)
    if (condition) addCondition('condition', condition)
    if (readingStatus) addCondition('reading_status', readingStatus)
    if (ownershipStatus) addCondition('ownership_status', ownershipStatus)

    const sortColumn = ['title', 'author', 'publication_year', 'created_at', 'rating'].includes(sort)
      ? sort
      : 'created_at'
    const sortDirection = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    const nulls = sortDirection === 'DESC' ? 'NULLS LAST' : 'NULLS FIRST'

    const whereClause = `WHERE ${where.join(' AND ')}`

    const totalRows = await query(
      `SELECT COUNT(*)::int AS total FROM books ${whereClause}`,
      values
    )
    const total = totalRows[0]?.total ?? 0

    const rows = await query(
      `SELECT * FROM books ${whereClause} ORDER BY ${sortColumn} ${sortDirection} ${nulls}, title ASC LIMIT $${
        values.length + 1
      } OFFSET ${values.length + 2}`,
      [...values, limitNum, offset]
    )

    res.json({
      data: toCamelCaseArray(rows),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
    })
  })
)

// ----------------------------------------------------------
// GET /api/books/all - semua buku (untuk ekspor CSV)
// ----------------------------------------------------------
router.get(
  '/all',
  asyncHandler(async (_req, res) => {
    const rows = await sql`SELECT * FROM books WHERE user_id = ${getUserId()} ORDER BY created_at DESC`
    res.json(toCamelCaseArray(rows))
  })
)

// ----------------------------------------------------------
// GET /api/books/:id - detail buku
// ----------------------------------------------------------
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const rows = await sql`SELECT * FROM books WHERE id = ${req.params.id} AND user_id = ${getUserId()}`
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Buku tidak ditemukan.' })
    }
    res.json(toCamelCase(rows[0]))
  })
)

// ----------------------------------------------------------
// POST /api/books - tambah buku
// ----------------------------------------------------------
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = { ...req.body, userId: getUserId() }

    // Cegah duplikasi berdasarkan ISBN
    if (data.isbn) {
      const existing = await sql`SELECT id FROM books WHERE isbn = ${data.isbn} AND user_id = ${getUserId()}`
      if (existing.length > 0) {
        return res.status(409).json({ message: `Buku dengan ISBN ${data.isbn} sudah ada di koleksi.` })
      }
    }

    const { text, values } = buildInsert('books', data)
    const rows = await query(text, values)
    res.status(201).json(toCamelCase(rows[0]))
  })
)

// ----------------------------------------------------------
// POST /api/books/bulk - impor banyak buku
// ----------------------------------------------------------
router.post(
  '/bulk',
  asyncHandler(async (req, res) => {
    const items = Array.isArray(req.body) ? req.body : []
    if (items.length === 0) {
      return res.status(400).json({ message: 'Tidak ada data untuk diimpor.' })
    }

    const userId = getUserId()
    const existingIsbns = new Set(
      (await sql`SELECT isbn FROM books WHERE user_id = ${userId} AND isbn IS NOT NULL`).map(
        (r) => r.isbn
      )
    )

    let inserted = 0
    for (const item of items) {
      const data = { ...item, userId: getUserId() }
      if (data.isbn && existingIsbns.has(data.isbn)) continue
      if (!data.title) continue

      try {
        const { text, values } = buildInsert('books', data)
        await query(text, values)
        if (data.isbn) existingIsbns.add(data.isbn)
        inserted += 1
      } catch (error) {
        console.error('Gagal mengimpor satu baris:', error.message)
      }
    }

    res.status(201).json({ inserted })
  })
)

// ----------------------------------------------------------
// PUT /api/books/:id - ubah buku
// ----------------------------------------------------------
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const rows = await sql`SELECT id FROM books WHERE id = ${req.params.id} AND user_id = ${getUserId()}`
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Buku tidak ditemukan.' })
    }

    const { text, values } = buildUpdate('books', req.params.id, req.body)
    const updated = await query(text, values)
    res.json(toCamelCase(updated[0]))
  })
)

// ----------------------------------------------------------
// DELETE /api/books/:id - hapus buku
// ----------------------------------------------------------
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const rows = await sql`DELETE FROM books WHERE id = ${req.params.id} AND user_id = ${getUserId()} RETURNING id`
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Buku tidak ditemukan.' })
    }
    res.json({ success: true })
  })
)

export { router as booksRouter }
