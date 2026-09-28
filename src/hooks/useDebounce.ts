import { useEffect, useState } from 'react'

/**
 * Debounce sebuah nilai (mis. input pencarian) agar tidak memicu
 * terlalu banyak permintaan ke database saat pengguna mengetik.
 */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => clearTimeout(timeout)
  }, [value, delay])

  return debouncedValue
}
