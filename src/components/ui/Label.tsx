import { type LabelHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Tanda bahwa field bersifat wajib */
  required?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'mb-1.5 flex items-center gap-1 text-sm font-medium text-foreground',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-destructive" aria-label="Wajib diisi">*</span>}
    </label>
  )
)
Label.displayName = 'Label'
