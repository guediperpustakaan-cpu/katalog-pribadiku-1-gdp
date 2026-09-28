/**
 * Utilitas umum untuk aplikasi.
 */

/** Membuat ID unik (UUID v4) - kompatibel dengan kolom UUID di Neon */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  // Fallback untuk browser lama
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/** Debounce sebuah fungsi agar tidak dipanggil terlalu sering */
export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

 /** Sleep helper untuk menunggu (mis. menunggu inisialisasi) */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Kapitalisasi huruf pertama */
export function capitalize(value: string): string {
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/** Potong teks panjang dengan elipsis */
export function truncate(text?: string | null, max = 120): string {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max).trim()}…` : text
}

/** Cek apakah nilai kosong (null, undefined, atau string kosong) */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  return false
}

/** Salin teks ke clipboard dengan fallback untuk browser lama */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  } catch {
    return false
  }
}

/** Ambil inisial dari judul/nama (untuk placeholder) */
export function getInitials(text?: string | null): string {
  if (!text) return '?'
  const words = text.trim().split(/\s+/)
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
}

/** Warna pastel deterministik dari string (untuk placeholder sampul) */
export function colorFromString(str: string): string {
  const colors = [
    'from-indigo-500 to-violet-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-purple-500 to-fuchsia-500',
    'from-teal-500 to-green-500',
    'from-sky-500 to-blue-500',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
