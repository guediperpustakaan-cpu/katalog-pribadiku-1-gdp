import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:ring-primary/40',
  secondary:
    'border border-input bg-card text-foreground hover:bg-secondary focus-visible:ring-ring/40',
  outline:
    'border border-primary/30 bg-transparent text-primary hover:bg-accent hover:text-accent-foreground focus-visible:ring-primary/40',
  ghost: 'text-foreground/80 hover:bg-secondary hover:text-foreground focus-visible:ring-ring/40',
  danger:
    'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/40',
  success:
    'bg-success text-success-foreground shadow-sm hover:bg-success/90 focus-visible:ring-success/40',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'h-10 w-10 p-0',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium',
          'transition-all active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'
