import { BookOpen } from 'lucide-react'
import { cn } from '@/utils/cn'
import { colorFromString, getInitials } from '@/utils'
import { getImageAlt } from '@/utils/image'

export interface BookCoverProps {
  title?: string | null
  coverImageUrl?: string | null
  className?: string
  /** Ukuran aspek rasio (default: proporsi sampul buku 2:3) */
  aspectRatio?: '2/3' | '3/4' | '1/1' | 'auto'
  loading?: 'eager' | 'lazy'
  onClick?: () => void
}

const aspectClasses = {
  '2/3': 'aspect-[2/3]',
  '3/4': 'aspect-[3/4]',
  '1/1': 'aspect-square',
  auto: '',
}

/**
 * Menampilkan foto sampul buku. Jika tidak ada foto, tampilkan
 * placeholder warna dengan inisial judul (tetap informatif & menarik).
 */
export function BookCover({
  title,
  coverImageUrl,
  className,
  aspectRatio = '2/3',
  loading = 'lazy',
  onClick,
}: BookCoverProps) {
  const aspect = aspectClasses[aspectRatio]
  const alt = getImageAlt(title)

  if (!coverImageUrl) {
    const colors = colorFromString(title ?? 'Buku')
    return (
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br',
          colors,
          aspect,
          className
        )}
        role={onClick ? 'button' : undefined}
        onClick={onClick}
        onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ' ? onClick() : null) : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <div className="absolute inset-0 opacity-20">
          <BookOpen className="h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
        </div>
        <span className="px-2 text-center text-lg font-bold text-white drop-shadow-md sm:text-2xl">
          {getInitials(title)}
        </span>
        {title && <span className="sr-only">{alt}</span>}
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-muted', aspect, className)}>
      <img
        src={coverImageUrl}
        alt={alt}
        loading={loading}
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
      />
    </div>
  )
}
