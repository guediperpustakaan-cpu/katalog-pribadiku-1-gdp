import { type TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  showCount?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, showCount, maxLength, ...props }, ref) => (
    <>
      <textarea
        ref={ref}
        className={cn(
          'w-full resize-y rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground',
          'placeholder:text-muted-foreground/70',
          'focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/30',
          className
        )}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        {...props}
      />
      <div className="flex items-center justify-between">
        {error ? (
          <p className="mt-1 text-xs font-medium text-destructive">{error}</p>
        ) : (
          <span />
        )}
        {showCount && maxLength && (
          <span className="mt-1 text-xs text-muted-foreground">
            {(props.value as string)?.length ?? 0}/{maxLength}
          </span>
        )}
      </div>
    </>
  )
)
Textarea.displayName = 'Textarea'
