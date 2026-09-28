import { cn } from '@/utils/cn'

/**
 * Skeleton loading untuk menjaga tata letak tetap stabil
 * dan menghindari layout shift saat data dimuat.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 w-full', className)} aria-hidden="true" />
}

export function BookCardSkeleton() {
  return (
    <div className="card overflow-hidden" role="status" aria-label="Memuat buku">
      <div className="skeleton aspect-[2/3] w-full" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function BookGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      role="status"
      aria-label="Memuat daftar buku"
    >
      {Array.from({ length: count }, (_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function BookRowSkeleton() {
  return (
    <div className="card flex items-center gap-4 p-4" role="status" aria-label="Memuat buku">
      <Skeleton className="h-16 w-12 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <div className="hidden gap-2 sm:flex">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-9 w-20 rounded-lg" />
    </div>
  )
}

export function BookListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Memuat daftar buku">
      {Array.from({ length: count }, (_, i) => (
        <BookRowSkeleton key={i} />
      ))}
    </div>
  )
}

export function DashboardCardSkeleton() {
  return (
    <div className="card p-5" role="status" aria-label="Memuat statistik">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-12" />
        </div>
        <Skeleton className="h-11 w-11 rounded-xl" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Memuat dashboard">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <DashboardCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="card space-y-3 p-5">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 4 }, (_, j) => (
              <Skeleton key={j} className="h-9 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Memuat halaman">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 6 }, (_, i) => (
          <DashboardCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr role="status" aria-label="Memuat data">
      {Array.from({ length: columns }, (_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}
