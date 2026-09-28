import { Star } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface RatingInputProps {
  value?: number | null
  onChange?: (value: number | null) => void
  max?: number
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  label?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

/**
 * Input rating bintang interaktif (0-5) dengan dukungan keyboard & layar sentuh.
 */
export function RatingInput({
  value,
  onChange,
  max = 5,
  size = 'md',
  disabled = false,
  label = 'Rating pribadi',
}: RatingInputProps) {
  const rating = value ?? 0

  const handleClick = (index: number) => {
    if (disabled || !onChange) return
    // Klik bintang yang sama sekali untuk mereset ke 0
    onChange(index === rating ? null : index)
  }

  return (
    <div>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      )}
      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label={label}
      >
        {Array.from({ length: max }, (_, i) => {
          const index = i + 1
          const isActive = index <= rating
          return (
            <button
              key={index}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={`${index} bintang`}
              disabled={disabled}
              onClick={() => handleClick(index)}
              className={cn(
                'rounded-md p-0.5 transition-transform hover:scale-110',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                disabled && 'cursor-not-allowed opacity-60 hover:scale-100'
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isActive
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-transparent text-muted-foreground/40'
                )}
              />
            </button>
          )
        })}
        <span className="ml-2 text-sm text-muted-foreground">
          {rating > 0 ? `${rating} dari ${max}` : 'Belum ada rating'}
        </span>
      </div>
    </div>
  )
}

/** Tampilan rating yang hanya bisa dibaca (halaman detail) */
export function RatingDisplay({
  value,
  max = 5,
  size = 'md',
}: {
  value?: number | null
  max?: number
  size?: 'sm' | 'md' | 'lg'
}) {
  const rating = value ?? 0
  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${rating} dari ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClasses[size],
            i < rating ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-muted-foreground/40'
          )}
          aria-hidden="true"
        />
      ))}
      <span className="ml-1.5 text-sm font-medium text-foreground">
        {rating > 0 ? rating : '-'}
      </span>
    </div>
  )
}
