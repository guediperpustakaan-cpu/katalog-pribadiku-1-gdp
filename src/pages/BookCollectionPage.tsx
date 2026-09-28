import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, Rows3, ScanLine, SlidersHorizontal, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { SearchBar } from '@/components/SearchBar'
import { FilterPanel, type BookFilters } from '@/components/FilterPanel'
import { Pagination } from '@/components/Pagination'
import { BookCard } from '@/components/BookCard'
import { BookTable } from '@/components/BookTable'
import {
  BookGridSkeleton,
  BookListSkeleton,
} from '@/components/LoadingSkeleton'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { useBooks, useCategories, useLocations, useDeleteBook } from '@/hooks/queries'
import { useDebounce } from '@/hooks/useDebounce'
import {
  DEFAULT_PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
  SORT_OPTIONS,
} from '@/constants'
import type {
  BookQuery,
  BookWithRelations,
  SortDirection,
  SortField,
  ViewMode,
} from '@/types'
import { toast } from 'sonner'

const VIEW_KEY = 'katalog_pribadiku.view_mode'

function getInitialViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'grid'
  const stored = localStorage.getItem(VIEW_KEY)
  return stored === 'list' ? 'list' : 'grid'
}

/**
 * Halaman Koleksi Buku: grid & tabel, pencarian, 5 filter, 5+ opsi sorting,
 * pagination, debounce, dan semua kondisi tersimpan di URL query parameter.
 */
export default function BookCollectionPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: categories } = useCategories()
  const { data: locations } = useLocations()
  const deleteBook = useDeleteBook()

  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [bookToDelete, setBookToDelete] = useState<BookWithRelations | null>(null)

  // ---------- Filter dari URL ----------
  const search = searchParams.get('search') ?? ''
  const filters: BookFilters = {
    categoryId: searchParams.get('categoryId') ?? undefined,
    locationId: searchParams.get('locationId') ?? undefined,
    condition: searchParams.get('condition') ?? undefined,
    readingStatus: searchParams.get('readingStatus') ?? undefined,
    ownershipStatus: searchParams.get('ownershipStatus') ?? undefined,
    sort: searchParams.get('sort') ?? 'created_at:desc',
    order: (searchParams.get('order') as 'asc' | 'desc') ?? undefined,
  }
  const page = Number(searchParams.get('page') ?? 1)
  const limit = Number(searchParams.get('limit') ?? DEFAULT_PAGE_SIZE)

  // ---------- Debounce pencarian ----------
  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebounce(searchInput, SEARCH_DEBOUNCE_MS)

  // Sinkronkan input pencarian dengan URL saat URL berubah (mis. tombol back)
  useMemo(() => {
    if (search !== searchInput && search !== debouncedSearch) {
      setSearchInput(search)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const [sortField, sortDirection] = parseSort(filters.sort)

  const queryParams: BookQuery = {
    search: debouncedSearch || undefined,
    categoryId: filters.categoryId,
    locationId: filters.locationId,
    condition: filters.condition,
    readingStatus: filters.readingStatus,
    ownershipStatus: filters.ownershipStatus,
    sort: sortField,
    order: sortDirection,
    page,
    limit,
  }

  const { data, isLoading, isFetching, isError, error } = useBooks(queryParams)

  const books = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 0

  const activeFilterCount = [
    filters.categoryId,
    filters.locationId,
    filters.condition,
    filters.readingStatus,
    filters.ownershipStatus,
  ].filter(Boolean).length

  const updateQuery = (patch: Record<string, unknown>) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        next.delete(key)
      } else {
        next.set(key, String(value))
      }
    })
    // Setiap perubahan filter/sorting reset ke halaman 1
    if (!('page' in patch)) next.set('page', '1')
    setSearchParams(next, { replace: false })
  }

  const handleFilterChange = (patch: Partial<BookFilters>) => {
    updateQuery(patch)
  }

  const handleSortChange = (field: string) => {
    const [currentField, currentOrder] = parseSort(filters.sort)
    const nextOrder = currentField === field && currentOrder === 'desc' ? 'asc' : 'desc'
    const option = SORT_OPTIONS.find((o) => o.value.startsWith(`${field}:`))
    updateQuery({
      sort: option ? `${field}:${nextOrder}` : `${field}:${nextOrder}`,
      order: nextOrder,
    })
  }

  const handleResetFilters = () => {
    const next = new URLSearchParams()
    if (search) next.set('search', search)
    setSearchParams(next, { replace: true })
    setFilterModalOpen(false)
  }

  const handlePageChange = (nextPage: number) => {
    updateQuery({ page: nextPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem(VIEW_KEY, mode)
  }

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return
    try {
      await deleteBook.mutateAsync(bookToDelete.id)
      toast.success(`Buku "${bookToDelete.title}" berhasil dihapus.`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus buku.'
      toast.error(message)
    } finally {
      setBookToDelete(null)
    }
  }

  const hasBooks = books.length > 0
  const showEmpty = !isLoading && !hasBooks

  return (
    <div className="space-y-5">
      <PageHeader
        title="Koleksi Buku"
        subtitle={`Total ${total.toLocaleString('id-ID')} buku dalam koleksi`}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilterModalOpen(true)}
              leftIcon={<SlidersHorizontal size={15} />}
              className="lg:hidden"
            >
              Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
            <div className="flex items-center gap-1 rounded-lg border border-input bg-card p-1">
              <button
                type="button"
                onClick={() => handleViewModeChange('grid')}
                aria-pressed={viewMode === 'grid'}
                aria-label="Tampilan grid"
                title="Tampilan grid"
                className={`flex h-8 w-9 items-center justify-center rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <LayoutGrid size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('list')}
                aria-pressed={viewMode === 'list'}
                aria-label="Tampilan tabel"
                title="Tampilan tabel"
                className={`flex h-8 w-9 items-center justify-center rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Rows3 size={16} aria-hidden="true" />
              </button>
            </div>
          </>
        }
      />

      {/* ---------- Pencarian ---------- */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <SearchBar
            value={searchInput}
            onChange={(value) => {
              setSearchInput(value)
              updateQuery({ search: value })
            }}
            isSearching={isFetching && !isLoading}
            placeholder="Cari judul, penulis, ISBN, atau catatan…"
          />
        </div>
        <a href="/buku/tambah?scan=1" className="hidden sm:block">
          <Button variant="outline" size="md" leftIcon={<ScanLine size={15} />}>
            Pindai ISBN
          </Button>
        </a>
      </div>

      {/* ---------- Filter (desktop inline) ---------- */}
      <div className="hidden lg:block">
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          categories={categories}
          locations={locations}
          layout="inline"
          activeFilterCount={activeFilterCount}
        />
      </div>

      {/* ---------- Loading ---------- */}
      {isLoading ? (
        viewMode === 'grid' ? (
          <BookGridSkeleton count={10} />
        ) : (
          <BookListSkeleton count={6} />
        )
      ) : isError ? (
        <div className="card">
          <EmptyState
            icon={X}
            title="Gagal memuat koleksi"
            description={
              error instanceof Error
                ? error.message
                : 'Terjadi kesalahan saat memuat data. Coba lagi.'
            }
            action={{ label: 'Muat ulang', onClick: () => window.location.reload() }}
          />
        </div>
      ) : showEmpty ? (
        <div className="card">
          <EmptyState
            icon={LayoutGrid}
            title={search || activeFilterCount > 0 ? 'Buku tidak ditemukan' : 'Koleksi masih kosong'}
            description={
              search || activeFilterCount > 0
                ? 'Coba ubah kata kunci pencarian atau atur ulang filter yang aktif.'
                : 'Tambahkan buku pertama Anda untuk mulai mengelola koleksi.'
            }
            action={{
              label: search || activeFilterCount > 0 ? 'Reset filter' : 'Tambah buku',
              onClick: () =>
                search || activeFilterCount > 0
                  ? handleResetFilters()
                  : (window.location.href = '/buku/tambah'),
            }}
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onDelete={setBookToDelete} />
          ))}
        </div>
      ) : (
        <BookTable
          books={books}
          onDelete={setBookToDelete}
          sort={sortField}
          order={sortDirection}
          onSort={handleSortChange}
        />
      )}

      {/* ---------- Pagination ---------- */}
      {hasBooks && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={handlePageChange}
        />
      )}

      {/* ---------- Filter modal (mobile) ---------- */}
      <Modal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        size="md"
        title="Filter & Urutkan"
        description="Saring koleksi buku sesuai kebutuhan."
        footer={
          <div className="flex w-full items-center justify-between">
            <Button variant="ghost" onClick={handleResetFilters} disabled={activeFilterCount === 0}>
              Reset
            </Button>
            <Button variant="primary" onClick={() => setFilterModalOpen(false)}>
              Terapkan filter
            </Button>
          </div>
        }
      >
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          categories={categories}
          locations={locations}
          layout="stacked"
          activeFilterCount={activeFilterCount}
        />
      </Modal>

      {/* ---------- Konfirmasi hapus ---------- */}
      <ConfirmDialog
        isOpen={Boolean(bookToDelete)}
        onClose={() => setBookToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus buku ini?"
        description={`Buku "${bookToDelete?.title}" akan dihapus permanen dari koleksi Anda. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, hapus"
        loading={deleteBook.isPending}
      />
    </div>
  )
}

function parseSort(sort?: string): [SortField, SortDirection] {
  if (!sort) return ['created_at', 'desc']
  const [field, order] = sort.split(':')
  return [
    (field ?? 'created_at') as SortField,
    order === 'asc' ? 'asc' : 'desc',
  ]
}
