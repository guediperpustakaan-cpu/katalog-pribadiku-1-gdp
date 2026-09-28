import { Link } from 'react-router-dom'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import type { BookWithRelations, SortDirection } from '@/types'
import { cn } from '@/utils/cn'
import { BookCover } from '@/components/BookCover'
import { ConditionBadge, OwnershipStatusBadge, ReadingStatusBadge } from '@/components/StatusBadge'
import { RatingDisplay } from '@/components/RatingInput'
import { getConditionLabel, getOwnershipStatusLabel, getReadingStatusLabel } from '@/constants'

export interface BookTableProps {
  books: BookWithRelations[]
  onDelete?: (book: BookWithRelations) => void
  sort?: string
  order?: SortDirection
  onSort?: (field: string) => void
  className?: string
}

type Column = {
  key: string
  label: string
  sortable?: boolean
  className?: string
}

const COLUMNS: Column[] = [
  { key: 'title', label: 'Judul & Penulis', sortable: true },
  { key: 'category', label: 'Kategori' },
  { key: 'location', label: 'Lokasi' },
  { key: 'readingStatus', label: 'Status Baca', sortable: false },
  { key: 'ownershipStatus', label: 'Kepemilikan' },
  { key: 'condition', label: 'Kondisi' },
  { key: 'publicationYear', label: 'Tahun', sortable: true, className: 'hidden lg:table-cell' },
  { key: 'rating', label: 'Rating', sortable: true, className: 'hidden md:table-cell' },
  { key: 'actions', label: 'Aksi', className: 'text-right' },
]

/**
 * Tabel buku untuk tampilan daftar (table view) pada halaman koleksi.
 * Judul kolom yang bisa di-sort akan memanggil `onSort` saat diklik.
 */
export function BookTable({
  books,
  onDelete,
  sort,
  order = 'asc',
  onSort,
  className,
}: BookTableProps) {
  const handleSort = (column: Column) => {
    if (!column.sortable || !onSort) return
    onSort(column.key)
  }

  const SortIndicator = ({ column }: { column: Column }) => {
    if (!column.sortable) return null
    const isActive = sort === column.key
    return (
      <span
        className={cn(
          'ml-1 inline-flex flex-col text-[9px] leading-none',
          isActive ? 'text-primary' : 'text-muted-foreground/50'
        )}
        aria-hidden="true"
      >
        <span className={isActive && order === 'asc' ? 'text-primary' : ''}>▲</span>
        <span className={isActive && order === 'desc' ? 'text-primary' : ''}>▼</span>
      </span>
    )
  }

  return (
    <div className={cn('card overflow-hidden p-0', className)}>
      <div className="table-wrapper">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
                    column.sortable && onSort && 'cursor-pointer select-none hover:text-foreground',
                    column.className
                  )}
                  aria-sort={
                    column.sortable && sort === column.key
                      ? order === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  onClick={() => handleSort(column)}
                  onKeyDown={(event) =>
                    event.key === 'Enter' || event.key === ' ' ? handleSort(column) : null
                  }
                  tabIndex={column.sortable && onSort ? 0 : undefined}
                >
                  {column.label}
                  <SortIndicator column={column} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {books.map((book) => (
              <tr key={book.id} className="transition-colors hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link to={`/buku/${book.id}`} className="flex-shrink-0">
                      <BookCover
                        title={book.title}
                        coverImageUrl={book.coverImageUrl}
                        aspectRatio="2/3"
                        className="h-16 w-11 shadow-sm"
                        loading="lazy"
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link
                        to={`/buku/${book.id}`}
                        className="line-clamp-1 font-medium text-foreground hover:text-primary"
                      >
                        {book.title}
                      </Link>
                      {book.author && (
                        <p className="line-clamp-1 text-xs text-muted-foreground">{book.author}</p>
                      )}
                      {book.isbn && (
                        <p className="text-[11px] text-muted-foreground/70">ISBN: {book.isbn}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {book.category ? (
                    <span className="text-foreground">{book.category.name}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {book.storageLocation ? (
                    <span className="text-foreground">{book.storageLocation.name}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ReadingStatusBadge status={book.readingStatus} />
                </td>
                <td className="px-4 py-3">
                  <OwnershipStatusBadge status={book.ownershipStatus} />
                </td>
                <td className="px-4 py-3">
                  <ConditionBadge condition={book.condition} />
                </td>
                <td className="hidden px-4 py-3 text-foreground lg:table-cell">
                  {book.publicationYear ?? '-'}
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <RatingDisplay value={book.rating} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/buku/${book.id}`}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                      aria-label={`Lihat detail ${book.title}`}
                      title="Lihat detail"
                    >
                      <Eye size={15} aria-hidden="true" />
                    </Link>
                    <Link
                      to={`/buku/${book.id}/edit`}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                      aria-label={`Edit ${book.title}`}
                      title="Edit buku"
                    >
                      <Pencil size={15} aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete?.(book)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`Hapus ${book.title}`}
                      title="Hapus buku"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Baris aksesibilitas untuk pembaca layar: ringkasan status dalam teks */}
      <div className="sr-only">
        {books.map((book) => (
          <p key={`sr-${book.id}`}>
            {book.title} oleh {book.author ?? 'penulis tidak diketahui'}, status membaca{' '}
            {getReadingStatusLabel(book.readingStatus)}, kepemilikan{' '}
            {getOwnershipStatusLabel(book.ownershipStatus)}, kondisi{' '}
            {getConditionLabel(book.condition)}.
          </p>
        ))}
      </div>
    </div>
  )
}
