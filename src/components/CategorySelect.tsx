import { type SelectHTMLAttributes } from 'react'
import { Select } from '@/components/ui/Select'
import type { Category } from '@/types'

interface CategorySelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  categories?: Category[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  error?: string
}

/**
 * Dropdown pemilihan kategori dengan opsi yang dimuat dari database.
 */
export function CategorySelect({
  categories,
  value,
  onChange,
  placeholder = 'Pilih kategori',
  error,
  ...props
}: CategorySelectProps) {
  return (
    <Select
      value={value ?? ''}
      onChange={(event) => onChange?.(event.target.value)}
      placeholder={placeholder}
      error={error}
      aria-label="Kategori"
      {...props}
    >
      {categories?.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </Select>
  )
}
