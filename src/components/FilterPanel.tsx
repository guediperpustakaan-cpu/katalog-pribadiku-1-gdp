import { Filter, RotateCcw } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import { CategorySelect } from '@/components/CategorySelect'
import { LocationSelect } from '@/components/LocationSelect'
import {
  CONDITION_OPTIONS,
  OWNERSHIP_STATUS_OPTIONS,
  READING_STATUS_OPTIONS,
  SORT_OPTIONS,
} from '@/constants'
import type { Category, StorageLocation } from '@/types'

export interface BookFilters {
  categoryId?: string
  locationId?: string
  condition?: string
  readingStatus?: string
  ownershipStatus?: string
  sort?: string
  order?: 'asc' | 'desc'
}

export interface FilterPanelProps {
  filters: BookFilters
  onFilterChange: (patch: Partial<BookFilters>) => void
  onReset: () => void
  categories?: Category[]
  locations?: StorageLocation[]
  /** Tampilan panel: baris (inline di desktop) atau blok (di modal mobile) */
  layout?: 'inline' | 'stacked'
  activeFilterCount?: number
}

/**
 * Panel filter & pengurutan koleksi buku.
 * Semua kondisi tersimpan di URL query parameter (lihat useUrlQuery).
 */
export function FilterPanel({
  filters,
  onFilterChange,
  onReset,
  categories,
  locations,
  layout = 'inline',
  activeFilterCount = 0,
}: FilterPanelProps) {
  const isStacked = layout === 'stacked'

  return (
    <div className={isStacked ? 'space-y-4' : 'space-y-3'}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter size={16} aria-hidden="true" />
          Filter
          {activeFilterCount > 0 && (
            <span className="badge bg-primary/10 text-primary">{activeFilterCount} aktif</span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Reset filter
          </button>
        )}
      </div>

      <div
        className={
          isStacked
            ? 'space-y-3'
            : 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6'
        }
      >
        <div>
          <label className="label-field" htmlFor="filter-category">
            Kategori
          </label>
          <CategorySelect
            id="filter-category"
            categories={categories}
            value={filters.categoryId ?? ''}
            onChange={(value) => onFilterChange({ categoryId: value })}
          />
        </div>

        <div>
          <label className="label-field" htmlFor="filter-location">
            Lokasi
          </label>
          <LocationSelect
            id="filter-location"
            locations={locations}
            value={filters.locationId ?? ''}
            onChange={(value) => onFilterChange({ locationId: value })}
          />
        </div>

        <div>
          <label className="label-field" htmlFor="filter-condition">
            Kondisi
          </label>
          <Select
            id="filter-condition"
            value={filters.condition ?? ''}
            onChange={(event) => onFilterChange({ condition: event.target.value })}
            options={CONDITION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
        </div>

        <div>
          <label className="label-field" htmlFor="filter-reading">
            Status membaca
          </label>
          <Select
            id="filter-reading"
            value={filters.readingStatus ?? ''}
            onChange={(event) => onFilterChange({ readingStatus: event.target.value })}
            options={READING_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
        </div>

        <div>
          <label className="label-field" htmlFor="filter-ownership">
            Status kepemilikan
          </label>
          <Select
            id="filter-ownership"
            value={filters.ownershipStatus ?? ''}
            onChange={(event) => onFilterChange({ ownershipStatus: event.target.value })}
            options={OWNERSHIP_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
        </div>

        <div>
          <label className="label-field" htmlFor="filter-sort">
            Urutkan
          </label>
          <Select
            id="filter-sort"
            value={filters.sort ? `${filters.sort}:${filters.order ?? 'desc'}` : 'created_at:desc'}
            onChange={(event) => {
              const [sort, order] = event.target.value.split(':')
              onFilterChange({ sort, order: (order as 'asc' | 'desc') ?? 'desc' })
            }}
            options={SORT_OPTIONS}
          />
        </div>
      </div>
    </div>
  )
}
