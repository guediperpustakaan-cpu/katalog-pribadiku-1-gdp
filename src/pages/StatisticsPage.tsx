import { BarChart3, BookOpen, Library, Star } from 'lucide-react'
import { PageHeader } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { DashboardCard } from '@/components/DashboardCard'
import { StatisticsChart } from '@/components/StatisticsChart'
import { EmptyState } from '@/components/EmptyState'
import { DashboardSkeleton } from '@/components/LoadingSkeleton'
import { useCollectionStats } from '@/hooks/queries'
import { formatNumber, formatPercent } from '@/utils/date'

export default function StatisticsPage() {
  const { data: stats, isLoading, isError } = useCollectionStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Statistik" subtitle="Ringkasan koleksi pustaka pribadi Anda." />
        <DashboardSkeleton />
      </div>
    )
  }

  if (isError || !stats) {
    return (
      <div className="space-y-6">
        <PageHeader title="Statistik" subtitle="Ringkasan koleksi pustaka pribadi Anda." />
        <Card className="p-6">
          <EmptyState
            icon={BarChart3}
            title="Statistik tidak dapat dimuat"
            description="Terjadi kesalahan saat memuat statistik. Silakan coba beberapa saat lagi."
          />
        </Card>
      </div>
    )
  }

  const hasBooks = stats.totalBooks > 0
  const readingProgress =
    stats.totalBooks > 0 ? Math.round((stats.readBooks / stats.totalBooks) * 100) : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistik"
        subtitle="Ringkasan koleksi pustaka pribadi Anda."
      />

      {/* Kartu ringkasan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          icon={Library}
          label="Total Buku"
          value={stats.totalBooks}
          hint="Seluruh koleksi Anda"
          accent="primary"
        />
        <DashboardCard
          icon={BookOpen}
          label="Sudah Dibaca"
          value={stats.readBooks}
          hint={`Sedang dibaca: ${formatNumber(stats.currentlyReading)}`}
          accent="success"
        />
        <DashboardCard
          icon={Star}
          label="Rating Rata-rata"
          value={stats.averageRating.toFixed(1)}
          hint={stats.averageRating > 0 ? `Dari ${formatNumber(stats.totalBooks)} buku` : 'Belum ada rating'}
          accent="warning"
        />
        <DashboardCard
          icon={BookOpen}
          label="Belum Dibaca"
          value={stats.unreadBooks}
          hint={readingProgress > 0 ? `${formatPercent(readingProgress / 100)} sudah dibaca` : 'Semua masih baru'}
          accent="info"
        />
      </div>

      {/* Progress membaca */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Progres Membaca</h3>
          <span className="text-sm font-medium text-primary">{readingProgress}%</span>
        </div>
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={readingProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Persentase buku yang sudah dibaca"
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {formatNumber(stats.readBooks)} dari {formatNumber(stats.totalBooks)} buku sudah selesai dibaca.
        </p>
      </Card>

      {!hasBooks ? (
        <Card className="p-6">
          <EmptyState
            icon={BarChart3}
            title="Belum ada data untuk ditampilkan"
            description="Tambahkan minimal satu buku untuk melihat statistik koleksi Anda."
          />
        </Card>
      ) : (
        <>
          {/* Chart kategori & lokasi */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <StatisticsChart
              type="bar"
              title="Buku per Kategori"
              description="Sebaran koleksi berdasarkan kategori"
              data={stats.byCategory}
              xLabel="Jumlah buku"
              showLegend={false}
            />
            <StatisticsChart
              type="bar"
              title="Buku per Lokasi"
              description="Sebaran koleksi berdasarkan lokasi penyimpanan"
              data={stats.byLocation}
              xLabel="Jumlah buku"
              showLegend={false}
            />
          </div>

          {/* Chart kondisi & tahun */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <StatisticsChart
              type="pie"
              title="Kondisi Buku"
              description="Proporsi kondisi fisik koleksi Anda"
              data={stats.byCondition}
              showLegend
            />
            <StatisticsChart
              type="line"
              title="Buku per Tahun Terbit"
              description="Tren penerbitan buku di koleksi Anda"
              data={stats.byYear}
              yLabel="Jumlah buku"
              showLegend={false}
            />
          </div>

          {/* Aktivitas menambah buku per bulan */}
          {stats.byMonth.length > 0 ? (
            <StatisticsChart
              type="bar"
              title="Buku Ditambahkan per Bulan"
              description="Aktivitas penambahan buku dalam 12 bulan terakhir"
              data={stats.byMonth.map((item) => ({
                id: item.date,
                name: item.date,
                count: item.count,
              }))}
              xLabel="Jumlah buku"
              showLegend={false}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
