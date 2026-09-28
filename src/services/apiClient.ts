/**
 * Klien API untuk backend Express + Neon PostgreSQL.
 *
 * Strategi ketahanan (resilience):
 *  - Jika `VITE_API_URL` tidak diisi, default memakai "http://localhost:3001/api".
 *  - Setiap permintaan memiliki timeout. Jika server tidak dapat dijangkau
 *    (mis. belum dijalankan atau koneksi terputus), aplikasi otomatis
 *    beralih ke penyimpanan lokal (localStorage) sebagai cadangan, dan
 *    akan mencoba menyambung kembali ke server secara berkala.
 *  - Dengan ini aplikasi SELALU bisa dijalankan, bahkan tanpa konfigurasi
 *    database sama sekali.
 */
import type {
  Book,
  Category,
  CollectionStats,
  DashboardStats,
  Loan,
  PaginatedResponse,
  ReadingLog,
  StorageLocation,
} from '@/types'
import { localRepository } from './localRepository'

const DEFAULT_API_URL = 'http://localhost:3001/api'
const REQUEST_TIMEOUT_MS = 8000
const RETRY_INTERVAL_MS = 20000

export type BackendMode = 'remote' | 'local'

let currentMode: BackendMode | null = null
let lastCheck = 0
const listeners = new Set<(mode: BackendMode) => void>()

/** URL dasar API (dari environment variable) */
export function getApiUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL as string | undefined
  return (fromEnv && fromEnv.trim()) || DEFAULT_API_URL
}

/** Mode backend yang sedang aktif */
export function getBackendMode(): BackendMode {
  if (currentMode === null) return 'remote'
  return currentMode
}

/** Berlangganan perubahan mode backend (remote/local) */
export function onBackendModeChange(listener: (mode: BackendMode) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function setMode(mode: BackendMode): void {
  if (currentMode === mode) return
  currentMode = mode
  listeners.forEach((listener) => listener(mode))
}

/** Cek ketersediaan server backend */
export async function checkBackendAvailability(): Promise<BackendMode> {
  const now = Date.now()
  if (currentMode === 'local' && now - lastCheck < RETRY_INTERVAL_MS) {
    return 'local'
  }
  lastCheck = now
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const response = await fetch(`${getApiUrl()}/health`, {
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (response.ok) {
      setMode('remote')
      return 'remote'
    }
    setMode('local')
    return 'local'
  } catch {
    setMode('local')
    return 'local'
  }
}

class ApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

/** Permintaan HTTP dengan timeout + fallback otomatis ke penyimpanan lokal */
async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  localFallback: () => T
): Promise<T> {
  const mode = await checkBackendAvailability()

  if (mode === 'local') {
    return localFallback()
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const response = await fetch(`${getApiUrl()}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      let message = `Permintaan gagal (HTTP ${response.status})`
      try {
        const error = await response.json()
        message = error?.message ?? error?.error ?? message
      } catch {
        // Respons non-JSON
      }
      throw new ApiError(message, response.status)
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      throw new ApiError('Format respons server tidak valid.')
    }

    return (await response.json()) as T
  } catch (error) {
    // Jaringan gagal -> fallback ke lokal
    if (error instanceof ApiError && (error.statusCode ?? 0) >= 400 && (error.statusCode ?? 0) < 500) {
      throw error
    }
    setMode('local')
    return localFallback()
  }
}

// ============================================================
// ENDPOINT
// ============================================================

export interface BookListParams {
  search?: string
  categoryId?: string
  locationId?: string
  condition?: string
  readingStatus?: string
  ownershipStatus?: string
  sort?: string
  order?: 'asc' | 'desc' | string
  page?: number
  limit?: number
}

function buildQuery(params?: BookListParams): string {
  if (!params) return ''
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value))
    }
  })
  const result = query.toString()
  return result ? `?${result}` : ''
}

function toSnakeCase(input: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {}
  Object.entries(input).forEach(([key, value]) => {
    const snake = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    output[snake] = value
  })
  return output
}

function toCamelCase(input: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {}
  Object.entries(input).forEach(([key, value]) => {
    const camel = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    output[camel] = value
  })
  return output
}

export const apiClient = {
  // ---------- Books ----------
  listBooks(params?: BookListParams): Promise<PaginatedResponse<Book>> {
    return apiRequest(
      `/books${buildQuery(params)}`,
      { method: 'GET' },
      () =>
        localRepository.listBooks({
          ...params,
          order: (params?.order === 'asc' || params?.order === 'desc' ? params.order : undefined) as
            | 'asc'
            | 'desc'
            | undefined,
        })
    )
  },

  listAllBooks(): Promise<Book[]> {
    return apiRequest(`/books/all`, { method: 'GET' }, () => localRepository.listAllBooks())
  },

  getBook(id: string): Promise<Book | null> {
    return apiRequest(`/books/${id}`, { method: 'GET' }, () => localRepository.getBook(id))
  },

  createBook(input: Partial<Book>): Promise<Book> {
    return apiRequest(
      `/books`,
      {
        method: 'POST',
        body: JSON.stringify(toSnakeCase(input)),
      },
      () => localRepository.createBook(input as Omit<Book, 'id' | 'createdAt' | 'updatedAt'>)
    )
  },

  updateBook(id: string, input: Partial<Book>): Promise<Book | null> {
    return apiRequest(
      `/books/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(toSnakeCase(input)),
      },
      () => localRepository.updateBook(id, input)
    )
  },

  deleteBook(id: string): Promise<boolean> {
    return apiRequest(`/books/${id}`, { method: 'DELETE' }, () => localRepository.deleteBook(id))
  },

  bulkCreateBooks(items: Partial<Book>[]): Promise<{ inserted: number }> {
    return apiRequest(
      `/books/bulk`,
      {
        method: 'POST',
        body: JSON.stringify(items.map((item) => toSnakeCase(item))),
      },
      () => ({
        inserted: localRepository.bulkCreateBooks(
          items as Omit<Book, 'id' | 'createdAt' | 'updatedAt'>[]
        ),
      })
    )
  },

  // ---------- Categories ----------
  listCategories(): Promise<Category[]> {
    return apiRequest(`/categories`, { method: 'GET' }, () => localRepository.listCategories())
  },

  createCategory(input: Partial<Category>): Promise<Category> {
    return apiRequest(
      `/categories`,
      {
        method: 'POST',
        body: JSON.stringify(toSnakeCase(input)),
      },
      () => localRepository.createCategory(input as Omit<Category, 'id' | 'createdAt' | 'updatedAt'>)
    )
  },

  updateCategory(id: string, input: Partial<Category>): Promise<Category | null> {
    return apiRequest(
      `/categories/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(toSnakeCase(input)),
      },
      () => localRepository.updateCategory(id, input)
    )
  },

  deleteCategory(id: string): Promise<boolean> {
    return apiRequest(`/categories/${id}`, { method: 'DELETE' }, () => localRepository.deleteCategory(id))
  },

  // ---------- Storage locations ----------
  listLocations(): Promise<StorageLocation[]> {
    return apiRequest(`/locations`, { method: 'GET' }, () => localRepository.listLocations())
  },

  createLocation(input: Partial<StorageLocation>): Promise<StorageLocation> {
    return apiRequest(
      `/locations`,
      {
        method: 'POST',
        body: JSON.stringify(toSnakeCase(input)),
      },
      () =>
        localRepository.createLocation(input as Omit<StorageLocation, 'id' | 'createdAt' | 'updatedAt'>)
    )
  },

  updateLocation(id: string, input: Partial<StorageLocation>): Promise<StorageLocation | null> {
    return apiRequest(
      `/locations/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(toSnakeCase(input)),
      },
      () => localRepository.updateLocation(id, input)
    )
  },

  deleteLocation(id: string): Promise<boolean> {
    return apiRequest(`/locations/${id}`, { method: 'DELETE' }, () => localRepository.deleteLocation(id))
  },

  // ---------- Loans ----------
  listLoans(status?: string): Promise<Loan[]> {
    return apiRequest(
      `/loans${status ? `?status=${encodeURIComponent(status)}` : ''}`,
      { method: 'GET' },
      () => localRepository.listLoans(status)
    )
  },

  createLoan(input: Partial<Loan>): Promise<Loan> {
    return apiRequest(
      `/loans`,
      {
        method: 'POST',
        body: JSON.stringify(toSnakeCase(input)),
      },
      () => localRepository.createLoan(input as Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>)
    )
  },

  updateLoan(id: string, input: Partial<Loan>): Promise<Loan | null> {
    return apiRequest(
      `/loans/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(toSnakeCase(input)),
      },
      () => localRepository.updateLoan(id, input)
    )
  },

  deleteLoan(id: string): Promise<boolean> {
    return apiRequest(`/loans/${id}`, { method: 'DELETE' }, () => localRepository.deleteLoan(id))
  },

  // ---------- Reading logs ----------
  listReadingLogs(bookId?: string): Promise<ReadingLog[]> {
    return apiRequest(
      `/reading-logs${bookId ? `?bookId=${encodeURIComponent(bookId)}` : ''}`,
      { method: 'GET' },
      () => localRepository.listReadingLogs(bookId)
    )
  },

  createReadingLog(input: Partial<ReadingLog>): Promise<ReadingLog> {
    return apiRequest(
      `/reading-logs`,
      {
        method: 'POST',
        body: JSON.stringify(toSnakeCase(input)),
      },
      () => localRepository.createReadingLog(input as Omit<ReadingLog, 'id' | 'createdAt'>)
    )
  },

  // ---------- Statistics ----------
  getDashboardStats(): Promise<DashboardStats> {
    return apiRequest(`/stats/dashboard`, { method: 'GET' }, () => localRepository.getDashboardStats())
  },

  getCollectionStats(): Promise<CollectionStats> {
    return apiRequest(`/stats/collection`, { method: 'GET' }, () => localRepository.getCollectionStats())
  },

  // ---------- Lookup info buku dari ISBN (API publik) ----------
  async lookupIsbn(isbn: string): Promise<Partial<Book> | null> {
    const clean = isbn.replace(/[-\s]/g, '')
    if (!/^\d{10,13}$/.test(clean)) {
      throw new Error('Format ISBN tidak valid. Gunakan 10 atau 13 digit angka.')
    }
    try {
      const response = await fetch(
        `https://openlibrary.org/isbn/${encodeURIComponent(clean)}.json`
      )
      if (!response.ok) return null
      const data = await response.json()
      const authors = await Promise.all(
        (data.authors ?? []).slice(0, 3).map(async (ref: { key: string }) => {
          try {
            const authorRes = await fetch(`https://openlibrary.org${ref.key}.json`)
            if (!authorRes.ok) return null
            return (await authorRes.json()).name
          } catch {
            return null
          }
        })
      )
      return {
        title: data.title ?? '',
        author: authors.filter(Boolean).join(', ') || undefined,
        publisher: data.publishers?.[0] ?? undefined,
        publicationYear: data.publish_date ? Number(String(data.publish_date).slice(-4)) : undefined,
        pageCount: data.number_of_pages ?? undefined,
        isbn: clean,
        language: data.languages?.[0]?.key?.replace('/languages/', '') ?? undefined,
        description:
          typeof data.description === 'string' ? data.description : data.description?.value ?? undefined,
        coverImageUrl: data.covers?.[0]
          ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
          : undefined,
      }
    } catch {
      return null
    }
  },

  /** Ekspos repository lokal untuk fitur backup/restore */
  local: localRepository,
}

export { toCamelCase, toSnakeCase }
