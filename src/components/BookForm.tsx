import { useState, useCallback } from 'react'
import { BookOpen, Loader2, Search } from 'lucide-react'
import type { Book, BookCondition, OwnershipStatus, ReadingStatus } from '@/types'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { CategorySelect } from '@/components/CategorySelect'
import { LocationSelect } from '@/components/LocationSelect'
import { RatingInput } from '@/components/RatingInput'
import { ImageUploader } from '@/components/ImageUploader'
import {
  CONDITION_OPTIONS,
  OWNERSHIP_STATUS_OPTIONS,
  READING_STATUS_OPTIONS,
} from '@/constants'
import { bookFormSchema, type BookFormValues } from '@/utils/validation'
import { todayISODate } from '@/utils/date'
import { apiClient } from '@/services/apiClient'
import { useCategories, useLocations } from '@/hooks/queries'

export type BookFormSubmitMode = 'save' | 'save_and_add'

export interface BookFormProps {
  /** Nilai awal untuk mode edit */
  initialData?: Partial<Book> | null
  /** Dipanggil saat formulir disimpan */
  onSubmit: (values: BookFormValues, mode: BookFormSubmitMode) => void | Promise<void>
  /** Tombol batal */
  onCancel?: () => void
  /** Sedang dalam proses penyimpanan */
  isSubmitting?: boolean
  /** Judul section (mis. "Tambah Buku") */
  heading?: string
  className?: string
}

interface FormErrors {
  [key: string]: string | undefined
}

/** Nilai awal formulir ketika menambah buku baru */
function createEmptyValues(): BookFormValues {
  return {
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publicationYear: undefined,
    edition: '',
    language: '',
    categoryId: '',
    description: '',
    pageCount: undefined,
    coverImageUrl: '',
    condition: 'baik',
    storageLocationId: '',
    readingStatus: 'belum_dibaca',
    ownershipStatus: 'dimiliki',
    rating: null,
    notes: '',
    acquiredDate: todayISODate(),
  }
}

/** Bangun nilai formulir dari data buku yang sudah ada */
function buildValuesFromBook(book: Partial<Book> | null | undefined): BookFormValues {
  if (!book) return createEmptyValues()
  return {
    title: book.title ?? '',
    author: book.author ?? '',
    isbn: book.isbn ?? '',
    publisher: book.publisher ?? '',
    publicationYear: book.publicationYear ?? undefined,
    edition: book.edition ?? '',
    language: book.language ?? '',
    categoryId: book.categoryId ?? '',
    description: book.description ?? '',
    pageCount: book.pageCount ?? undefined,
    coverImageUrl: book.coverImageUrl ?? '',
    condition: (book.condition ?? 'baik') as BookCondition,
    storageLocationId: book.storageLocationId ?? '',
    readingStatus: (book.readingStatus ?? 'belum_dibaca') as ReadingStatus,
    ownershipStatus: (book.ownershipStatus ?? 'dimiliki') as OwnershipStatus,
    rating: book.rating ?? null,
    notes: book.notes ?? '',
    acquiredDate: book.acquiredDate ?? '',
  }
}

/**
 * Formulir tambah/edit buku dengan 17 field, validasi Zod (bahasa Indonesia),
 * pratinjau & kompresi foto sampul, serta pencarian info via ISBN.
 */
export function BookForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  heading,
  className,
}: BookFormProps) {
  const [values, setValues] = useState<BookFormValues>(() =>
    buildValuesFromBook(initialData)
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLookingUpIsbn, setIsLookingUpIsbn] = useState(false)
  const [coverError, setCoverError] = useState<string | undefined>()

  // Daftar kategori & lokasi di-load sekali saja (di-cache oleh TanStack Query
  // dan otomatis di-refresh ketika ada perubahan data di halaman lain).
  const { data: categories } = useCategories()
  const { data: locations } = useLocations()

  const setField = useCallback(
    <K extends keyof BookFormValues>(key: K, value: BookFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }))
      // Hapus error field saat pengguna mulai mengetik lagi
      setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
    },
    []
  )

  const handleIsbnLookup = useCallback(async () => {
    const isbn = values.isbn?.trim()
    if (!isbn) {
      setErrors((prev) => ({ ...prev, isbn: 'Isi ISBN terlebih dahulu.' }))
      return
    }
    setIsLookingUpIsbn(true)
    try {
      const result = await apiClient.lookupIsbn(isbn)
      if (!result) {
        setErrors((prev) => ({
          ...prev,
          isbn: 'Informasi buku tidak ditemukan untuk ISBN tersebut. Isi secara manual.',
        }))
        return
      }
      setValues((prev) => ({
        ...prev,
        title: result.title || prev.title,
        author: result.author || prev.author,
        publisher: result.publisher || prev.publisher,
        publicationYear: result.publicationYear || prev.publicationYear,
        pageCount: result.pageCount || prev.pageCount,
        language: result.language || prev.language,
        description: result.description || prev.description,
        coverImageUrl: result.coverImageUrl || prev.coverImageUrl,
        isbn: result.isbn || prev.isbn,
      }))
      setErrors((prev) => ({ ...prev, isbn: undefined }))
    } catch {
      setErrors((prev) => ({
        ...prev,
        isbn: 'Gagal mencari ISBN. Periksa koneksi internet atau isi secara manual.',
      }))
    } finally {
      setIsLookingUpIsbn(false)
    }
  }, [values.isbn])

  const validate = (): BookFormValues | null => {
    const result = bookFormSchema.safeParse(values)
    if (result.success) {
      setErrors({})
      return result.data
    }
    const nextErrors: FormErrors = {}
    Object.entries(result.error.flatten().fieldErrors).forEach(([key, messages]) => {
      if (messages && messages.length > 0) {
        nextErrors[key] = messages[0]
      }
    })
    setErrors(nextErrors)
    // Fokus kembali ke field pertama yang error
    const firstErrorKey = Object.keys(nextErrors)[0]
    if (firstErrorKey) {
      const element = document.querySelector<HTMLElement>(`[name="${firstErrorKey}"]`)
      element?.focus()
    }
    return null
  }

  const handleSubmit = async (event: React.FormEvent, mode: BookFormSubmitMode) => {
    event.preventDefault()
    const validValues = validate()
    if (!validValues) return
    await onSubmit(validValues, mode)
  }

  return (
    <form className={cn('space-y-6', className)} noValidate>
      {heading && (
        <div className="flex items-center gap-2 text-foreground">
          <BookOpen size={18} aria-hidden="true" />
          <h2 className="text-base font-semibold">{heading}</h2>
        </div>
      )}

      {/* ---------------- Info Utama ---------------- */}
      <section className="card space-y-4 p-5">
        <h3 className="text-sm font-semibold text-foreground">Informasi Utama</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="title" required>
              Judul Buku
            </Label>
            <Input
              id="title"
              name="title"
              value={values.title}
              onChange={(event) => setField('title', event.target.value)}
              error={errors.title}
              placeholder="Contoh: Laskar Pelangi"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="author">Penulis</Label>
            <Input
              id="author"
              name="author"
              value={values.author}
              onChange={(event) => setField('author', event.target.value)}
              error={errors.author}
              placeholder="Contoh: Andrea Hirata"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="isbn">ISBN</Label>
            <div className="flex gap-2">
              <Input
                id="isbn"
                name="isbn"
                value={values.isbn}
                onChange={(event) => setField('isbn', event.target.value)}
                error={errors.isbn}
                placeholder="9786020000000"
                inputMode="numeric"
                disabled={isSubmitting || isLookingUpIsbn}
              />
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleIsbnLookup}
                loading={isLookingUpIsbn}
                disabled={isSubmitting}
                leftIcon={!isLookingUpIsbn ? <Search size={15} /> : undefined}
                className="flex-shrink-0"
              >
                Cari
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Isi ISBN lalu tekan "Cari" untuk mengisi otomatis dari internet.
            </p>
          </div>

          <div>
            <Label htmlFor="publisher">Penerbit</Label>
            <Input
              id="publisher"
              name="publisher"
              value={values.publisher}
              onChange={(event) => setField('publisher', event.target.value)}
              error={errors.publisher}
              placeholder="Contoh: Bentang Pustaka"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="publicationYear">Tahun Terbit</Label>
            <Input
              id="publicationYear"
              name="publicationYear"
              type="number"
              value={values.publicationYear ?? ''}
              onChange={(event) =>
                setField(
                  'publicationYear',
                  event.target.value === '' ? undefined : Number(event.target.value)
                )
              }
              error={errors.publicationYear}
              placeholder="Contoh: 2005"
              min={1400}
              max={new Date().getFullYear() + 1}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="edition">Edisi</Label>
            <Input
              id="edition"
              name="edition"
              value={values.edition}
              onChange={(event) => setField('edition', event.target.value)}
              error={errors.edition}
              placeholder="Contoh: Edisi ke-3"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="language">Bahasa</Label>
            <Input
              id="language"
              name="language"
              value={values.language}
              onChange={(event) => setField('language', event.target.value)}
              error={errors.language}
              placeholder="Contoh: Indonesia"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="pageCount">Jumlah Halaman</Label>
            <Input
              id="pageCount"
              name="pageCount"
              type="number"
              value={values.pageCount ?? ''}
              onChange={(event) =>
                setField(
                  'pageCount',
                  event.target.value === '' ? undefined : Number(event.target.value)
                )
              }
              error={errors.pageCount}
              placeholder="Contoh: 529"
              min={0}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="acquiredDate">Tanggal Diperoleh</Label>
            <Input
              id="acquiredDate"
              name="acquiredDate"
              type="date"
              value={values.acquiredDate ?? ''}
              onChange={(event) => setField('acquiredDate', event.target.value)}
              error={errors.acquiredDate}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Deskripsi / Sinopsis</Label>
          <Textarea
            id="description"
            name="description"
            value={values.description}
            onChange={(event) => setField('description', event.target.value)}
            error={errors.description}
            placeholder="Ringkasan isi buku..."
            rows={4}
            maxLength={5000}
            disabled={isSubmitting}
          />
        </div>
      </section>

      {/* ---------------- Foto Sampul ---------------- */}
      <section className="card space-y-4 p-5">
        <h3 className="text-sm font-semibold text-foreground">Foto Sampul</h3>
        <ImageUploader
          value={values.coverImageUrl}
          onChange={(dataUrl) => setField('coverImageUrl', dataUrl)}
          onError={(message) => setCoverError(message)}
          disabled={isSubmitting}
        />
        {coverError && <p className="text-xs font-medium text-destructive">{coverError}</p>}
      </section>

      {/* ---------------- Kategori & Lokasi ---------------- */}
      <section className="card space-y-4 p-5">
        <h3 className="text-sm font-semibold text-foreground">Klasifikasi & Penyimpanan</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="categoryId">Kategori</Label>
            <CategorySelect
              categories={categories}
              value={values.categoryId ?? ''}
              onChange={(value) => setField('categoryId', value)}
              error={errors.categoryId}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="storageLocationId">Lokasi Penyimpanan</Label>
            <LocationSelect
              locations={locations}
              value={values.storageLocationId ?? ''}
              onChange={(value) => setField('storageLocationId', value)}
              error={errors.storageLocationId}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </section>

      {/* ---------------- Status Buku ---------------- */}
      <section className="card space-y-4 p-5">
        <h3 className="text-sm font-semibold text-foreground">Status & Kondisi</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="readingStatus">Status Membaca</Label>
            <Select
              id="readingStatus"
              name="readingStatus"
              value={values.readingStatus}
              onChange={(event) =>
                setField('readingStatus', event.target.value as ReadingStatus)
              }
              error={errors.readingStatus}
              options={READING_STATUS_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="ownershipStatus">Status Kepemilikan</Label>
            <Select
              id="ownershipStatus"
              name="ownershipStatus"
              value={values.ownershipStatus}
              onChange={(event) =>
                setField('ownershipStatus', event.target.value as OwnershipStatus)
              }
              error={errors.ownershipStatus}
              options={OWNERSHIP_STATUS_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="condition">Kondisi Buku</Label>
            <Select
              id="condition"
              name="condition"
              value={values.condition}
              onChange={(event) => setField('condition', event.target.value as BookCondition)}
              error={errors.condition}
              options={CONDITION_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <RatingInput
            value={values.rating}
            onChange={(value) => setField('rating', value)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="notes">Catatan Pribadi</Label>
          <Textarea
            id="notes"
            name="notes"
            value={values.notes}
            onChange={(event) => setField('notes', event.target.value)}
            error={errors.notes}
            placeholder="Contoh: Beli di toko buku bekas, halaman 20 ada coretan..."
            rows={3}
            maxLength={5000}
            disabled={isSubmitting}
          />
        </div>
      </section>

      {/* ---------------- Aksi ---------------- */}
      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            className="sm:order-first"
          >
            Batal
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          onClick={(event) => handleSubmit(event, 'save_and_add')}
        >
          Simpan dan Tambah Lagi
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          onClick={(event) => handleSubmit(event, 'save')}
          leftIcon={!isSubmitting ? <BookOpen size={15} /> : undefined}
        >
          Simpan
        </Button>
      </div>

      {isSubmitting && (
        <p className="sr-only" aria-live="polite">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sedang menyimpan data buku.
        </p>
      )}
    </form>
  )
}
