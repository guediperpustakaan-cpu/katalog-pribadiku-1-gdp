/**
 * Penyimpanan lokal (localStorage) sebagai backend cadangan.
 *
 * Aplikasi memakai backend Express + Neon PostgreSQL jika tersedia.
 * Jika tidak (mis. sedang offline atau belum dikonfigurasi), penyimpanan
 * lokal ini mengambil alih secara otomatis sehingga aplikasi tetap berjalan
 * penuh - data tersimpan di browser pengguna.
 */
import type {
  Book,
  Category,
  CollectionStats,
  DashboardStats,
  GroupCount,
  Loan,
  PaginatedResponse,
  ReadingLog,
  StorageLocation,
  YearCount,
} from '@/types'
import {
  DEFAULT_CATEGORIES,
  DEFAULT_LOCATIONS,
  DEFAULT_USER_ID,
} from '@/constants'
import { generateId } from '@/utils'
import { isOverdue } from '@/utils/date'

const STORAGE_KEYS = {
  books: 'katalog_pribadiku.books',
  categories: 'katalog_pribadiku.categories',
  locations: 'katalog_pribadiku.locations',
  loans: 'katalog_pribadiku.loans',
  readingLogs: 'katalog_pribadiku.reading_logs',
  seeded: 'katalog_pribadiku.seeded',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Gagal menyimpan data ke penyimpanan lokal.', error)
  }
}

// ============================================================
// SEED DATA
// ============================================================

function seedIfNeeded(): void {
  if (read(STORAGE_KEYS.seeded, false)) return

  const now = new Date().toISOString()
  const daysAgo = (days: number) => new Date(Date.now() - days * 86400000).toISOString()

  const categories: Category[] = DEFAULT_CATEGORIES.map((name, i) => ({
    id: `cat-seed-${String(i + 1).padStart(3, '0')}`,
    userId: DEFAULT_USER_ID,
    name,
    createdAt: now,
    updatedAt: now,
  }))

  const locations: StorageLocation[] = DEFAULT_LOCATIONS.map((loc, i) => ({
    id: `loc-seed-${String(i + 1).padStart(3, '0')}`,
    userId: DEFAULT_USER_ID,
    name: loc.name,
    description: loc.description,
    createdAt: now,
    updatedAt: now,
  }))

  const findCat = (name: string) => categories.find((c) => c.name === name)?.id ?? null
  const findLoc = (name: string) => locations.find((l) => l.name === name)?.id ?? null

  const books: Book[] = [
    {
      id: 'book-seed-001', userId: DEFAULT_USER_ID,
      title: 'Laskar Pelangi', author: 'Andrea Hirata', isbn: '9786020324812',
      publisher: 'Bentang Pustaka', publicationYear: 2005, edition: 'Cetakan ke-12', language: 'Indonesia',
      categoryId: findCat('Novel'), description: 'Novel inspiratif tentang sepuluh anak miskin di Pulau Belitung yang berjuang mendapatkan pendidikan.',
      pageCount: 529, coverImageUrl: null, condition: 'baik', storageLocationId: findLoc('Rak A'),
      readingStatus: 'sudah_dibaca', ownershipStatus: 'dimiliki', rating: 5,
      notes: 'Buku favorit sepanjang masa.', acquiredDate: '2019-04-21',
      createdAt: daysAgo(400), updatedAt: daysAgo(400),
    },
    {
      id: 'book-seed-002', userId: DEFAULT_USER_ID,
      title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer', isbn: '9789799731234',
      publisher: 'Lentera Dipantara', publicationYear: 2006, edition: 'Cetakan ke-2', language: 'Indonesia',
      categoryId: findCat('Novel'), description: 'Karya sastra Indonesia tentang cinta dan perlawanan Minke terhadap ketidakadilan kolonial.',
      pageCount: 535, coverImageUrl: null, condition: 'sangat_baik', storageLocationId: findLoc('Rak A'),
      readingStatus: 'sudah_dibaca', ownershipStatus: 'dimiliki', rating: 5,
      notes: 'Karya sastra yang menggetarkan.', acquiredDate: '2020-08-02',
      createdAt: daysAgo(350), updatedAt: daysAgo(350),
    },
    {
      id: 'book-seed-003', userId: DEFAULT_USER_ID,
      title: 'Atomic Habits', author: 'James Clear', isbn: '9780735211292',
      publisher: 'Avery', publicationYear: 2018, edition: 'Edisi pertama', language: 'Inggris',
      categoryId: findCat('Bisnis'), description: 'Panduan praktis membangun kebiasaan baik melalui perubahan kecil yang konsisten.',
      pageCount: 320, coverImageUrl: null, condition: 'baru', storageLocationId: findLoc('Ruang tamu'),
      readingStatus: 'sedang_dibaca', ownershipStatus: 'dimiliki', rating: 4,
      notes: 'Sedang mencoba metode habit stacking.', acquiredDate: '2026-01-15',
      createdAt: daysAgo(30), updatedAt: daysAgo(30),
    },
    {
      id: 'book-seed-004', userId: DEFAULT_USER_ID,
      title: 'Sapiens: Riwayat Singkat Umat Manusia', author: 'Yuval Noah Harari', isbn: '9786020621831',
      publisher: 'Kepustakaan Populer Gramedia', publicationYear: 2017, edition: 'Cetakan ke-5', language: 'Indonesia',
      categoryId: findCat('Sejarah'), description: 'Penjelasan mendalam tentang bagaimana Homo sapiens menjadi spesies dominan di bumi.',
      pageCount: 624, coverImageUrl: null, condition: 'baik', storageLocationId: findLoc('Rak B'),
      readingStatus: 'sudah_dibaca', ownershipStatus: 'dimiliki', rating: 4,
      notes: 'Sangat provokatif dan memperluas sudut pandang.', acquiredDate: '2021-11-10',
      createdAt: daysAgo(320), updatedAt: daysAgo(320),
    },
    {
      id: 'book-seed-005', userId: DEFAULT_USER_ID,
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship', author: 'Robert C. Martin', isbn: '9780132350884',
      publisher: 'Prentice Hall', publicationYear: 2008, edition: 'Edisi pertama', language: 'Inggris',
      categoryId: findCat('Teknologi'), description: 'Buku wajib programmer tentang cara menulis kode yang bersih dan mudah dipelihara.',
      pageCount: 464, coverImageUrl: null, condition: 'cukup', storageLocationId: findLoc('Lemari kamar'),
      readingStatus: 'sedang_dibaca', ownershipStatus: 'dimiliki', rating: 5,
      notes: 'Sudut halamannya terlipat karena sering dibuka ulang.', acquiredDate: '2022-03-05',
      createdAt: daysAgo(270), updatedAt: daysAgo(270),
    },
    {
      id: 'book-seed-006', userId: DEFAULT_USER_ID,
      title: 'Sejarah Indonesia Modern', author: 'M.C. Ricklefs', isbn: '9789794334516',
      publisher: 'Serambi', publicationYear: 2008, edition: 'Cetakan ke-3', language: 'Indonesia',
      categoryId: findCat('Sejarah'), description: 'Ringkasan sejarah Indonesia dari masa prasejarah hingga era reformasi.',
      pageCount: 690, coverImageUrl: null, condition: 'baik', storageLocationId: findLoc('Rak B'),
      readingStatus: 'belum_dibaca', ownershipStatus: 'dimiliki', rating: null,
      notes: 'Belum sempat dibuka sampai halaman 50.', acquiredDate: '2023-06-19',
      createdAt: daysAgo(200), updatedAt: daysAgo(200),
    },
    {
      id: 'book-seed-007', userId: DEFAULT_USER_ID,
      title: 'Tetangga Masa Gitu', author: 'Eliza V. Handayani', isbn: '9789791269474',
      publisher: 'Gramedia Pustaka Utama', publicationYear: 2012, edition: 'Cetakan pertama', language: 'Indonesia',
      categoryId: findCat('Komik'), description: 'Komik cerita silat Indonesia yang lucu tentang kehidupan tetangga sebelah.',
      pageCount: 176, coverImageUrl: null, condition: 'rusak', storageLocationId: findLoc('Kardus 1'),
      readingStatus: 'sudah_dibaca', ownershipStatus: 'hilang', rating: 3,
      notes: 'Sampulnya sudah robek. Katanya dipinjam sepupu dan tidak kembali.', acquiredDate: '2018-12-25',
      createdAt: daysAgo(150), updatedAt: daysAgo(150),
    },
    {
      id: 'book-seed-008', userId: DEFAULT_USER_ID,
      title: 'Filosofi Teras: Berpikir Sebagai Kebiasaan', author: 'Henry Manampiring', isbn: '9786020637174',
      publisher: 'Kompas', publicationYear: 2019, edition: 'Cetakan ke-2', language: 'Indonesia',
      categoryId: findCat('Nonfiksi'), description: 'Pengantar filsafat Stoa yang relevan dengan kehidupan modern.',
      pageCount: 312, coverImageUrl: null, condition: 'baru', storageLocationId: findLoc('Ruang tamu'),
      readingStatus: 'belum_dibaca', ownershipStatus: 'ingin_dijual', rating: null,
      notes: 'Rencana dijual di pasar loak.', acquiredDate: '2025-09-01',
      createdAt: daysAgo(20), updatedAt: daysAgo(20),
    },
  ]

  const loans: Loan[] = [
    {
      id: 'loan-seed-001', userId: DEFAULT_USER_ID, bookId: 'book-seed-006',
      borrowerName: 'Budi Santoso', borrowerContact: '081234567890',
      borrowedAt: isoDaysAgo(20), dueAt: isoDaysAgo(6), returnedAt: null,
      status: 'dipinjam', notes: 'Katanya dipakai untuk tugas kuliah sejarah.',
      createdAt: daysAgo(20), updatedAt: daysAgo(20),
    },
    {
      id: 'loan-seed-002', userId: DEFAULT_USER_ID, bookId: 'book-seed-001',
      borrowerName: 'Sinta Dewi', borrowerContact: '089876543210',
      borrowedAt: isoDaysAgo(45), dueAt: isoDaysAgo(15), returnedAt: isoDaysAgo(18),
      status: 'dikembalikan', notes: 'Dikembalikan dalam kondisi baik.',
      createdAt: daysAgo(45), updatedAt: daysAgo(18),
    },
  ]

  const readingLogs: ReadingLog[] = [
    { id: 'rl-seed-001', userId: DEFAULT_USER_ID, bookId: 'book-seed-001', status: 'sudah_dibaca', startedAt: isoDaysAgo(380), finishedAt: isoDaysAgo(360), notes: 'Selesai dibaca dalam 3 minggu.', createdAt: daysAgo(360) },
    { id: 'rl-seed-002', userId: DEFAULT_USER_ID, bookId: 'book-seed-002', status: 'sudah_dibaca', startedAt: isoDaysAgo(330), finishedAt: isoDaysAgo(300), notes: 'Selesai dibaca di akhir pekan.', createdAt: daysAgo(300) },
    { id: 'rl-seed-003', userId: DEFAULT_USER_ID, bookId: 'book-seed-003', status: 'sedang_dibaca', startedAt: isoDaysAgo(25), finishedAt: null, notes: 'Sedang bab habit stacking.', createdAt: daysAgo(25) },
    { id: 'rl-seed-004', userId: DEFAULT_USER_ID, bookId: 'book-seed-005', status: 'sedang_dibaca', startedAt: isoDaysAgo(90), finishedAt: null, notes: 'Dibaca saat butuh referensi kode.', createdAt: daysAgo(90) },
  ]

  write(STORAGE_KEYS.categories, categories)
  write(STORAGE_KEYS.locations, locations)
  write(STORAGE_KEYS.books, books)
  write(STORAGE_KEYS.loans, loans)
  write(STORAGE_KEYS.readingLogs, readingLogs)
  write(STORAGE_KEYS.seeded, true)
}

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

// ============================================================
// QUERY HELPERS
// ============================================================

type BookQuery = {
  search?: string
  categoryId?: string
  locationId?: string
  condition?: string
  readingStatus?: string
  ownershipStatus?: string
  sort?: string
  order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

function matchSearch(book: Book, search: string): boolean {
  const q = search.toLowerCase()
  return [book.title, book.author, book.isbn, book.notes, book.publisher, book.description]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(q))
}

function sortBooks(books: Book[], sort: string, order: 'asc' | 'desc'): Book[] {
  const dir = order === 'desc' ? -1 : 1
  return [...books].sort((a, b) => {
    let valA: string | number | null = null
    let valB: string | number | null = null

    switch (sort) {
      case 'title':
        valA = a.title?.toLowerCase() ?? ''
        valB = b.title?.toLowerCase() ?? ''
        break
      case 'author':
        valA = a.author?.toLowerCase() ?? ''
        valB = b.author?.toLowerCase() ?? ''
        break
      case 'publication_year':
        valA = a.publicationYear ?? 0
        valB = b.publicationYear ?? 0
        break
      case 'rating':
        valA = a.rating ?? 0
        valB = b.rating ?? 0
        break
      case 'created_at':
      default:
        valA = a.createdAt
        valB = b.createdAt
        break
    }

    if (valA === valB) return 0
    if (valA === null || valA === undefined) return 1
    if (valB === null || valB === undefined) return -1
    return valA > valB ? dir : -dir
  })
}

function computeLoanStatus(loan: Loan): Loan {
  if (loan.status === 'dikembalikan') return loan
  if (loan.dueAt && isOverdue(loan.dueAt)) {
    return loan.status === 'terlambat' ? loan : { ...loan, status: 'terlambat' }
  }
  return loan.status === 'dipinjam' ? loan : { ...loan, status: 'dipinjam' }
}

// ============================================================
// LOCAL REPOSITORY (mengikuti kontrak backend Neon)
// ============================================================

export const localRepository = {
  // ---------- Books ----------
  listBooks(query: BookQuery = {}): PaginatedResponse<Book> {
    seedIfNeeded()
    const all = read<Book[]>(STORAGE_KEYS.books, [])
    const search = query.search?.trim() ?? ''

    let filtered = all.filter((book) => {
      if (search && !matchSearch(book, search)) return false
      if (query.categoryId && book.categoryId !== query.categoryId) return false
      if (query.locationId && book.storageLocationId !== query.locationId) return false
      if (query.condition && book.condition !== query.condition) return false
      if (query.readingStatus && book.readingStatus !== query.readingStatus) return false
      if (query.ownershipStatus && book.ownershipStatus !== query.ownershipStatus) return false
      return true
    })

    filtered = sortBooks(filtered, query.sort ?? 'created_at', query.order ?? 'desc')

    const limit = query.limit ?? 12
    const page = Math.max(1, query.page ?? 1)
    const total = filtered.length
    const start = (page - 1) * limit
    const data = filtered.slice(start, start + limit)

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    }
  },

  listAllBooks(): Book[] {
    seedIfNeeded()
    return read<Book[]>(STORAGE_KEYS.books, [])
  },

  getBook(id: string): Book | null {
    seedIfNeeded()
    return read<Book[]>(STORAGE_KEYS.books, []).find((b) => b.id === id) ?? null
  },

  createBook(input: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Book {
    seedIfNeeded()
    const books = read<Book[]>(STORAGE_KEYS.books, [])
    const now = new Date().toISOString()
    const book: Book = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    books.push(book)
    write(STORAGE_KEYS.books, books)
    return book
  },

  updateBook(id: string, input: Partial<Book>): Book | null {
    const books = read<Book[]>(STORAGE_KEYS.books, [])
    const index = books.findIndex((b) => b.id === id)
    if (index === -1) return null
    const updated: Book = {
      ...books[index],
      ...input,
      id,
      updatedAt: new Date().toISOString(),
    }
    books[index] = updated
    write(STORAGE_KEYS.books, books)
    return updated
  },

  deleteBook(id: string): boolean {
    const books = read<Book[]>(STORAGE_KEYS.books, [])
    const filtered = books.filter((b) => b.id !== id)
    write(STORAGE_KEYS.books, filtered)
    // Hapus data terkait
    write(STORAGE_KEYS.loans, read<Loan[]>(STORAGE_KEYS.loans, []).filter((l) => l.bookId !== id))
    write(
      STORAGE_KEYS.readingLogs,
      read<ReadingLog[]>(STORAGE_KEYS.readingLogs, []).filter((l) => l.bookId !== id)
    )
    return filtered.length === books.length - 1
  },

  bulkCreateBooks(items: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>[]): number {
    const books = read<Book[]>(STORAGE_KEYS.books, [])
    const now = new Date().toISOString()
    const existingIsbns = new Set(books.map((b) => b.isbn).filter(Boolean))
    let inserted = 0

    items.forEach((item) => {
      if (item.isbn && existingIsbns.has(item.isbn)) return
      books.push({ ...item, id: generateId(), createdAt: now, updatedAt: now })
      if (item.isbn) existingIsbns.add(item.isbn)
      inserted += 1
    })

    write(STORAGE_KEYS.books, books)
    return inserted
  },

  // ---------- Categories ----------
  listCategories(): Category[] {
    seedIfNeeded()
    const categories = read<Category[]>(STORAGE_KEYS.categories, [])
    const books = read<Book[]>(STORAGE_KEYS.books, [])
    return categories.map((c) => ({
      ...c,
      bookCount: books.filter((b) => b.categoryId === c.id).length,
    }))
  },

  createCategory(input: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category {
    const categories = read<Category[]>(STORAGE_KEYS.categories, [])
    const now = new Date().toISOString()
    const category: Category = { ...input, id: generateId(), createdAt: now, updatedAt: now }
    categories.push(category)
    write(STORAGE_KEYS.categories, categories)
    return category
  },

  updateCategory(id: string, input: Partial<Category>): Category | null {
    const categories = read<Category[]>(STORAGE_KEYS.categories, [])
    const index = categories.findIndex((c) => c.id === id)
    if (index === -1) return null
    const updated = { ...categories[index], ...input, id, updatedAt: new Date().toISOString() }
    categories[index] = updated
    write(STORAGE_KEYS.categories, categories)
    return updated
  },

  deleteCategory(id: string): boolean {
    // Hapus hanya jika tidak sedang digunakan
    const used = read<Book[]>(STORAGE_KEYS.books, []).some((b) => b.categoryId === id)
    if (used) return false
    const categories = read<Category[]>(STORAGE_KEYS.categories, [])
    const filtered = categories.filter((c) => c.id !== id)
    write(STORAGE_KEYS.categories, filtered)
    return filtered.length === categories.length - 1
  },

  // ---------- Storage locations ----------
  listLocations(): StorageLocation[] {
    seedIfNeeded()
    const locations = read<StorageLocation[]>(STORAGE_KEYS.locations, [])
    const books = read<Book[]>(STORAGE_KEYS.books, [])
    return locations.map((l) => ({
      ...l,
      bookCount: books.filter((b) => b.storageLocationId === l.id).length,
    }))
  },

  createLocation(input: Omit<StorageLocation, 'id' | 'createdAt' | 'updatedAt'>): StorageLocation {
    const locations = read<StorageLocation[]>(STORAGE_KEYS.locations, [])
    const now = new Date().toISOString()
    const location: StorageLocation = { ...input, id: generateId(), createdAt: now, updatedAt: now }
    locations.push(location)
    write(STORAGE_KEYS.locations, locations)
    return location
  },

  updateLocation(id: string, input: Partial<StorageLocation>): StorageLocation | null {
    const locations = read<StorageLocation[]>(STORAGE_KEYS.locations, [])
    const index = locations.findIndex((l) => l.id === id)
    if (index === -1) return null
    const updated = { ...locations[index], ...input, id, updatedAt: new Date().toISOString() }
    locations[index] = updated
    write(STORAGE_KEYS.locations, locations)
    return updated
  },

  deleteLocation(id: string): boolean {
    const used = read<Book[]>(STORAGE_KEYS.books, []).some((b) => b.storageLocationId === id)
    if (used) return false
    const locations = read<StorageLocation[]>(STORAGE_KEYS.locations, [])
    const filtered = locations.filter((l) => l.id !== id)
    write(STORAGE_KEYS.locations, filtered)
    return filtered.length === locations.length - 1
  },

  // ---------- Loans ----------
  listLoans(status?: string): Loan[] {
    seedIfNeeded()
    const loans = read<Loan[]>(STORAGE_KEYS.loans, [])
    const books = read<Book[]>(STORAGE_KEYS.books, [])
    const enriched = loans.map((loan) => {
      const computed = computeLoanStatus(loan)
      return { ...computed, book: books.find((b) => b.id === loan.bookId) ?? null }
    })
    if (status && status !== 'all') {
      return enriched.filter((l) => l.status === status)
    }
    return enriched.sort((a, b) => (b.borrowedAt > a.borrowedAt ? 1 : -1))
  },

  getLoan(id: string): Loan | null {
    return read<Loan[]>(STORAGE_KEYS.loans, []).find((l) => l.id === id) ?? null
  },

  createLoan(input: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>): Loan {
    const loans = read<Loan[]>(STORAGE_KEYS.loans, [])
    const now = new Date().toISOString()
    const loan: Loan = { ...input, id: generateId(), createdAt: now, updatedAt: now }
    loans.push(loan)
    write(STORAGE_KEYS.loans, loans)
    // Update status kepemilikan buku
    if (loan.status !== 'dikembalikan') {
      this.updateBook(loan.bookId, { ownershipStatus: 'dipinjamkan' })
    }
    return loan
  },

  updateLoan(id: string, input: Partial<Loan>): Loan | null {
    const loans = read<Loan[]>(STORAGE_KEYS.loans, [])
    const index = loans.findIndex((l) => l.id === id)
    if (index === -1) return null
    const updated: Loan = { ...loans[index], ...input, id, updatedAt: new Date().toISOString() }
    loans[index] = updated
    write(STORAGE_KEYS.loans, loans)
    if (updated.status === 'dikembalikan') {
      this.updateBook(updated.bookId, { ownershipStatus: 'dimiliki' })
    }
    return updated
  },

  deleteLoan(id: string): boolean {
    const loans = read<Loan[]>(STORAGE_KEYS.loans, [])
    const filtered = loans.filter((l) => l.id !== id)
    write(STORAGE_KEYS.loans, filtered)
    return filtered.length === loans.length - 1
  },

  // ---------- Reading logs ----------
  listReadingLogs(bookId?: string): ReadingLog[] {
    seedIfNeeded()
    const logs = read<ReadingLog[]>(STORAGE_KEYS.readingLogs, [])
    const books = read<Book[]>(STORAGE_KEYS.books, [])
    const enriched = logs.map((log) => ({
      ...log,
      book: books.find((b) => b.id === log.bookId) ?? null,
    }))
    if (bookId) return enriched.filter((l) => l.bookId === bookId)
    return enriched.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
  },

  createReadingLog(input: Omit<ReadingLog, 'id' | 'createdAt'>): ReadingLog {
    const logs = read<ReadingLog[]>(STORAGE_KEYS.readingLogs, [])
    const log: ReadingLog = { ...input, id: generateId(), createdAt: new Date().toISOString() }
    logs.push(log)
    write(STORAGE_KEYS.readingLogs, logs)
    return log
  },

  // ---------- Statistics ----------
  getDashboardStats(): DashboardStats {
    seedIfNeeded()
    const books = read<Book[]>(STORAGE_KEYS.books, [])
    const loans = read<Loan[]>(STORAGE_KEYS.loans, [])
    const categories = read<Category[]>(STORAGE_KEYS.categories, [])
    const locations = read<StorageLocation[]>(STORAGE_KEYS.locations, [])

    const ratings = books.map((b) => b.rating ?? 0)
    const sum = ratings.reduce((acc, r) => acc + r, 0)

    const overdue = loans
      .map(computeLoanStatus)
      .filter((l) => l.status === 'terlambat').length

    return {
      totalBooks: books.length,
      readBooks: books.filter((b) => b.readingStatus === 'sudah_dibaca').length,
      unreadBooks: books.filter((b) => b.readingStatus === 'belum_dibaca').length,
      currentlyReading: books.filter((b) => b.readingStatus === 'sedang_dibaca').length,
      borrowedBooks: loans
        .map(computeLoanStatus)
        .filter((l) => l.status !== 'dikembalikan').length,
      totalCategories: categories.length,
      totalLocations: locations.length,
      averageRating: ratings.length ? sum / ratings.length : 0,
      totalPages: books.reduce((acc, b) => acc + (b.pageCount ?? 0), 0),
      overdueLoans: overdue,
    }
  },

  getCollectionStats(): CollectionStats {
    seedIfNeeded()
    const books = read<Book[]>(STORAGE_KEYS.books, [])
    const categories = read<Category[]>(STORAGE_KEYS.categories, [])
    const locations = read<StorageLocation[]>(STORAGE_KEYS.locations, [])

    const byCategory: GroupCount[] = categories.map((c) => ({
      id: c.id,
      name: c.name,
      count: books.filter((b) => b.categoryId === c.id).length,
    }))
    const byLocation: GroupCount[] = locations.map((l) => ({
      id: l.id,
      name: l.name,
      count: books.filter((b) => b.storageLocationId === l.id).length,
    }))
    const conditionMap = new Map<string, number>()
    books.forEach((b) => {
      conditionMap.set(b.condition, (conditionMap.get(b.condition) ?? 0) + 1)
    })
    const byCondition: GroupCount[] = [...conditionMap.entries()].map(([cond, count]) => ({
      id: cond,
      name: cond,
      count,
    }))

    const yearMap = new Map<number, number>()
    books.forEach((b) => {
      if (b.publicationYear) yearMap.set(b.publicationYear, (yearMap.get(b.publicationYear) ?? 0) + 1)
    })
    const byYear: YearCount[] = [...yearMap.entries()]
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year)

    // Perkembangan berdasarkan bulan dari created_at
    const monthMap = new Map<string, number>()
    books.forEach((b) => {
      const d = new Date(b.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthMap.set(key, (monthMap.get(key) ?? 0) + 1)
    })
    const byMonth = [...monthMap.entries()]
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, count]) => ({ date, count }))

    const ratings = books.map((b) => b.rating ?? 0)

    return {
      totalBooks: books.length,
      readBooks: books.filter((b) => b.readingStatus === 'sudah_dibaca').length,
      unreadBooks: books.filter((b) => b.readingStatus === 'belum_dibaca').length,
      currentlyReading: books.filter((b) => b.readingStatus === 'sedang_dibaca').length,
      borrowedBooks: books.filter((b) => b.ownershipStatus === 'dipinjamkan').length,
      averageRating: ratings.length ? ratings.reduce((a, r) => a + r, 0) / ratings.length : 0,
      byCategory,
      byLocation,
      byCondition,
      byYear,
      byMonth,
    }
  },

  /** Reset semua data lokal kembali ke data awal */
  resetToSeed(): void {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
    seedIfNeeded()
  },

  /** Hapus semua data lokal */
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
  },
}

export type LocalRepository = typeof localRepository
