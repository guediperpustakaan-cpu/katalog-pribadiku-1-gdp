import {
  BookOpen,
  Calendar,
  Edit,
  FileText,
  Hash,
  Layers,
  Library,
  MapPin,
  NotebookPen,
  Share2,
  Trash2,
  User,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { BookWithRelations } from '@/types'
import { cn } from '@/utils/cn'
import { BookCover } from '@/components/BookCover'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  ConditionBadge,
  LoanStatusBadge,
  OwnershipStatusBadge,
  ReadingStatusBadge,
} from '@/components/StatusBadge'
import { RatingDisplay } from '@/components/RatingInput'
import {
  formatDate,
  formatNumber,
  isOverdue,
} from '@/utils/date'
import {
  getConditionLabel,
  getOwnershipStatusLabel,
  getReadingStatusLabel,
} from '@/constants'

export interface BookDetailProps {
  book: BookWithRelations
  onEdit?: () => void
  onDelete?: () => void
  onShare?: () => void
  /** Aksi singkat untuk mengubah status membaca */
  onMarkReading?: (status: string) => void
  onToggleOwnership?: (status: string) => void
  className?: string
}

type InfoRow = {
  icon: typeof Hash
  label: string
  value: string
}

/**
 * Tampilan lengkap sebuah buku: sampul, metadata, status, catatan,
 * serta aksi edit/hapus/share dan perubahan status cepat.
 */
export function BookDetail({
  book,
  onEdit,
  onDelete,
  onShare,
  onMarkReading,
  onToggleOwnership,
  className,
}: BookDetailProps) {
  const infoRows: InfoRow[] = [
    { icon: User, label: 'Penulis', value: book.author ?? '-' },
    { icon: Hash, label: 'ISBN', value: book.isbn ?? '-' },
    { icon: Library, label: 'Penerbit', value: book.publisher ?? '-' },
    {
      icon: Calendar,
      label: 'Tahun Terbit',
      value: book.publicationYear ? formatNumber(book.publicationYear) : '-',
    },
    { icon: Layers, label: 'Edisi', value: book.edition ?? '-' },
    {
      icon: NotebookPen,
      label: 'Jumlah Halaman',
      value: book.pageCount ? `${formatNumber(book.pageCount)} halaman` : '-',
    },
    {
      icon: BookOpen,
      label: 'Bahasa',
      value: book.language ?? '-',
    },
    {
      icon: Calendar,
      label: 'Tanggal Diperoleh',
      value: book.acquiredDate ? formatDate(book.acquiredDate) : '-',
    },
  ]

  const isBorrowed = Boolean(
    book.activeLoan && book.activeLoan.status !== 'dikembalikan'
  )

  return (
    <div className={cn('space-y-6', className)}>
      {/* ---------------- Header: sampul + info inti ---------------- */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="mx-auto w-40 flex-shrink-0 sm:w-48">
            <BookCover
              title={book.title}
              coverImageUrl={book.coverImageUrl}
              aspectRatio="2/3"
              className="w-full shadow-md"
              loading="eager"
            />
          </div>

          <div className="flex-1 space-y-4">
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">
                {book.title}
              </h1>
              {book.author && (
                <p className="text-sm text-muted-foreground sm:text-base">
                  oleh <span className="font-medium text-foreground">{book.author}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ReadingStatusBadge status={book.readingStatus} />
              <OwnershipStatusBadge status={book.ownershipStatus} />
              <ConditionBadge condition={book.condition} />
              {isBorrowed && book.activeLoan && (
                <LoanStatusBadge status={book.activeLoan.status} />
              )}
            </div>

            <div className="flex items-center gap-3">
              <RatingDisplay value={book.rating} size="md" />
              <span className="text-sm text-muted-foreground">
                {book.rating ? `${book.rating} dari 5` : 'Belum ada rating'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FolderIcon className="h-4 w-4 flex-shrink-0 text-primary" />
                <span>Kategori: </span>
                <span className="font-medium text-foreground">
                  {book.category?.name ?? 'Tidak ada kategori'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
                <span>Lokasi: </span>
                <span className="font-medium text-foreground">
                  {book.storageLocation?.name ?? 'Tidak ada lokasi'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {onEdit && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onEdit}
                  leftIcon={<Edit size={14} />}
                >
                  Edit Buku
                </Button>
              )}
              {onShare && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onShare}
                  leftIcon={<Share2 size={14} />}
                >
                  Bagikan
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={onDelete}
                  leftIcon={<Trash2 size={14} />}
                >
                  Hapus
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ---------------- Aksi status cepat ---------------- */}
      <Card className="p-5 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Ubah Status dengan Cepat</h2>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Status membaca</p>
            <div className="flex flex-wrap gap-2">
              {(['belum_dibaca', 'sedang_dibaca', 'sudah_dibaca', 'tidak_ingin_dibaca'] as const).map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onMarkReading?.(status)}
                    aria-pressed={book.readingStatus === status}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      book.readingStatus === status
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-card text-foreground hover:bg-secondary'
                    )}
                  >
                    {getReadingStatusLabel(status)}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-muted-foreground">Status kepemilikan</p>
            <div className="flex flex-wrap gap-2">
              {(['dimiliki', 'dipinjamkan', 'hilang', 'ingin_dijual', 'rusak'] as const).map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onToggleOwnership?.(status)}
                    aria-pressed={book.ownershipStatus === status}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      book.ownershipStatus === status
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-card text-foreground hover:bg-secondary'
                    )}
                  >
                    {getOwnershipStatusLabel(status)}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ---------------- Info detail ---------------- */}
      <Card className="p-5 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Informasi Buku</h2>
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {infoRows.map((row) => (
            <div key={row.label} className="flex items-start gap-3">
              <row.icon
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">{row.label}</dt>
                <dd className="text-sm font-medium text-foreground">{row.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </Card>

      {/* ---------------- Deskripsi & catatan ---------------- */}
      {(book.description || book.notes) && (
        <Card className="p-5 sm:p-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Deskripsi & Catatan</h2>
          <div className="space-y-4 text-sm leading-relaxed">
            {book.description && (
              <div>
                <h3 className="mb-1 text-xs text-muted-foreground">Deskripsi</h3>
                <p className="whitespace-pre-line text-foreground">{book.description}</p>
              </div>
            )}
            {book.notes && (
              <div>
                <h3 className="mb-1 text-xs text-muted-foreground">Catatan pribadi</h3>
                <p className="whitespace-pre-line text-foreground">{book.notes}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ---------------- Info peminjaman aktif ---------------- */}
      {isBorrowed && book.activeLoan && (
        <Card
          className={cn(
            'p-5 sm:p-6',
            isOverdue(book.activeLoan.dueAt) && 'border-destructive/40 bg-destructive/5'
          )}
        >
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileText size={16} aria-hidden="true" /> Status Peminjaman
          </h2>
          <div className="space-y-2 text-sm">
            <p className="text-foreground">
              Dipinjam oleh{' '}
              <span className="font-semibold">{book.activeLoan.borrowerName}</span>
            </p>
            {book.activeLoan.borrowerContact && (
              <p className="text-muted-foreground">Kontak: {book.activeLoan.borrowerContact}</p>
            )}
            <p className="text-muted-foreground">
              Tanggal dipinjam: {formatDate(book.activeLoan.borrowedAt)}
            </p>
            {book.activeLoan.dueAt && (
              <p
                className={cn(
                  'font-medium',
                  isOverdue(book.activeLoan.dueAt)
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                )}
              >
                Batas pengembalian: {formatDate(book.activeLoan.dueAt)}
                {isOverdue(book.activeLoan.dueAt) && ' (sudah lewat)'}
              </p>
            )}
            <Link
              to="/peminjaman"
              className="inline-block pt-1 text-sm font-medium text-primary hover:underline"
            >
              Kelola peminjaman →
            </Link>
          </div>
        </Card>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Kondisi: {getConditionLabel(book.condition)} · Ditambahkan{' '}
        {formatDate(book.createdAt)}
      </p>
    </div>
  )
}

/** Ikon folder kecil (lucide tidak punya "Folder" yang cocok, pakai Layers) */
function FolderIcon(props: { className?: string }) {
  return <Layers {...props} aria-hidden="true" />
}
