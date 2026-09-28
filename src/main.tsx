import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import './styles/index.css'

/**
 * Konfigurasi TanStack Query:
 * - `retry: 1` agar tidak menahan UX terlalu lama saat server tidak ada
 * - `refetchOnWindowFocus: false` karena data koleksi bersifat pribadi
 *   dan tidak berubah dari sumber lain
 * - `staleTime` default mencegah refetch berlebihan
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
    mutations: {
      retry: 0,
    },
  },
})

const container = document.getElementById('root')
if (!container) {
  throw new Error('Elemen #root tidak ditemukan di index.html')
}

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      {/* Notifikasi toast (bahasa Indonesia) */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
        }}
      />
    </QueryClientProvider>
  </StrictMode>
)
