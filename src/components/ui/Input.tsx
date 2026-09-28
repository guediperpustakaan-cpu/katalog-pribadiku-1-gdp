import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Tampilkan pesan error di bawah input */
  error?: string
  /** Ikon di sebelah kiri input */
  leftIcon?: React.ReactNode
  /** Ikon di sebelah kanan input */
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, ...props }, ref) => {
    if (leftIcon || rightIcon) {
      return (
        <div className="relative">
          {leftIcon && (
            <span
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full rounded-lg border border-input bg-card py-2.5 text-sm text-foreground',
              'placeholder:text-muted-foreground/70',
              'focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30',
              'disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon ? 'pl-10' : 'pl-3.5',
              rightIcon ? 'pr-10' : 'pr-3.5',
              error && 'border-destructive focus:border-destructive focus:ring-destructive/30',
              className
            )}
            aria-invalid={Boolean(error)}
            {...props}
          />
          {rightIcon && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground">
              {rightIcon}
            </span>
          )}
          {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
        </div>
      )
    }

    return (
      <>
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground',
            'placeholder:text-muted-foreground/70',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/30',
            className
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
      </>
    )
  }
)
Input.displayName = 'Input'
