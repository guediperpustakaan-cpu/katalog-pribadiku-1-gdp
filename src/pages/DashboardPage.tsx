import { Link } from 'react-router-dom'
import {
  BookMarked,
  BookOpen,
  CheckCircle2,
  Clock,
  HandCoins,
  Library,
  MapPin,
  Plus,
  ScanLine,
  Star,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/AppLayout'
import { DashboardCard } from '@/components/DashboardCard'
import { BookCover } from '@/components/BookCover'
import { Button } from '@/components/ui/Button'
import { DashboardSkeleton, BookRowSkeleton } from '@/components/LoadingSkeleton'
import { EmptyState } from '@/components/EmptyState'
import { ReadingStatusBadge } from '@/components/StatusBadge'
import {
  useBooks,
  useDashboardStats,
} from '@/hooks/queries'
import { formatNumber, formatPercent } from '@/utils/date'
import { APP_NAME } from '@/constants'

/**
 * Halaman Dashboard: ringkasan koleksi, aksi cepat, dan buku terbaru.
 */
export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: recentBooks, isLoading: booksLoading } = useBooks({
    sort: 'created_at',
    order: 'desc',
    limit: 6,
    page: 1,
  })

  if (statsLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Dashboard" subtitle="Memuat ringkasan koleksi..." />
        <DashboardSkeleton />
      </div>
    )
  }

  const total = stats?.totalBooks ?? 0
  const readBooks = stats?.readBooks ?? 0
  const readingProgress = total > 0 ? (readBooks / total) * 100 : 0

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Selamat datang di ${APP_NAME}`}
        subtitle="Ringkasan koleksi buku pribadi Anda"
      />

      {/* ---------------- Aksi cepat ---------------- */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link to="/buku/tambah">
          <div className="card flex items-center gap-4 p-4 transition-all hover:shadow-md hover:border-primary/30">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Plus className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Tambah Buku</p>
              <p className="text-xs text-muted-foreground">Isi formulir manual 17 field</p>
            </div>
          </div>
        </Link>
        <Link to="/buku/tambah?scan=1">
          <div className="card flex items-center gap-4 p-4 transition-all hover:shadow-md hover:border-primary/30">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-info/10 text-info">
              <ScanLine className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Pindai ISBN</p>
              <p className="text-xs text-muted-foreground">Isi otomatis lewat kamera</p>
            </div>
          </div>
        </Link>
      </section>

      {/* ---------------- Kartu statistik ---------------- */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Statistik Koleksi</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <DashboardCard
            icon={Library}
            label="Total Buku"
            value={total}
            hint={`${formatNumber(stats?.totalPages ?? 0)} halaman`}
            to="/koleksi"
            accent="primary"
          />
          <DashboardCard
            icon={BookMarked}
            label="Sedang Dibaca"
            value={stats?.currentlyReading ?? 0}
            hint="Lagi seru-serunya"
            to="/koleksi?readingStatus=sedang_dibaca"
            accent="info"
          />
          <DashboardCard
            icon={CheckCircle2}
            label="Sudah Dibaca"
            value={readBooks}
            hint={`${formatPercent(readingProgress)} dari koleksi`}
            to="/koleksi?readingStatus=sudah_dibaca"
            accent="success"
          />
          <DashboardCard
            icon={HandCoins}
            label="Dipinjamkan"
            value={stats?.borrowedBooks ?? 0}
            hint={`${stats?.overdueLoans ?? 0} terlambat`}
            to="/peminjaman"
            accent="warning"
          />
          <DashboardCard
            icon={Clock}
            label="Belum Dibaca"
            value={stats?.unreadBooks ?? 0}
            hint="Masih menanti"
            to="/koleksi?readingStatus=belum_dibaca"
            accent="primary"
          />
          <DashboardCard
            icon={Star}
            label="Rating Rata-rata"
            value={stats?.averageRating ? stats.averageRating.toFixed(1) : '0,0'}
            hint="Dari buku yang diberi rating"
            to="/statistik"
            accent="info"
          />
          <DashboardCard
            icon={BookOpen}
            label="Kategori"
            value={stats?.totalCategories ?? 0}
            hint="Kelola di halaman Kategori"
            to="/kategori"
            accent="success"
          />
          <DashboardCard
            icon={MapPin}
            label="Lokasi Simpan"
            value={stats?.totalLocations ?? 0}
            hint="Kelola di halaman Lokasi"
            to="/lokasi"
            accent="warning"
          />
        </div>
      </section>

      {/* ---------------- Progress membaca ---------------- */}
      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Progres Membaca</h2>
          <span className="text-sm text-muted-foreground">
            {formatNumber(readBooks)} / {formatNumber(total)} buku
          </span>
        </div>
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={Math.round(readingProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Persentase buku yang sudah dibaca"
        >
          <div
            className="h-full rounded-full bg-success transition-all duration-500"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Anda telah menyelesaikan {formatPercent(readingProgress)} dari seluruh koleksi.
        </p>
      </section>

      {/* ---------------- Buku terbaru ---------------- */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Baru Ditambahkan</h2>
          <Link to="/koleksi">
            <Button variant="ghost" size="sm">
              Lihat semua
            </Button>
          </Link>
        </div>

        {booksLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <BookRowSkeleton key={index} />
            ))}
          </div>
        ) : recentBooks && recentBooks.data.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {recentBooks.data.map((book) => (
              <Link
                key={book.id}
                to={`/buku/${book.id}`}
                className="card overflow-hidden p-3 transition-all hover:shadow-md"
              >
                <BookCover
                  title={book.title}
                  coverImageUrl={book.coverImageUrl}
                  className="w-full shadow-sm"
                />
                <h3 className="mt-2.5 line-clamp-2 text-sm font-semibold text-foreground">
                  {book.title}
                </h3>
                {book.author && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {book.author}
                  </p>
                )}
                <div className="mt-2">
                  <ReadingStatusBadge status={book.readingStatus} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card">
            <EmptyState
              icon={BookOpen}
              title="Belum ada buku"
              description="Mulai katalog pertama Anda dengan menambahkan buku favorit."
              action={{ label: 'Tambah buku pertama', onClick: () => (window.location.href = '/buku/tambah') }}
            />
          </div>
        )}
      </section>
    </div>
  )
}
