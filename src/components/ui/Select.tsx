import { type SelectHTMLAttributes, forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  options?: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, children, ...props }, ref) => (
    <>
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full appearance-none rounded-lg border border-input bg-card py-2.5 pl-3.5 pr-10 text-sm text-foreground',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/30',
            className
          )}
          aria-invalid={Boolean(error)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground"
          size={16}
          aria-hidden="true"
        />
      </div>
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </>
  )
)
Select.displayName = 'Select'
