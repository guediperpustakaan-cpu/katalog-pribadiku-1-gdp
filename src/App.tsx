import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageSkeleton } from '@/components/LoadingSkeleton'

/**
 * Lazy loading seluruh halaman agar bundle awal tetap kecil
 * (code-splitting per route, lihat manualChunks di vite.config.ts).
 */
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const BookCollectionPage = lazy(() => import('@/pages/BookCollectionPage'))
const AddBookPage = lazy(() => import('@/pages/AddBookPage'))
const BookDetailPage = lazy(() => import('@/pages/BookDetailPage'))
const EditBookPage = lazy(() => import('@/pages/EditBookPage'))
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'))
const LocationsPage = lazy(() => import('@/pages/LocationsPage'))
const LoansPage = lazy(() => import('@/pages/LoansPage'))
const StatisticsPage = lazy(() => import('@/pages/StatisticsPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function PageFallback() {
  return <PageSkeleton />
}

/**
 * Aplikasi utama: mendefinisikan seluruh rute.
 * Semua rute dibungkus AppLayout (sidebar + header + bottom nav).
 */
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<PageFallback />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="koleksi"
          element={
            <Suspense fallback={<PageFallback />}>
              <BookCollectionPage />
            </Suspense>
          }
        />
        <Route
          path="buku/tambah"
          element={
            <Suspense fallback={<PageFallback />}>
              <AddBookPage />
            </Suspense>
          }
        />
        <Route
          path="buku/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <BookDetailPage />
            </Suspense>
          }
        />
        <Route
          path="buku/:id/edit"
          element={
            <Suspense fallback={<PageFallback />}>
              <EditBookPage />
            </Suspense>
          }
        />
        <Route
          path="kategori"
          element={
            <Suspense fallback={<PageFallback />}>
              <CategoriesPage />
            </Suspense>
          }
        />
        <Route
          path="lokasi"
          element={
            <Suspense fallback={<PageFallback />}>
              <LocationsPage />
            </Suspense>
          }
        />
        <Route
          path="peminjaman"
          element={
            <Suspense fallback={<PageFallback />}>
              <LoansPage />
            </Suspense>
          }
        />
        <Route
          path="statistik"
          element={
            <Suspense fallback={<PageFallback />}>
              <StatisticsPage />
            </Suspense>
          }
        />
        <Route
          path="pengaturan"
          element={
            <Suspense fallback={<PageFallback />}>
              <SettingsPage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<PageFallback />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}
