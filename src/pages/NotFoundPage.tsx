import { Link } from 'react-router-dom'
import { BookX, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BookX size={32} aria-hidden="true" />
        </div>

        <p className="mb-2 text-5xl font-bold text-foreground">404</p>
        <h1 className="mb-2 text-lg font-semibold text-foreground">Halaman Tidak Ditemukan</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Maaf, halaman yang Anda cari tidak ada. Mungkin URL-nya salah atau halaman sudah dipindahkan.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/">
            <Button className="w-full sm:w-auto" leftIcon={<Home size={16} />}>
              Ke Beranda
            </Button>
          </Link>
          <Link to="/koleksi">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              leftIcon={<Search size={16} />}
            >
              Cari di Koleksi
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
