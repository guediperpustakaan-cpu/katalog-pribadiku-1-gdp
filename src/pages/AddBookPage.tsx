import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, ScanLine } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { BookForm, type BookFormSubmitMode } from '@/components/BookForm'
import { BarcodeScanner } from '@/components/BarcodeScanner'
import { PageSkeleton } from '@/components/LoadingSkeleton'
import { useCreateBook } from '@/hooks/queries'
import { apiClient } from '@/services/apiClient'
import type { Book } from '@/types'
import type { BookFormValues } from '@/utils/validation'

/**
 * Halaman Tambah Buku: formulir 17 field + pemindai ISBN.
 * Mendukung "Simpan" dan "Simpan dan Tambah Lagi".
 */
export default function AddBookPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [scannerOpen, setScannerOpen] = useState(searchParams.get('scan') === '1')
  const [isLookingUp, setIsLookingUp] = useState(false)

  const createBook = useCreateBook()

  const buildPayload = (values: BookFormValues): Partial<Book> => ({
    title: values.title,
    author: values.author || null,
    isbn: values.isbn || null,
    publisher: values.publisher || null,
    publicationYear: values.publicationYear ?? null,
    edition: values.edition || null,
    language: values.language || null,
    categoryId: values.categoryId || null,
    description: values.description || null,
    pageCount: values.pageCount ?? null,
    coverImageUrl: values.coverImageUrl || null,
    condition: values.condition,
    storageLocationId: values.storageLocationId || null,
    readingStatus: values.readingStatus,
    ownershipStatus: values.ownershipStatus,
    rating: values.rating ?? null,
    notes: values.notes || null,
    acquiredDate: values.acquiredDate || null,
  })

  const handleSubmit = async (values: BookFormValues, mode: BookFormSubmitMode) => {
    try {
      const created = await createBook.mutateAsync(buildPayload(values))
      if (mode === 'save_and_add') {
        toast.success(`"${values.title}" berhasil disimpan. Tambah buku berikutnya.`)
        // Reset form dengan navigasi ke rute yang sama (form di-unmount/remount)
        navigate('/buku/tambah', { replace: true })
      } else {
        toast.success(`Buku "${created.title}" berhasil disimpan.`)
        navigate(`/buku/${created.id}`)
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Gagal menyimpan buku. Silakan coba lagi.'
      toast.error(message)
    }
  }

  const handleIsbnDetected = async (isbn: string) => {
    setScannerOpen(false)
    setSearchParams({}, { replace: true })
    setIsLookingUp(true)
    toast.info(`ISBN ${isbn} terdeteksi, mencari informasi buku...`)
    try {
      const info = await apiClient.lookupIsbn(isbn)
      if (!info) {
        toast.info('Buku tidak ditemukan di database publik. Silakan isi secara manual.')
        navigate(`/buku/tambah?isbn=${encodeURIComponent(isbn)}`)
        return
      }
      // Simpan hasil lookup sementara lewat state URL agar form terisi otomatis
      const params = new URLSearchParams({ isbn })
      if (info.title) params.set('title', info.title)
      if (info.author) params.set('author', info.author)
      if (info.publisher) params.set('publisher', info.publisher)
      if (info.publicationYear) params.set('year', String(info.publicationYear))
      if (info.pageCount) params.set('pages', String(info.pageCount))
      if (info.language) params.set('language', info.language)
      if (info.coverImageUrl) params.set('cover', info.coverImageUrl)
      navigate(`/buku/tambah?${params.toString()}`, { replace: true })
      toast.success(`Informasi buku "${info.title}" berhasil ditemukan.`)
    } catch {
      toast.error('Gagal mencari informasi ISBN. Silakan isi secara manual.')
      navigate(`/buku/tambah?isbn=${encodeURIComponent(isbn)}`, { replace: true })
    } finally {
      setIsLookingUp(false)
    }
  }

  // Saat redirect dari pemindai dengan parameter ISBN, isi form lewat initialData
  const initialData: Partial<Book> = {
    isbn: searchParams.get('isbn') ?? undefined,
    title: searchParams.get('title') ?? undefined,
    author: searchParams.get('author') ?? undefined,
    publisher: searchParams.get('publisher') ?? undefined,
    publicationYear: searchParams.get('year') ? Number(searchParams.get('year')) : undefined,
    pageCount: searchParams.get('pages') ? Number(searchParams.get('pages')) : undefined,
    language: searchParams.get('language') ?? undefined,
    coverImageUrl: searchParams.get('cover') ?? undefined,
  }

  const hasInitialFromScan = Boolean(searchParams.get('isbn'))

  if (isLookingUp) {
    return (
      <div className="space-y-6">
        <PageHeader title="Tambah Buku" subtitle="Mencari informasi buku..." />
        <PageSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Buku"
        subtitle="Lengkapi data buku untuk menambahkannya ke koleksi"
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setScannerOpen(true)}
              leftIcon={<ScanLine size={15} />}
            >
              Pindai ISBN
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              leftIcon={<ArrowLeft size={15} />}
            >
              Kembali
            </Button>
          </div>
        }
      />

      {hasInitialFromScan && (
        <div className="card flex items-start gap-3 border-primary/30 bg-primary/5 p-4">
          <BookOpen className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">Data dari pemindaian ISBN</p>
            <p className="text-xs text-muted-foreground">
              Beberapa field sudah otomatis terisi. Periksa kembali sebelum menyimpan.
            </p>
          </div>
        </div>
      )}

      <BookForm
        key={searchParams.toString()}
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        isSubmitting={createBook.isPending}
        heading="Data Buku Baru"
      />

      <BarcodeScanner
        isOpen={scannerOpen}
        onClose={() => {
          setScannerOpen(false)
          setSearchParams({}, { replace: true })
        }}
        onDetected={handleIsbnDetected}
      />
    </div>
  )
}
