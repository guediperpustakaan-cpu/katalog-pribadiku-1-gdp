import type {
  BookCondition,
  LoanStatus,
  OwnershipStatus,
  ReadingStatus,
} from '@/types'

/** Nama aplikasi */
export const APP_NAME = 'Katalog Pribadiku'

/** ID pengguna default untuk pemakaian pribadi (single-user) */
export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'

/** Jumlah item per halaman pada koleksi buku */
export const DEFAULT_PAGE_SIZE = 12

/** Batas ukuran file gambar sampul (5 MB) */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024

/** Lebar maksimum gambar setelah dikompresi (thumbnail) */
export const IMAGE_THUMBNAIL_WIDTH = 400
/** Lebar maksimum gambar setelah dikompresi (resolusi penuh) */
export const IMAGE_FULL_WIDTH = 1200

/** Durasi debounce pencarian (ms) */
export const SEARCH_DEBOUNCE_MS = 350

/** Kategori awal yang disediakan aplikasi */
export const DEFAULT_CATEGORIES = [
  'Fiksi',
  'Nonfiksi',
  'Teknologi',
  'Bisnis',
  'Sejarah',
  'Agama',
  'Pendidikan',
  'Biografi',
  'Komik',
  'Novel',
  'Lainnya',
]

/** Lokasi penyimpanan contoh */
export const DEFAULT_LOCATIONS = [
  { name: 'Rak A', description: 'Rak buku utama di ruang tamu' },
  { name: 'Rak B', description: 'Rak buku utama di ruang tamu' },
  { name: 'Lemari kamar', description: 'Lemari di kamar tidur' },
  { name: 'Ruang tamu', description: 'Meja samping sofa' },
  { name: 'Kardus 1', description: 'Kardus di gudang' },
  { name: 'Kardus 2', description: 'Kardus cadangan di gudang' },
]

/** Pilihan status membaca dengan label bahasa Indonesia */
export const READING_STATUS_OPTIONS: {
  value: ReadingStatus
  label: string
  badge: string
}[] = [
  { value: 'belum_dibaca', label: 'Belum dibaca', badge: 'bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300' },
  { value: 'sedang_dibaca', label: 'Sedang dibaca', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  { value: 'sudah_dibaca', label: 'Sudah dibaca', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  { value: 'tidak_ingin_dibaca', label: 'Tidak ingin dibaca', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
]

/** Pilihan status kepemilikan dengan label bahasa Indonesia */
export const OWNERSHIP_STATUS_OPTIONS: {
  value: OwnershipStatus
  label: string
  badge: string
}[] = [
  { value: 'dimiliki', label: 'Dimiliki', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  { value: 'dipinjamkan', label: 'Dipinjamkan', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  { value: 'hilang', label: 'Hilang', badge: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300' },
  { value: 'ingin_dijual', label: 'Ingin dijual', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300' },
  { value: 'rusak', label: 'Rusak', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300' },
]

/** Pilihan kondisi buku */
export const CONDITION_OPTIONS: {
  value: BookCondition
  label: string
  badge: string
}[] = [
  { value: 'baru', label: 'Baru', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  { value: 'sangat_baik', label: 'Sangat baik', badge: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300' },
  { value: 'baik', label: 'Baik', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  { value: 'cukup', label: 'Cukup', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  { value: 'rusak', label: 'Rusak', badge: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300' },
]

/** Pilihan status peminjaman */
export const LOAN_STATUS_OPTIONS: {
  value: LoanStatus
  label: string
  badge: string
}[] = [
  { value: 'dipinjam', label: 'Sedang dipinjam', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  { value: 'terlambat', label: 'Terlambat dikembalikan', badge: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300' },
  { value: 'dikembalikan', label: 'Sudah dikembalikan', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
]

/** Pilihan pengurutan buku */
export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'created_at:desc', label: 'Terbaru ditambahkan' },
  { value: 'created_at:asc', label: 'Terlama ditambahkan' },
  { value: 'title:asc', label: 'Judul (A-Z)' },
  { value: 'title:desc', label: 'Judul (Z-A)' },
  { value: 'author:asc', label: 'Penulis (A-Z)' },
  { value: 'publication_year:desc', label: 'Tahun terbit (terbaru)' },
  { value: 'publication_year:asc', label: 'Tahun terbit (terlama)' },
  { value: 'rating:desc', label: 'Rating (tertinggi)' },
]

/** Item menu navigasi */
export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { to: '/koleksi', label: 'Koleksi Buku', icon: 'BookOpen' },
  { to: '/peminjaman', label: 'Peminjaman', icon: 'HandCoins' },
  { to: '/statistik', label: 'Statistik', icon: 'BarChart3' },
  { to: '/kategori', label: 'Kategori', icon: 'FolderTree' },
  { to: '/lokasi', label: 'Lokasi Simpan', icon: 'MapPin' },
  { to: '/pengaturan', label: 'Pengaturan', icon: 'Settings' },
] as const

// Fungsi pembantu untuk mendapatkan label dari sebuah nilai status

export function getReadingStatusLabel(value?: string | null): string {
  return READING_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? 'Belum dibaca'
}

export function getReadingStatusBadge(value?: string | null): string {
  return (
    READING_STATUS_OPTIONS.find((o) => o.value === value)?.badge ??
    'bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300'
  )
}

export function getOwnershipStatusLabel(value?: string | null): string {
  return OWNERSHIP_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? 'Dimiliki'
}

export function getOwnershipStatusBadge(value?: string | null): string {
  return (
    OWNERSHIP_STATUS_OPTIONS.find((o) => o.value === value)?.badge ??
    'bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300'
  )
}

export function getConditionLabel(value?: string | null): string {
  return CONDITION_OPTIONS.find((o) => o.value === value)?.label ?? 'Baik'
}

export function getConditionBadge(value?: string | null): string {
  return (
    CONDITION_OPTIONS.find((o) => o.value === value)?.badge ??
    'bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300'
  )
}

export function getLoanStatusLabel(value?: string | null): string {
  return LOAN_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? 'Sedang dipinjam'
}

export function getLoanStatusBadge(value?: string | null): string {
  return (
    LOAN_STATUS_OPTIONS.find((o) => o.value === value)?.badge ??
    'bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300'
  )
}

/** Icon penanda untuk tiap status (agar tidak hanya mengandalkan warna) */
export const STATUS_ICONS: Record<string, string> = {
  belum_dibaca: 'Book',
  sedang_dibaca: 'Bookmark',
  sudah_dibaca: 'CheckCircle2',
  tidak_ingin_dibaca: 'XCircle',
  dimiliki: 'Check',
  dipinjamkan: 'HandCoins',
  hilang: 'SearchX',
  ingin_dijual: 'Tag',
  rusak: 'AlertTriangle',
  baru: 'Sparkles',
  sangat_baik: 'Star',
  baik: 'ThumbsUp',
  cukup: 'Minus',
  rusak_condition: 'Wrench',
  dipinjam: 'Clock',
  terlambat: 'AlertOctagon',
  dikembalikan: 'CheckCheck',
}
