import { useState, type ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNavigation } from '@/components/layout/MobileNavigation'
import { Header } from '@/components/layout/Header'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'

/**
 * Layout utama aplikasi: sidebar (desktop) + bottom navigation (mobile)
 * + header, dengan judul halaman otomatis berdasarkan rute aktif.
 */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Tutup sidebar otomatis setiap kali berpindah halaman
  const handleCloseSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-12">
          <div className="mx-auto w-full max-w-7xl">
            <ErrorBoundary key={location.pathname}>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      <MobileNavigation />
    </div>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

/** Judul halaman + tombol aksi yang dipakai ulang di tiap halaman */
export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div
      className={
        'mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ' + (className ?? '')
      }
    >
      <div className="space-y-1">
        <h2 className="page-title">{title}</h2>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
