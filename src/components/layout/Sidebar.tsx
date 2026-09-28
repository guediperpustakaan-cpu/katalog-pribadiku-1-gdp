import { NavLink, Link } from 'react-router-dom'
import {
  BookOpen,
  BarChart3,
  FolderTree,
  HandCoins,
  LayoutDashboard,
  MapPin,
  Settings,
  X,
  type LucideIcon,
} from 'lucide-react'
import { APP_NAME, NAV_ITEMS } from '@/constants'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  BookOpen,
  HandCoins,
  BarChart3,
  FolderTree,
  MapPin,
  Settings,
}

export interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  className?: string
}

/**
 * Sidebar navigasi untuk tampilan desktop (>= lg).
 * Pada layar kecil, sidebar dirender sebagai drawer yang bisa digeser.
 */
export function Sidebar({ isOpen = false, onClose, className }: SidebarProps) {
  return (
    <>
      {/* Overlay untuk mobile drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card pt-safe lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:translate-x-0 lg:shadow-none',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full',
          className
        )}
        aria-label="Navigasi utama"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen size={18} aria-hidden="true" />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-bold leading-tight text-foreground">
                {APP_NAME}
              </span>
              <span className="text-[11px] text-muted-foreground">Koleksi pribadi</span>
            </span>
          </Link>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Tutup menu navigasi"
              className="lg:hidden"
            >
              <X size={18} />
            </Button>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Menu
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.icon] ?? BookOpen
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  cn('nav-link', isActive && 'nav-link-active')
                }
              >
                <Icon size={18} className="flex-shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-border px-5 py-4">
          <Link
            to="/buku/tambah"
            onClick={onClose}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            <BookOpen size={16} aria-hidden="true" /> Tambah Buku
          </Link>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            {APP_NAME} · Disimpan dengan aman
          </p>
        </div>
      </aside>
    </>
  )
}
