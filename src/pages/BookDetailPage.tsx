import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookX } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { BookDetail } from '@/components/BookDetail'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { PageSkeleton } from '@/components/LoadingSkeleton'
import {
  useBook,
  useCreateReadingLog,
  useDeleteBook,
  useUpdateBook,
} from '@/hooks/queries'
import { copyToClipboard } from '@/utils'
import { getReadingStatusLabel, getOwnershipStatusLabel } from '@/constants'
import type { BookWithRelations } from '@/types'

/**
 * Halaman Detail Buku: menampilkan seluruh info buku + aksi status cepat,
 * edit, hapus, dan bagikan.
 */
export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: book, isLoading, isError } = useBook(id)
  const updateBook = useUpdateBook()
  const deleteBook = useDeleteBook()
  const createReadingLog = useCreateReadingLog()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleShare = async (current: BookWithRelations) => {
    const lines = [
      `${current.title}`,
      current.author ? `Penulis: ${current.author}` : '',
      current.isbn ? `ISBN: ${current.isbn}` : '',
      current.publisher ? `Penerbit: ${current.publisher}` : '',
      current.publicationYear ? `Tahun: ${current.publicationYear}` : '',
      `Status membaca: ${getReadingStatusLabel(current.readingStatus)}`,
      `Kepemilikan: ${getOwnershipStatusLabel(current.ownershipStatus)}`,
      current.category ? `Kategori: ${current.category.name}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const success = await copyToClipboard(lines)
    if (success) {
      toast.success('Informasi buku disalin ke clipboard.')
    } else {
      toast.error('Gagal menyalin. Browser memblokir akses clipboard.')
    }
  }

  const handleMarkReading = async (status: string) => {
    if (!id || !book) return
    try {
      await updateBook.mutateAsync({
        id,
        input: { readingStatus: status as BookWithRelations['readingStatus'] },
      })
      await createReadingLog.mutateAsync({
        bookId: id,
        status: status as BookWithRelations['readingStatus'],
        startedAt: status === 'sedang_dibaca' ? new Date().toISOString() : null,
        finishedAt: status === 'sudah_dibaca' ? new Date().toISOString() : null,
      })
      toast.success(`Status membaca diubah menjadi "${getReadingStatusLabel(status)}".`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengubah status membaca.')
    }
  }

  const handleToggleOwnership = async (status: string) => {
    if (!id || !book) return
    try {
      await updateBook.mutateAsync({
        id,
        input: { ownershipStatus: status as BookWithRelations['ownershipStatus'] },
      })
      toast.success(`Status kepemilikan diubah menjadi "${getOwnershipStatusLabel(status)}".`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengubah status kepemilikan.')
    }
  }

  const handleConfirmDelete = async () => {
    if (!id || !book) return
    try {
      await deleteBook.mutateAsync(id)
      toast.success(`Buku "${book.title}" berhasil dihapus.`)
      navigate('/koleksi')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus buku.')
    } finally {
      setDeleteDialogOpen(false)
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
            description="Buku yang Anda cari mungkin telah dihapus atau ID tidak valid."
            action={{ label: 'Kembali ke koleksi', onClick: () => navigate('/koleksi') }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        leftIcon={<ArrowLeft size={15} />}
        className="hidden sm:inline-flex"
      >
        Kembali
      </Button>

      <PageHeader
        title={book.title}
        subtitle={book.author ? `oleh ${book.author}` : 'Penulis tidak diketahui'}
      />

      <BookDetail
        book={book}
        onEdit={() => navigate(`/buku/${book.id}/edit`)}
        onDelete={() => setDeleteDialogOpen(true)}
        onShare={() => handleShare(book)}
        onMarkReading={handleMarkReading}
        onToggleOwnership={handleToggleOwnership}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus buku ini?"
        description={`Buku "${book.title}" akan dihapus permanen dari koleksi Anda. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, hapus"
        loading={deleteBook.isPending}
      />
    </div>
  )
}
