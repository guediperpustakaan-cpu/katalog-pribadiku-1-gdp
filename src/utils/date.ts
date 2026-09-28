import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

/**
 * Parse berbagai input tanggal menjadi objek Date yang valid.
 * Menangani ISO string, objek Date, atau null.
 */
export function parseDate(value?: string | Date | null): Date | null {
  if (!value) return null
  const date = value instanceof Date ? value : parseISO(String(value))
  return isValid(date) ? date : null
}

/**
 * Format tanggal ke format Indonesia, contoh: "21 September 2026"
 */
export function formatDate(value?: string | Date | null): string {
  const date = parseDate(value)
  if (!date) return '-'
  return format(date, 'd MMMM yyyy', { locale: idLocale })
}

/**
 * Format tanggal dengan waktu, contoh: "21 September 2026, 14.30"
 */
export function formatDateTime(value?: string | Date | null): string {
  const date = parseDate(value)
  if (!date) return '-'
  return format(date, 'd MMMM yyyy, HH.mm', { locale: idLocale })
}

/**
 * Format tanggal singkat, contoh: "21 Sep 2026"
 */
export function formatDateShort(value?: string | Date | null): string {
  const date = parseDate(value)
  if (!date) return '-'
  return format(date, 'd MMM yyyy', { locale: idLocale })
}

/**
 * Format tanggal menjadi kalimat relatif, contoh: "3 hari yang lalu"
 */
export function formatRelative(value?: string | Date | null): string {
  const date = parseDate(value)
  if (!date) return '-'
  return formatDistanceToNow(date, { addSuffix: true, locale: idLocale })
}

/**
 * Format bulan dan tahun, contoh: "September 2026"
 */
export function formatMonthYear(value?: string | Date | null): string {
  const date = parseDate(value)
  if (!date) return '-'
  return format(date, 'MMMM yyyy', { locale: idLocale })
}

/**
 * Hitung selisih hari dari hari ini ke tanggal target.
 * Hasil negatif berarti tanggal sudah lewat.
 */
export function daysUntil(value?: string | Date | null): number | null {
  const date = parseDate(value)
  if (!date) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Cek apakah tanggal sudah lewat dari hari ini.
 */
export function isOverdue(value?: string | Date | null): boolean {
  const diff = daysUntil(value)
  return diff !== null && diff < 0
}

/**
 * Tanggal hari ini dalam format ISO (yyyy-MM-dd) untuk input <input type="date">
 */
export function todayISODate(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Konversi nilai apapun ke format ISO date (yyyy-MM-dd)
 */
export function toISODate(value?: string | Date | null): string | null {
  const date = parseDate(value)
  return date ? format(date, 'yyyy-MM-dd') : null
}

/**
 * Format angka dengan pemisah ribuan gaya Indonesia, contoh: "1.234"
 */
export function formatNumber(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '0'
  return new Intl.NumberFormat('id-ID').format(value)
}

/**
 * Format angka desimal, contoh: "4,5"
 */
export function formatDecimal(value?: number | null, fractionDigits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '0'
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

/**
 * Format persentase, contoh: "75%"
 */
export function formatPercent(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '0%'
  return new Intl.NumberFormat('id-ID', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value / 100)
}
