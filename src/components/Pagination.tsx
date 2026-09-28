import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  className?: string
}

/** Bangun daftar nomor halaman dengan elipsis (...) untuk halaman yang banyak */
function getVisiblePages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  if (start > 2) pages.push('ellipsis')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push('ellipsis')

  pages.push(total)
  return pages
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  className,
}: PaginationProps) {
  if (total === 0 || totalPages <= 1) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Tidak ada buku untuk ditampilkan.
      </p>
    )
  }

  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)
  const visiblePages = getVisiblePages(page, totalPages)

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-4 sm:flex-row',
        className
      )}
    >
      <p className="text-sm text-muted-foreground" role="status">
        Menampilkan <span className="font-medium text-foreground">{start}</span>–
        <span className="font-medium text-foreground">{end}</span> dari{' '}
        <span className="font-medium text-foreground">{total}</span> buku
      </p>

      <nav aria-label="Navigasi halaman" className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Halaman sebelumnya"
          className={cn(
            'inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground transition-colors',
            'hover:bg-secondary disabled:pointer-events-none disabled:opacity-50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        >
          <ChevronLeft size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        <div className="flex items-center gap-1">
          {visiblePages.map((pageNumber, index) => {
            if (pageNumber === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-9 w-9 items-center justify-center text-muted-foreground"
                  aria-hidden="true"
                >
                  <MoreHorizontal size={16} />
                </span>
              )
            }
            const isActive = pageNumber === page
            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Halaman ${pageNumber}`}
                className={cn(
                  'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border border-input bg-card text-foreground hover:bg-secondary'
                )}
              >
                {pageNumber}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Halaman berikutnya"
          className={cn(
            'inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground transition-colors',
            'hover:bg-secondary disabled:pointer-events-none disabled:opacity-50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </nav>
    </div>
  )
}
