import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Mengelola query parameter URL untuk menyimpan kondisi pencarian & filter,
 * agar bisa dibagikan (shareable) dan dipulihkan setelah halaman dimuat ulang.
 */
export function useUrlQuery<T extends Record<string, unknown>>() {
  const [searchParams, setSearchParams] = useSearchParams()

  const getQuery = useCallback((): Partial<T> => {
    const result: Record<string, unknown> = {}
    searchParams.forEach((value, key) => {
      const existing = result[key]
      if (existing !== undefined) {
        if (Array.isArray(existing)) {
          ;(existing as unknown[]).push(value)
        } else {
          result[key] = [existing, value]
        }
        return
      }
      result[key] = value
    })
    return result as Partial<T>
  }, [searchParams])

  const setQuery = useCallback(
    (next: Partial<T>, replace = false) => {
      const params = new URLSearchParams()
      Object.entries(next).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, String(v)))
        } else {
          params.set(key, String(value))
        }
      })
      setSearchParams(params, { replace })
    },
    [setSearchParams]
  )

  const patchQuery = useCallback(
    (patch: Partial<T>, replace = false) => {
      const current = getQuery()
      setQuery({ ...current, ...patch }, replace)
    },
    [getQuery, setQuery]
  )

  const resetQuery = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  return { getQuery, setQuery, patchQuery, resetQuery, searchParams }
}
