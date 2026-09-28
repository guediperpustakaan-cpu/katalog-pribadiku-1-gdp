import type { Book } from '@/types'
import {
  getConditionLabel,
  getOwnershipStatusLabel,
  getReadingStatusLabel,
} from '@/constants'

/**
 * Utilitas terkait CSV: ekspor, impor, parsing, dan validasi.
 * Memakai RFC 4180 style escaping (kutip ganda untuk nilai yang mengandung koma/tanda kutip).
 */

/** Nama kolom (header) untuk template CSV dalam bahasa Indonesia */
export const CSV_HEADERS = [
  'Judul',
  'Penulis',
  'ISBN',
  'Penerbit',
  'Tahun Terbit',
  'Edisi',
  'Bahasa',
  'Kategori',
  'Deskripsi',
  'Jumlah Halaman',
  'Kondisi',
  'Lokasi Penyimpanan',
  'Status Membaca',
  'Status Kepemilikan',
  'Rating',
  'Catatan',
  'Tanggal Diperoleh',
] as const

/** Pemetaan label CSV -> nama field internal */
export const CSV_FIELD_MAP: Record<string, keyof Book> = {
  'Judul': 'title',
  'Penulis': 'author',
  'ISBN': 'isbn',
  'Penerbit': 'publisher',
  'Tahun Terbit': 'publicationYear',
  'Edisi': 'edition',
  'Bahasa': 'language',
  'Kategori': 'categoryId',
  'Deskripsi': 'description',
  'Jumlah Halaman': 'pageCount',
  'Kondisi': 'condition',
  'Lokasi Penyimpanan': 'storageLocationId',
  'Status Membaca': 'readingStatus',
  'Status Kepemilikan': 'ownershipStatus',
  'Rating': 'rating',
  'Catatan': 'notes',
  'Tanggal Diperoleh': 'acquiredDate',
}

/** Buat satu baris CSV yang sudah di-escape dengan benar */
function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/** Parse satu baris CSV mentah menjadi array nilai (mendukung kutipan & escape) */
export function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      current += char
      i++
      continue
    }
    if (char === '"') {
      inQuotes = true
      i++
      continue
    }
    if (char === ',') {
      result.push(current.trim())
      current = ''
      i++
      continue
    }
    current += char
    i++
  }
  result.push(current.trim())
  return result
}

/** Pisahkan teks CSV menjadi array baris (mendukung quoted multiline) */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let current: string[] = []
  let cell = ''
  let inQuotes = false
  let i = 0

  while (i < text.length) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      cell += char
      i++
      continue
    }
    if (char === '"') {
      inQuotes = true
      i++
      continue
    }
    if (char === ',') {
      current.push(cell.trim())
      cell = ''
      i++
      continue
    }
    if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      current.push(cell.trim())
      cell = ''
      if (current.some((c) => c !== '')) rows.push(current)
      current = []
      i++
      continue
    }
    cell += char
    i++
  }
  if (cell !== '' || current.length > 0) {
    current.push(cell.trim())
    if (current.some((c) => c !== '')) rows.push(current)
  }
  return rows
}

/** Hasil validasi satu baris import */
export interface CsvRowResult {
  rowIndex: number
  data: Record<string, string>
  errors: string[]
  isValid: boolean
}

/**
 * Validasi hasil parse CSV menjadi data buku yang siap disimpan.
 * Baris yang error tidak akan menggagalkan baris lainnya.
 */
export function validateCsvRows(
  rows: string[][],
  options?: {
    existingIsbns?: Set<string>
    categories?: { id: string; name: string }[]
    locations?: { id: string; name: string }[]
  }
): CsvRowResult[] {
  if (rows.length === 0) return []

  const headerRow = rows[0].map((h) => h.trim())
  const dataRows = rows.slice(1)

  // Validasi header: "Judul" wajib ada
  const hasTitleHeader = headerRow.some(
    (h) => CSV_FIELD_MAP[h] === 'title' || h.toLowerCase() === 'judul'
  )
  if (!hasTitleHeader) {
    return dataRows.map((_, idx) => ({
      rowIndex: idx + 2,
      data: {},
      isValid: false,
      errors: ['Baris judul (header) tidak ditemukan. Pastikan ada kolom "Judul".'],
    }))
  }

  const { existingIsbns = new Set<string>() } = options ?? {}

  return dataRows.map((cells, idx) => {
    const data: Record<string, string> = {}
    const errors: string[] = []

    headerRow.forEach((header, colIdx) => {
      const field = CSV_FIELD_MAP[header]
      if (field) data[field] = cells[colIdx] ?? ''
    })

    // --- Validasi kolom wajib ---
    if (!data.title || data.title.trim() === '') {
      errors.push('Judul wajib diisi.')
    }

    // --- Validasi ISBN (harus 10 atau 13 digit jika diisi) ---
    const rawIsbn = (data.isbn ?? '').replace(/[-\s]/g, '')
    if (rawIsbn && !/^\d{10,13}$/.test(rawIsbn)) {
      errors.push(`Format ISBN tidak valid: "${data.isbn}". ISBN harus 10 atau 13 digit.`)
    }
    if (rawIsbn && existingIsbns.has(rawIsbn)) {
      errors.push(`Buku dengan ISBN ${rawIsbn} sudah ada di koleksi (duplikat).`)
    }

    // --- Validasi tahun terbit ---
    const year = Number(data.publicationYear)
    if (data.publicationYear && (Number.isNaN(year) || year < 1400 || year > new Date().getFullYear() + 1)) {
      errors.push(`Tahun terbit tidak valid: "${data.publicationYear}".`)
    }

    // --- Validasi jumlah halaman ---
    const pages = Number(data.pageCount)
    if (data.pageCount && (Number.isNaN(pages) || pages < 0)) {
      errors.push(`Jumlah halaman tidak valid: "${data.pageCount}".`)
    }

    // --- Validasi rating ---
    const rating = Number(data.rating)
    if (data.rating && (Number.isNaN(rating) || rating < 0 || rating > 5)) {
      errors.push(`Rating tidak valid: "${data.rating}". Rating harus antara 0 sampai 5.`)
    }

    // --- Validasi nilai status/kondisi ---
    const validConditions = ['baru', 'sangat_baik', 'baik', 'cukup', 'rusak', 'Baru', 'Sangat baik', 'Baik', 'Cukup', 'Rusak']
    if (data.condition && !validConditions.includes(data.condition)) {
      errors.push(`Kondisi tidak dikenal: "${data.condition}". Gunakan: Baru, Sangat baik, Baik, Cukup, atau Rusak.`)
    }
    const validReading = ['belum_dibaca', 'sedang_dibaca', 'sudah_dibaca', 'tidak_ingin_dibaca',
      'Belum dibaca', 'Sedang dibaca', 'Sudah dibaca', 'Tidak ingin dibaca']
    if (data.readingStatus && !validReading.includes(data.readingStatus)) {
      errors.push(`Status membaca tidak dikenal: "${data.readingStatus}".`)
    }
    const validOwnership = ['dimiliki', 'dipinjamkan', 'hilang', 'ingin_dijual', 'rusak',
      'Dimiliki', 'Dipinjamkan', 'Hilang', 'Ingin dijual', 'Rusak']
    if (data.ownershipStatus && !validOwnership.includes(data.ownershipStatus)) {
      errors.push(`Status kepemilikan tidak dikenal: "${data.ownershipStatus}".`)
    }

    return {
      rowIndex: idx + 2,
      data,
      errors,
      isValid: errors.length === 0,
    }
  })
}

/** Normalisasi label CSV (bahasa Indonesia) menjadi nilai enum internal */
export function normalizeCsvValue(_field: string, value: string): string {
  if (!value) return ''
  const labelToEnum: Record<string, string> = {
    'Baru': 'baru',
    'Sangat baik': 'sangat_baik',
    'Baik': 'baik',
    'Cukup': 'cukup',
    'Rusak': 'rusak',
    'Belum dibaca': 'belum_dibaca',
    'Sedang dibaca': 'sedang_dibaca',
    'Sudah dibaca': 'sudah_dibaca',
    'Tidak ingin dibaca': 'tidak_ingin_dibaca',
    'Dimiliki': 'dimiliki',
    'Dipinjamkan': 'dipinjamkan',
    'Hilang': 'hilang',
    'Ingin dijual': 'ingin_dijual',
  }
  return labelToEnum[value] ?? value
}

/**
 * Konversi daftar buku menjadi teks CSV yang siap diunduh.
 */
export function booksToCsv(
  books: Book[],
  getCategoryName: (id?: string | null) => string,
  getLocationName: (id?: string | null) => string
): string {
  const header = CSV_HEADERS.map(escapeCsvCell).join(',')
  const rows = books.map((book) =>
    [
      book.title,
      book.author ?? '',
      book.isbn ?? '',
      book.publisher ?? '',
      book.publicationYear ?? '',
      book.edition ?? '',
      book.language ?? '',
      getCategoryName(book.categoryId),
      book.description ?? '',
      book.pageCount ?? '',
      getConditionLabel(book.condition),
      getLocationName(book.storageLocationId),
      getReadingStatusLabel(book.readingStatus),
      getOwnershipStatusLabel(book.ownershipStatus),
      book.rating ?? '',
      book.notes ?? '',
      book.acquiredDate ?? '',
    ]
      .map(escapeCsvCell)
      .join(',')
  )
  return [header, ...rows].join('\r\n')
}

/** Isi template CSV contoh untuk diunduh pengguna */
export function getCsvTemplate(): string {
  const sampleRow = [
    'Contoh Judul Buku',
    'Nama Penulis',
    '9786020324812',
    'Penerbit Contoh',
    '2024',
    'Edisi Pertama',
    'Indonesia',
    'Fiksi',
    'Deskripsi singkat tentang buku ini.',
    '320',
    'Baik',
    'Rak A',
    'Belum dibaca',
    'Dimiliki',
    '4',
    'Catatan pribadi tentang buku ini.',
    '2026-09-21',
  ]
  return [CSV_HEADERS.map(escapeCsvCell).join(','), sampleRow.map(escapeCsvCell).join(',')].join('\r\n')
}

/** Tambahkan BOM agar Excel membaca UTF-8 dengan benar */
export function addBom(csv: string): string {
  return `\uFEFF${csv}`
}

/** Memicu unduhan file dari browser */
export function downloadFile(content: string, filename: string, mimeType = 'text/csv;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
