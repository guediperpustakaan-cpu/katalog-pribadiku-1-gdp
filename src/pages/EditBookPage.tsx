import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookX } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { BookForm } from '@/components/BookForm'
import { EmptyState } from '@/components/EmptyState'
import { PageSkeleton } from '@/components/LoadingSkeleton'
import { useBook, useUpdateBook } from '@/hooks/queries'
import type { Book } from '@/types'
import type { BookFormValues } from '@/utils/validation'

/**
 * Halaman Edit Buku: memakai formulir yang sama dengan Tambah Buku
 * namun dengan nilai awal dari data buku yang sudah ada.
 */
export default function EditBookPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: book, isLoading, isError } = useBook(id)
  const updateBook = useUpdateBook()

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

  const handleSubmit = async (values: BookFormValues) => {
    if (!id) return
    try {
      await updateBook.mutateAsync({ id, input: buildPayload(values) })
      toast.success(`Perubahan buku "${values.title}" berhasil disimpan.`)
      navigate(`/buku/${id}`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Gagal menyimpan perubahan. Silakan coba lagi.'
      toast.error(message)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft size={15} />}
        >
          Kembali
        </Button>
        <PageSkeleton />
      </div>
    )
  }

  if (isError || !book) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft size={15} />}
        >
          Kembali
        </Button>
        <div className="card">
          <EmptyState
            icon={BookX}
            title="Buku tidak ditemukan"
            description="Buku yang ingin diedit mungkin telah dihapus."
            action={{ label: 'Kembali ke koleksi', onClick: () => navigate('/koleksi') }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Buku"
        subtitle={`Memperbarui data "${book.title}"`}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft size={15} />}
          >
            Kembali
          </Button>
        }
      />

      <BookForm
        initialData={book}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/buku/${book.id}`)}
        isSubmitting={updateBook.isPending}
        heading="Perbarui Data Buku"
      />
    </div>
  )
}
