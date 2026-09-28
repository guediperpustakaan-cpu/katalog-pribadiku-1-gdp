import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Tampilkan teks indikator debounce sedang berjalan */
  isSearching?: boolean
  autoFocus?: boolean
  onSubmit?: () => void
}

/**
 * Kolom pencarian dengan debounce yang dikelola oleh hook pemanggil,
 * agar jumlah permintaan ke database tetap sedikit saat pengguna mengetik.
 */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Cari judul, penulis, ISBN, atau catatan…',
  isSearching = false,
  autoFocus = false,
  onSubmit,
}: SearchBarProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit?.()
      }}
      className="w-full"
      role="search"
    >
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        leftIcon={<Search size={16} className={isSearching ? 'animate-pulse' : ''} />}
        rightIcon={
          value ? (
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Hapus pencarian"
              className="flex items-center justify-center rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X size={16} />
            </button>
          ) : null
        }
        aria-label="Pencarian buku"
      />
    </form>
  )
}
