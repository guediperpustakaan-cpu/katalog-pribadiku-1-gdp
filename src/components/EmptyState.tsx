import { type LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * Empty state informatif yang ditampilkan ketika belum ada data.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 px-6 py-12 text-center sm:py-20',
        className
      )}
    >
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-primary sm:h-20 sm:w-20">
          <Icon className="h-8 w-8 sm:h-10 sm:w-10" aria-hidden="true" />
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h3>
        {description && (
          <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {(action || secondaryAction) && (
        <div className="flex flex-col gap-2 sm:flex-row">
          {action && (
            <button
              onClick={action.onClick}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
