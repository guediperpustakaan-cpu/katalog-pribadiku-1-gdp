import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'
export type FontSize = 'kecil' | 'sedang' | 'besar'

const THEME_KEY = 'katalog_pribadiku.theme'
const FONT_SIZE_KEY = 'katalog_pribadiku.font_size'

const FONT_SIZE_CLASS: Record<FontSize, string> = {
  kecil: 'text-sm',
  sedang: 'text-base',
  besar: 'text-lg',
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialFontSize(): FontSize {
  if (typeof window === 'undefined') return 'sedang'
  const stored = localStorage.getItem(FONT_SIZE_KEY)
  if (stored === 'kecil' || stored === 'sedang' || stored === 'besar') return stored
  return 'sedang'
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [fontSize, setFontSizeState] = useState<FontSize>(getInitialFontSize)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(THEME_KEY, theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0f172a' : '#f8fafc')
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    Object.values(FONT_SIZE_CLASS).forEach((cls) => root.classList.remove(cls))
    root.classList.add(FONT_SIZE_CLASS[fontSize])
    localStorage.setItem(FONT_SIZE_KEY, fontSize)
  }, [fontSize])

  const setTheme = useCallback((next: Theme) => setThemeState(next), [])
  const toggleTheme = useCallback(
    () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')),
    []
  )
  const setFontSize = useCallback((next: FontSize) => setFontSizeState(next), [])

  return { theme, setTheme, toggleTheme, fontSize, setFontSize, fontSizes: FONT_SIZE_CLASS }
}
