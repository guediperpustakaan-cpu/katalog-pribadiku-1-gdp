import { type SelectHTMLAttributes } from 'react'
import { Select } from '@/components/ui/Select'
import type { StorageLocation } from '@/types'

interface LocationSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  locations?: StorageLocation[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  error?: string
}

/**
 * Dropdown pemilihan lokasi penyimpanan buku.
 */
export function LocationSelect({
  locations,
  value,
  onChange,
  placeholder = 'Pilih lokasi penyimpanan',
  error,
  ...props
}: LocationSelectProps) {
  return (
    <Select
      value={value ?? ''}
      onChange={(event) => onChange?.(event.target.value)}
      placeholder={placeholder}
      error={error}
      aria-label="Lokasi penyimpanan"
      {...props}
    >
      {locations?.map((location) => (
        <option key={location.id} value={location.id}>
          {location.name}
        </option>
      ))}
    </Select>
  )
}
