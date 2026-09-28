// ============================================================
// Tipe data utama aplikasi Katalog Pribadiku
// ============================================================

/** Status membaca */
export type ReadingStatus =
  | 'belum_dibaca'
  | 'sedang_dibaca'
  | 'sudah_dibaca'
  | 'tidak_ingin_dibaca'

/** Status kepemilikan */
export type OwnershipStatus =
  | 'dimiliki'
  | 'dipinjamkan'
  | 'hilang'
  | 'ingin_dijual'
  | 'rusak'

/** Kondisi buku */
export type BookCondition = 'baru' | 'sangat_baik' | 'baik' | 'cukup' | 'rusak'

/** Status peminjaman */
export type LoanStatus = 'dipinjam' | 'dikembalikan' | 'terlambat'

/** Kategori */
export interface Category {
  id: string
  userId?: string | null
  name: string
  createdAt: string
  updatedAt: string
  /** Jumlah buku pada kategori ini (hasil agregasi, opsional) */
  bookCount?: number
}

/** Lokasi penyimpanan */
export interface StorageLocation {
  id: string
  userId?: string | null
  name: string
  description?: string | null
  createdAt: string
  updatedAt: string
  /** Jumlah buku pada lokasi ini (hasil agregasi, opsional) */
  bookCount?: number
}

/** Data inti sebuah buku */
export interface Book {
  id: string
  userId?: string | null
  title: string
  author?: string | null
  isbn?: string | null
  publisher?: string | null
  publicationYear?: number | null
  edition?: string | null
  language?: string | null
  categoryId?: string | null
  description?: string | null
  pageCount?: number | null
  coverImageUrl?: string | null
  condition: BookCondition
  storageLocationId?: string | null
  readingStatus: ReadingStatus
  ownershipStatus: OwnershipStatus
  rating?: number | null
  notes?: string | null
  acquiredDate?: string | null
  createdAt: string
  updatedAt: string
}

/** Buku lengkap dengan relasi yang sudah di-join */
export interface BookWithRelations extends Book {
  category?: Category | null
  storageLocation?: StorageLocation | null
  activeLoan?: Loan | null
}

/** Peminjaman */
export interface Loan {
  id: string
  userId?: string | null
  bookId: string
  borrowerName: string
  borrowerContact?: string | null
  borrowedAt: string
  dueAt?: string | null
  returnedAt?: string | null
  status: LoanStatus
  notes?: string | null
  createdAt: string
  updatedAt: string
  book?: Book | null
}

/** Riwayat status membaca */
export interface ReadingLog {
  id: string
  userId?: string | null
  bookId: string
  status: ReadingStatus
  startedAt?: string | null
  finishedAt?: string | null
  notes?: string | null
  createdAt: string
  book?: Book | null
}

// ============================================================
// Tipe untuk filter, sorting, dan pagination
// ============================================================

export type SortField =
  | 'title'
  | 'author'
  | 'publication_year'
  | 'created_at'
  | 'rating'

export type SortDirection = 'asc' | 'desc'

export type ViewMode = 'grid' | 'list'

export interface BookQuery {
  search?: string
  categoryId?: string
  locationId?: string
  condition?: BookCondition | string
  readingStatus?: ReadingStatus | string
  ownershipStatus?: OwnershipStatus | string
  sort?: SortField
  order?: SortDirection
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ============================================================
// Statistik
// ============================================================

export interface DashboardStats {
  totalBooks: number
  readBooks: number
  unreadBooks: number
  currentlyReading: number
  borrowedBooks: number
  totalCategories: number
  totalLocations: number
  averageRating: number
  totalPages: number
  overdueLoans: number
}

export interface GroupCount {
  id: string
  name: string
  count: number
}

export interface YearCount {
  year: number | string
  count: number
}

export interface DateCount {
  date: string
  count: number
}

export interface CollectionStats {
  totalBooks: number
  readBooks: number
  unreadBooks: number
  currentlyReading: number
  borrowedBooks: number
  averageRating: number
  byCategory: GroupCount[]
  byLocation: GroupCount[]
  byCondition: GroupCount[]
  byYear: YearCount[]
  byMonth: DateCount[]
}
