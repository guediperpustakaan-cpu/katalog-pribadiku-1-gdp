import { type HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Ikon opsional untuk penanda status (agar tidak hanya mengandalkan warna) */
  icon?: React.ReactNode
}

export function Badge({ className, icon, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  )
}
