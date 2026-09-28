import { z } from 'zod'
import {
  CONDITION_OPTIONS,
  OWNERSHIP_STATUS_OPTIONS,
  READING_STATUS_OPTIONS,
} from '@/constants'
import type {
  BookCondition,
  OwnershipStatus,
  ReadingStatus,
} from '@/types'

/**
 * Skema validasi formulir buku menggunakan Zod.
 * Semua pesan error menggunakan bahasa Indonesia.
 */

const currentYear = new Date().getFullYear()

export const bookFormSchema = z.object({
  title: z
    .string({ required_error: 'Judul buku wajib diisi.' })
    .trim()
    .min(1, 'Judul buku wajib diisi.')
    .max(300, 'Judul buku terlalu panjang (maksimal 300 karakter).'),

  author: z
    .string()
    .trim()
    .max(200, 'Nama penulis terlalu panjang (maksimal 200 karakter).')
    .optional()
    .or(z.literal('')),

  isbn: z
    .string()
    .trim()
    .max(20, 'ISBN terlalu panjang (maksimal 20 karakter).')
    .refine(
      (value) => {
        if (!value) return true
        const digits = value.replace(/[-\s]/g, '')
        return /^\d{10,13}$/.test(digits)
      },
      'Format ISBN tidak valid. Gunakan 10 atau 13 digit angka.'
    )
    .optional()
    .or(z.literal('')),

  publisher: z
    .string()
    .trim()
    .max(200, 'Nama penerbit terlalu panjang.')
    .optional()
    .or(z.literal('')),

  publicationYear: z
    .number({ invalid_type_error: 'Tahun terbit harus berupa angka.' })
    .int('Tahun terbit harus berupa angka bulat.')
    .min(1400, `Tahun terbit minimal 1400.`)
    .max(currentYear + 1, `Tahun terbit maksimal ${currentYear + 1}.`)
    .optional()
    .or(z.nan())
    .nullable(),

  edition: z
    .string()
    .trim()
    .max(100, 'Edisi terlalu panjang.')
    .optional()
    .or(z.literal('')),

  language: z
    .string()
    .trim()
    .max(50, 'Bahasa terlalu panjang.')
    .optional()
    .or(z.literal('')),

  categoryId: z
    .string()
    .uuid('Kategori tidak valid. Silakan pilih dari daftar.')
    .optional()
    .or(z.literal(''))
    .nullable(),

  description: z
    .string()
    .trim()
    .max(5000, 'Deskripsi terlalu panjang (maksimal 5000 karakter).')
    .optional()
    .or(z.literal('')),

  pageCount: z
    .number({ invalid_type_error: 'Jumlah halaman harus berupa angka.' })
    .int('Jumlah halaman harus berupa angka bulat.')
    .min(0, 'Jumlah halaman tidak boleh negatif.')
    .max(100000, 'Jumlah halaman terlalu besar.')
    .optional()
    .or(z.nan())
    .nullable(),

  coverImageUrl: z
    .string()
    .max(2000000, 'Ukuran foto sampul terlalu besar.')
    .optional()
    .or(z.literal(''))
    .nullable(),

  condition: z.enum(
    CONDITION_OPTIONS.map((o) => o.value) as [BookCondition, ...BookCondition[]],
    { errorMap: () => ({ message: 'Kondisi buku tidak valid.' }) }
  ),

  storageLocationId: z
    .string()
    .uuid('Lokasi penyimpanan tidak valid. Silakan pilih dari daftar.')
    .optional()
    .or(z.literal(''))
    .nullable(),

  readingStatus: z.enum(
    READING_STATUS_OPTIONS.map((o) => o.value) as [ReadingStatus, ...ReadingStatus[]],
    { errorMap: () => ({ message: 'Status membaca tidak valid.' }) }
  ),

  ownershipStatus: z.enum(
    OWNERSHIP_STATUS_OPTIONS.map((o) => o.value) as [OwnershipStatus, ...OwnershipStatus[]],
    { errorMap: () => ({ message: 'Status kepemilikan tidak valid.' }) }
  ),

  rating: z
    .number({ invalid_type_error: 'Rating harus berupa angka.' })
    .min(0, 'Rating minimal 0.')
    .max(5, 'Rating maksimal 5.')
    .optional()
    .or(z.nan())
    .nullable(),

  notes: z
    .string()
    .trim()
    .max(5000, 'Catatan terlalu panjang (maksimal 5000 karakter).')
    .optional()
    .or(z.literal('')),

  acquiredDate: z
    .string()
    .refine(
      (value) => {
        if (!value) return true
        return /^\d{4}-\d{2}-\d{2}$/.test(value)
      },
      'Format tanggal tidak valid.'
    )
    .optional()
    .or(z.literal(''))
    .nullable(),
})

export type BookFormValues = z.infer<typeof bookFormSchema>

/** Validasi skema kategori */
export const categoryFormSchema = z.object({
  name: z
    .string({ required_error: 'Nama kategori wajib diisi.' })
    .trim()
    .min(1, 'Nama kategori wajib diisi.')
    .max(100, 'Nama kategori terlalu panjang (maksimal 100 karakter).'),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>

/** Validasi skema lokasi penyimpanan */
export const locationFormSchema = z.object({
  name: z
    .string({ required_error: 'Nama lokasi wajib diisi.' })
    .trim()
    .min(1, 'Nama lokasi wajib diisi.')
    .max(100, 'Nama lokasi terlalu panjang (maksimal 100 karakter).'),
  description: z
    .string()
    .trim()
    .max(500, 'Deskripsi terlalu panjang (maksimal 500 karakter).')
    .optional()
    .or(z.literal('')),
})

export type LocationFormValues = z.infer<typeof locationFormSchema>

/** Validasi skema peminjaman */
export const loanFormSchema = z.object({
  bookId: z
    .string({ required_error: 'Buku wajib dipilih.' })
    .uuid('Buku tidak valid. Silakan pilih dari daftar.'),
  borrowerName: z
    .string({ required_error: 'Nama peminjam wajib diisi.' })
    .trim()
    .min(1, 'Nama peminjam wajib diisi.')
    .max(100, 'Nama peminjam terlalu panjang.'),
  borrowerContact: z
    .string()
    .trim()
    .max(50, 'Nomor kontak terlalu panjang.')
    .optional()
    .or(z.literal('')),
  borrowedAt: z
    .string({ required_error: 'Tanggal dipinjam wajib diisi.' })
    .min(1, 'Tanggal dipinjam wajib diisi.'),
  dueAt: z
    .string()
    .optional()
    .or(z.literal(''))
    .nullable(),
  notes: z
    .string()
    .trim()
    .max(1000, 'Catatan terlalu panjang.')
    .optional()
    .or(z.literal('')),
})

export type LoanFormValues = z.infer<typeof loanFormSchema>
