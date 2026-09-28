import { useRef, useState } from 'react'
import {
  Database,
  Download,
  FileDown,
  FileUp,
  Monitor,
  Moon,
  Sun,
  Type,
  Upload,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useTheme, type FontSize, type Theme } from '@/hooks/useTheme'
import { useAllBooks, useBulkCreateBooks, useCategories, useLocations } from '@/hooks/queries'
import { useBackendMode } from '@/hooks/useBackendMode'
import {
  addBom,
  booksToCsv,
  downloadFile,
  getCsvTemplate,
  parseCsv,
  validateCsvRows,
  type CsvRowResult,
} from '@/utils/csv'
import type { Book } from '@/types'
import { formatNumber } from '@/utils/date'
import { toast } from 'sonner'

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Terang', icon: Sun },
  { value: 'dark', label: 'Gelap', icon: Moon },
]

const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: 'kecil', label: 'Kecil' },
  { value: 'sedang', label: 'Sedang' },
  { value: 'besar', label: 'Besar' },
]

/** Konversi baris CSV yang valid menjadi input buku */
function rowToBookInput(data: Record<string, string>): Partial<Book> {
  const toNumber = (value: string | undefined): number | null => {
    if (!value) return null
    const num = Number(value)
    return Number.isNaN(num) ? null : num
  }

  return {
    title: data.title?.trim() ?? '',
    author: data.author?.trim() || null,
    isbn: data.isbn?.replace(/[-\s]/g, '').trim() || null,
    publisher: data.publisher?.trim() || null,
    publicationYear: toNumber(data.publicationYear),
    edition: data.edition?.trim() || null,
    language: data.language?.trim() || null,
    description: data.description?.trim() || null,
    pageCount: toNumber(data.pageCount),
    condition: (data.condition as Book['condition']) || 'baik',
    readingStatus: (data.readingStatus as Book['readingStatus']) || 'belum_dibaca',
    ownershipStatus: (data.ownershipStatus as Book['ownershipStatus']) || 'dimiliki',
    rating: toNumber(data.rating),
    notes: data.notes?.trim() || null,
    acquiredDate: data.acquiredDate || null,
  }
}

export default function SettingsPage() {
  const { theme, setTheme, fontSize, setFontSize } = useTheme()
  const backendMode = useBackendMode()
  const { data: books = [] } = useAllBooks()
  const { data: categories = [] } = useCategories()
  const { data: locations = [] } = useLocations()
  const bulkCreateBooks = useBulkCreateBooks()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importPreview, setImportPreview] = useState<CsvRowResult[] | null>(null)
  const [importing, setImporting] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  function handleExportCsv() {
    if (books.length === 0) {
      toast.info('Belum ada buku untuk diekspor.')
      return
    }
    try {
      const categoryName = (id?: string | null) =>
        categories.find((category) => category.id === id)?.name ?? ''
      const locationName = (id?: string | null) =>
        locations.find((location) => location.id === id)?.name ?? ''
      const csv = booksToCsv(books, categoryName, locationName)
      downloadFile(addBom(csv), `katalog-pribadiku-${new Date().toISOString().slice(0, 10)}.csv`)
      toast.success(`${formatNumber(books.length)} buku berhasil diekspor ke CSV.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengekspor CSV.')
    }
  }

  function handleDownloadTemplate() {
    try {
      downloadFile(addBom(getCsvTemplate()), 'template-katalog-buku.csv')
      toast.success('Template CSV berhasil diunduh.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengunduh template.')
    }
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Reset agar file yang sama bisa dipilih lagi nanti
    event.target.value = ''
    if (!file) return

    const reader = new FileReader()
    reader.onload = (loadEvent) => {
      try {
        const text = String(loadEvent.target?.result ?? '')
        const rows = parseCsv(text)
        if (rows.length === 0) {
          toast.error('File CSV kosong atau tidak terbaca.')
          return
        }

        const existingIsbns = new Set(
          books
            .map((book) => book.isbn?.replace(/[-\s]/g, ''))
            .filter((isbn): isbn is string => Boolean(isbn))
        )
        const results = validateCsvRows(rows, { existingIsbns })
        setImportPreview(results)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Gagal membaca file CSV.')
      }
    }
    reader.onerror = () => toast.error('Gagal membaca file.')
    reader.readAsText(file)
  }

  async function handleConfirmImport() {
    if (!importPreview) return
    const validRows = importPreview.filter((row) => row.isValid)
    if (validRows.length === 0) {
      toast.error('Tidak ada baris yang valid untuk diimpor.')
      return
    }

    setImporting(true)
    try {
      const inputs = validRows.map((row) => rowToBookInput(row.data))
      await bulkCreateBooks.mutateAsync(inputs)
      toast.success(`${formatNumber(inputs.length)} buku berhasil ditambahkan dari CSV.`)
      setImportPreview(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengimpor CSV.')
    } finally {
      setImporting(false)
    }
  }

  function handleBackupJson() {
    if (books.length === 0) {
      toast.info('Belum ada buku untuk dicadangkan.')
      return
    }
    try {
      const payload = {
        app: 'Katalog Pribadiku',
        exportedAt: new Date().toISOString(),
        books,
      }
      const json = JSON.stringify(payload, null, 2)
      downloadFile(json, `backup-katalog-${new Date().toISOString().slice(0, 10)}.json`, 'application/json')
      toast.success('Cadangan JSON berhasil diunduh.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat cadangan.')
    }
  }

  function handleConfirmReset() {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('katalog_pribadiku.books')) localStorage.removeItem(key)
      })
      toast.success('Data lokal berhasil dihapus. Muat ulang halaman untuk melihat perubahan.')
      setResetOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus data lokal.')
    }
  }

  const validCount = importPreview?.filter((row) => row.isValid).length ?? 0
  const errorCount = (importPreview?.length ?? 0) - validCount

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan"
        subtitle="Sesuaikan tampilan dan kelola data koleksi Anda."
      />

      {/* Tampilan */}
      <Card className="space-y-5 p-5">
        <div className="flex items-center gap-2">
          <Monitor size={18} className="text-primary" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-foreground">Tampilan</h3>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Tema</p>
          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon
              const active = theme === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  aria-pressed={active}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon size={16} />
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Type size={16} aria-hidden="true" /> Ukuran Font
          </p>
          <div className="grid grid-cols-3 gap-3 sm:max-w-md">
            {FONT_SIZE_OPTIONS.map((option) => {
              const active = fontSize === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFontSize(option.value)}
                  aria-pressed={active}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Ukuran font berlaku untuk seluruh aplikasi.
          </p>
        </div>
      </Card>

      {/* Data */}
      <Card className="space-y-5 p-5">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-primary" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-foreground">Data Koleksi</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          Saat ini ada <strong className="text-foreground">{formatNumber(books.length)}</strong> buku di koleksi Anda.
          {backendMode === 'local' ? ' Data disimpan secara lokal di perangkat ini.' : ' Data tersimpan di database Neon.'}
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            leftIcon={<FileDown size={16} />}
            disabled={books.length === 0}
          >
            Ekspor CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            leftIcon={<Download size={16} />}
          >
            Unduh Template CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<FileUp size={16} />}
          >
            Impor CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleBackupJson}
            leftIcon={<Upload size={16} />}
            disabled={books.length === 0}
          >
            Cadangkan (JSON)
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileSelected}
          className="hidden"
          aria-label="Pilih file CSV untuk diimpor"
        />

        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Catatan impor CSV:</p>
          <ul className="mt-1.5 list-inside list-disc space-y-1">
            <li>Kolom "Judul" wajib ada; kolom lainnya opsional.</li>
            <li>Format status & kondisi menerima teks bahasa Indonesia (mis. "Sudah dibaca", "Baru").</li>
            <li>ISBN duplikat dengan koleksi yang ada akan dilewati.</li>
            <li>Unduh template terlebih dahulu agar strukturnya sesuai.</li>
          </ul>
        </div>
      </Card>

      {/* Penyimpanan lokal */}
      <Card className="space-y-4 p-5">
        <h3 className="text-sm font-semibold text-foreground">Penyimpanan Lokal</h3>
        <p className="text-sm text-muted-foreground">
          Hapus seluruh data yang tersimpan secara lokal di perangkat ini. Tindakan ini tidak dapat
          dibatalkan.
        </p>
        <Button variant="danger" onClick={() => setResetOpen(true)}>
          Hapus Data Lokal
        </Button>
      </Card>

      {/* Preview impor */}
      <Modal
        isOpen={importPreview !== null}
        onClose={() => setImportPreview(null)}
        title="Pratinjau Impor CSV"
        description={
          importPreview
            ? `${formatNumber(validCount)} baris siap diimpor${errorCount > 0 ? `, ${formatNumber(errorCount)} baris bermasalah` : ''}.`
            : ''
        }
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setImportPreview(null)}
              disabled={importing}
            >
              Batal
            </Button>
            <Button
              onClick={handleConfirmImport}
              loading={importing}
              disabled={validCount === 0}
            >
              Impor {formatNumber(validCount)} Buku
            </Button>
          </div>
        }
      >
        {importPreview && importPreview.length > 0 ? (
          <div className="max-h-[50vh] space-y-2 overflow-y-auto">
            {importPreview.map((row) => (
              <div
                key={row.rowIndex}
                className={`rounded-lg border p-3 text-sm ${
                  row.isValid
                    ? 'border-border bg-background'
                    : 'border-destructive/40 bg-destructive/5'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">
                    Baris {row.rowIndex}: {row.data.title || '(tanpa judul)'}
                  </span>
                  {row.isValid ? (
                    <span className="text-xs font-medium text-success">Valid</span>
                  ) : (
                    <span className="text-xs font-medium text-destructive">Error</span>
                  )}
                </div>
                {row.errors.length > 0 ? (
                  <ul className="mt-1.5 list-inside list-disc text-xs text-destructive">
                    {row.errors.map((message, idx) => (
                      <li key={idx}>{message}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {row.data.author ? `oleh ${row.data.author}` : 'tanpa penulis'}
                    {row.data.isbn ? ` · ISBN ${row.data.isbn}` : ''}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Tidak ada baris untuk ditampilkan.</p>
        )}
      </Modal>

      <Modal
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Hapus Data Lokal"
        description="Seluruh data koleksi yang disimpan secara lokal di perangkat ini akan dihapus permanen. Pastikan Anda sudah mencadangkan data terlebih dahulu."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setResetOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleConfirmReset}>
              Ya, hapus
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Tindakan ini tidak dapat dibatalkan. Pastikan Anda sudah mencadangkan data penting.
        </p>
      </Modal>
    </div>
  )
}
