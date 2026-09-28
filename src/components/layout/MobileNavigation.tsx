import { NavLink } from 'react-router-dom'
import {
  BookOpen,
  BarChart3,
  FolderTree,
  HandCoins,
  LayoutDashboard,
  MapPin,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { NAV_ITEMS } from '@/constants'
import { cn } from '@/utils/cn'

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  BookOpen,
  HandCoins,
  BarChart3,
  FolderTree,
  MapPin,
  Settings,
}

/**
 * Navigasi bawah (bottom navigation) untuk perangkat mobile.
 * Menampilkan 5 menu utama agar selalu dapat dijangkau dengan ibu jari.
 */
export function MobileNavigation() {
  // Tampilkan 5 item pertama agar muat di layar kecil; Pengaturan tetap
  // bisa diakses melalui Dashboard/Sidebar.
  const items = NAV_ITEMS.slice(0, 5)

  return (
    <nav
      aria-label="Navigasi bawah"
      className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-md lg:hidden"
    >
      <ul className="flex items-stretch justify-around">
        {items.map((item) => {
          const Icon = ICONS[item.icon] ?? BookOpen
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )
                }
              >
                <Icon size={20} className="flex-shrink-0" aria-hidden="true" />
                <span className="line-clamp-1 px-1">{item.label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
