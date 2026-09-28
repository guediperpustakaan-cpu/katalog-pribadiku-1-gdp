import { Link } from 'react-router-dom'
import { Eye, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { BookWithRelations } from '@/types'
import { cn } from '@/utils/cn'
import { BookCover } from '@/components/BookCover'
import { ConditionBadge, OwnershipStatusBadge, ReadingStatusBadge } from '@/components/StatusBadge'
import { RatingDisplay } from '@/components/RatingInput'

export interface BookCardProps {
  book: BookWithRelations
  onDelete?: (book: BookWithRelations) => void
  className?: string
}

/**
 * Kartu buku untuk tampilan grid pada halaman koleksi.
 * Setiap kartu bisa diklik menuju halaman detail.
 */
export function BookCard({ book, onDelete, className }: BookCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Tutup menu aksi saat klik di luar
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const handleDelete = () => {
    setMenuOpen(false)
    onDelete?.(book)
  }

  return (
    <div
      className={cn(
        'group card relative flex flex-col overflow-hidden p-3 transition-all hover:shadow-md',
        className
      )}
    >
      <div className="absolute right-2 top-2 z-10" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={`Aksi lainnya untuk ${book.title}`}
          aria-expanded={menuOpen}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MoreVertical size={16} aria-hidden="true" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-40 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
            <Link
              to={`/buku/${book.id}`}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
              onClick={() => setMenuOpen(false)}
            >
              <Eye size={14} aria-hidden="true" /> Lihat detail
            </Link>
            <Link
              to={`/buku/${book.id}/edit`}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
              onClick={() => setMenuOpen(false)}
            >
              <Pencil size={14} aria-hidden="true" /> Edit buku
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 size={14} aria-hidden="true" /> Hapus buku
            </button>
          </div>
        )}
      </div>

      <Link to={`/buku/${book.id}`} className="flex-shrink-0">
        <BookCover
          title={book.title}
          coverImageUrl={book.coverImageUrl}
          className="w-full shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </Link>

      <div className="mt-3 flex flex-1 flex-col gap-2">
        <div className="space-y-1">
          <Link to={`/buku/${book.id}`}>
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground hover:text-primary">
              {book.title}
            </h3>
          </Link>
          {book.author && (
            <p className="line-clamp-1 text-xs text-muted-foreground">{book.author}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          <ReadingStatusBadge status={book.readingStatus} />
          <OwnershipStatusBadge status={book.ownershipStatus} />
        </div>

        <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
          {book.category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-accent-foreground">
              {book.category.name}
            </span>
          )}
          {book.storageLocation && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-accent-foreground">
              {book.storageLocation.name}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-1">
          <ConditionBadge condition={book.condition} />
          <RatingDisplay value={book.rating} size="sm" />
        </div>
      </div>
    </div>
  )
}
