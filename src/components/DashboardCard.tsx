import { type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { formatNumber } from '@/utils/date'

export interface DashboardCardProps {
  /** Ikon yang mewakili metrik */
  icon: LucideIcon
  /** Label metrik dalam bahasa Indonesia */
  label: string
  /** Nilai numerik */
  value: number | string
  /** Warna aksen ikon */
  accent?: 'primary' | 'success' | 'warning' | 'info' | 'destructive'
  /** Deskripsi singkat di bawah nilai */
  hint?: string
  /** Rute tujuan saat kartu diklik */
  to?: string
  className?: string
}

const accentClasses = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  info: 'bg-info/10 text-info',
  destructive: 'bg-destructive/10 text-destructive',
} as const

/**
 * Kartu statistik untuk Dashboard. Nilai selalu diformat dalam format
 * bahasa Indonesia (pemisah ribuan).
 */
export function DashboardCard({
  icon: Icon,
  label,
  value,
  accent = 'primary',
  hint,
  to,
  className,
}: DashboardCardProps) {
  const displayValue = typeof value === 'number' ? formatNumber(value) : value

  const content = (
    <div
      className={cn(
        'card flex items-center gap-4 p-4 transition-all',
        to && 'cursor-pointer hover:shadow-md hover:border-primary/30',
        className
      )}
    >
      <div
        className={cn(
          'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl',
          accentClasses[accent]
        )}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold leading-tight text-foreground">{displayValue}</p>
        {hint && <p className="truncate text-[11px] text-muted-foreground">{hint}</p>}
      </div>
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="block">
        {content}
      </Link>
    )
  }

  return content
}
