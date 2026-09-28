import { Router } from 'express'
import { sql } from '../index.js'
import { asyncHandler, getUserId } from '../lib/helpers.js'

const router = Router()

// ----------------------------------------------------------
// GET /api/stats/dashboard - ringkasan untuk halaman Dashboard
// ----------------------------------------------------------
router.get(
  '/dashboard',
  asyncHandler(async (_req, res) => {
    const userId = getUserId()

    const [bookStats] = await sql`
      SELECT
        COUNT(*)::int AS total_books,
        COUNT(*) FILTER (WHERE reading_status = 'sudah_dibaca')::int AS read_books,
        COUNT(*) FILTER (WHERE reading_status = 'belum_dibaca')::int AS unread_books,
        COUNT(*) FILTER (WHERE reading_status = 'sedang_dibaca')::int AS currently_reading,
        COUNT(*) FILTER (WHERE ownership_status = 'dipinjamkan')::int AS borrowed_books,
        COALESCE(AVG(rating), 0)::float AS average_rating,
        COALESCE(SUM(page_count), 0)::int AS total_pages
      FROM books WHERE user_id = ${userId}
    `

    const [counts] = await sql`
      SELECT
        (SELECT COUNT(*)::int FROM categories WHERE user_id = ${userId}) AS total_categories,
        (SELECT COUNT(*)::int FROM storage_locations WHERE user_id = ${userId}) AS total_locations
    `

    const overdue = await sql`
      SELECT COUNT(*)::int AS total
      FROM loans
      WHERE user_id = ${userId}
        AND status != 'dikembalikan'
        AND returned_at IS NULL
        AND due_at IS NOT NULL
        AND due_at < CURRENT_DATE
    `

    res.json({
      totalBooks: bookStats?.total_books ?? 0,
      readBooks: bookStats?.read_books ?? 0,
      unreadBooks: bookStats?.unread_books ?? 0,
      currentlyReading: bookStats?.currently_reading ?? 0,
      borrowedBooks: bookStats?.borrowed_books ?? 0,
      totalCategories: counts?.total_categories ?? 0,
      totalLocations: counts?.total_locations ?? 0,
      averageRating: Number(bookStats?.average_rating ?? 0),
      totalPages: bookStats?.total_pages ?? 0,
      overdueLoans: overdue[0]?.total ?? 0,
    })
  })
)

// ----------------------------------------------------------
// GET /api/stats/collection - statistik untuk halaman Statistik
// ----------------------------------------------------------
router.get(
  '/collection',
  asyncHandler(async (_req, res) => {
    const userId = getUserId()

    const [totals] = await sql`
      SELECT
        COUNT(*)::int AS total_books,
        COUNT(*) FILTER (WHERE reading_status = 'sudah_dibaca')::int AS read_books,
        COUNT(*) FILTER (WHERE reading_status = 'belum_dibaca')::int AS unread_books,
        COUNT(*) FILTER (WHERE reading_status = 'sedang_dibaca')::int AS currently_reading,
        COUNT(*) FILTER (WHERE ownership_status = 'dipinjamkan')::int AS borrowed_books,
        COALESCE(AVG(rating), 0)::float AS average_rating
      FROM books WHERE user_id = ${userId}
    `

    const byCategory = await sql`
      SELECT c.id, c.name, COUNT(b.id)::int AS count
      FROM categories c
      LEFT JOIN books b ON b.category_id = c.id AND b.user_id = ${userId}
      WHERE c.user_id = ${userId}
      GROUP BY c.id, c.name
      ORDER BY c.name ASC
    `

    const byLocation = await sql`
      SELECT l.id, l.name, COUNT(b.id)::int AS count
      FROM storage_locations l
      LEFT JOIN books b ON b.storage_location_id = l.id AND b.user_id = ${userId}
      WHERE l.user_id = ${userId}
      GROUP BY l.id, l.name
      ORDER BY l.name ASC
    `

    const byCondition = await sql`
      SELECT condition AS id, condition AS name, COUNT(*)::int AS count
      FROM books WHERE user_id = ${userId}
      GROUP BY condition
      ORDER BY count DESC
    `

    const byYear = await sql`
      SELECT publication_year::text AS year, COUNT(*)::int AS count
      FROM books
      WHERE user_id = ${userId} AND publication_year IS NOT NULL
      GROUP BY publication_year
      ORDER BY publication_year ASC
    `

    const byMonth = await sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS date,
        COUNT(*)::int AS count
      FROM books
      WHERE user_id = ${userId}
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `

    res.json({
      totalBooks: totals?.total_books ?? 0,
      readBooks: totals?.read_books ?? 0,
      unreadBooks: totals?.unread_books ?? 0,
      currentlyReading: totals?.currently_reading ?? 0,
      borrowedBooks: totals?.borrowed_books ?? 0,
      averageRating: Number(totals?.average_rating ?? 0),
      byCategory,
      byLocation,
      byCondition,
      byYear,
      byMonth,
    })
  })
)

export { router as statsRouter }
