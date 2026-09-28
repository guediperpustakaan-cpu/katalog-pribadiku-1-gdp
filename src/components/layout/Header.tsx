import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Cloud, CloudOff, Menu, Moon, Plus, Sun } from 'lucide-react'
import { NAV_ITEMS } from '@/constants'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/hooks/useTheme'
import { useBackendMode } from '@/hooks/useBackendMode'

export interface HeaderProps {
  /** Judul halaman yang sedang aktif */
  title?: string
  onOpenSidebar?: () => void
  className?: string
}

/**
 * Header atas: judul halaman, indikator mode penyimpanan (Neon vs lokal),
 * tombol ganti tema, dan tombol tambah buku.
 */
export function Header({ title, onOpenSidebar, className }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const backendMode = useBackendMode()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const activeItem = NAV_ITEMS.find(
    (item) =>
      item.to === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(item.to)
  )

  const pageTitle =
    title ?? activeItem?.label ?? (location.pathname.startsWith('/buku') ? 'Buku' : 'Dashboard')

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md pt-safe',
        className
      )}
    >
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        {onOpenSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSidebar}
            aria-label="Buka menu navigasi"
            className="lg:hidden"
          >
            <Menu size={20} />
          </Button>
        )}

        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground lg:hidden">
            <BookOpen size={16} aria-hidden="true" />
          </span>
          <h1 className="page-title truncate">{pageTitle}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Indikator mode penyimpanan */}
          <span
            className={cn(
              'hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex',
              backendMode === 'remote'
                ? 'bg-success/10 text-success'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            )}
            title={
              backendMode === 'remote'
                ? 'Tersambung ke database Neon PostgreSQL'
                : 'Menggunakan penyimpanan lokal browser'
            }
          >
            {backendMode === 'remote' ? (
              <Cloud size={13} aria-hidden="true" />
            ) : (
              <CloudOff size={13} aria-hidden="true" />
            )}
            {backendMode === 'remote' ? 'Neon' : 'Lokal'}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            title={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          <Link to="/buku/tambah">
            <Button variant="primary" size="sm" leftIcon={<Plus size={15} />} className="hidden sm:inline-flex">
              Tambah Buku
            </Button>
          </Link>
          <Link to="/buku/tambah">
            <Button
              variant="primary"
              size="icon"
              aria-label="Tambah buku"
              className="sm:hidden"
            >
              <Plus size={18} />
            </Button>
          </Link>
        </div>
      </div>

      {/* Menu dropdown cepat untuk mobile */}
      {menuOpen && (
        <nav className="border-t border-border bg-card px-4 py-3 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className="nav-link"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
