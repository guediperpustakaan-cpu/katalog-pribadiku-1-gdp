import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookX,
  Check,
  HandCoins,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { BookCover } from '@/components/BookCover'
import { LoanStatusBadge } from '@/components/StatusBadge'
import { TableRowSkeleton } from '@/components/LoadingSkeleton'
import {
  useAllBooks,
  useCreateLoan,
  useDeleteLoan,
  useLoans,
  useUpdateLoan,
} from '@/hooks/queries'
import type { Loan } from '@/types'
import { loanFormSchema, type LoanFormValues } from '@/utils/validation'
import { formatDate, isOverdue, daysUntil, toISODate } from '@/utils/date'
import { toast } from 'sonner'

type LoanTab = 'active' | 'overdue' | 'returned' | 'all'

const TABS: { value: LoanTab; label: string }[] = [
  { value: 'active', label: 'Aktif' },
  { value: 'overdue', label: 'Terlambat' },
  { value: 'returned', label: 'Dikembalikan' },
  { value: 'all', label: 'Semua' },
]

function todayIso(): string {
  return toISODate(new Date()) ?? ''
}

function loanMatchesTab(loan: Loan, tab: LoanTab): boolean {
  switch (tab) {
    case 'active':
      return loan.status !== 'dikembalikan' && !isOverdue(loan.dueAt)
    case 'overdue':
      return loan.status !== 'dikembalikan' && isOverdue(loan.dueAt)
    case 'returned':
      return loan.status === 'dikembalikan'
    case 'all':
      return true
  }
}

interface LoanRowProps {
  loan: Loan
  onReturn: (loan: Loan) => void
  onDelete: (loan: Loan) => void
}

function LoanRow({ loan, onReturn, onDelete }: LoanRowProps) {
  const overdue = loan.status !== 'dikembalikan' && isOverdue(loan.dueAt)
  const book = loan.book
  const dueDays = daysUntil(loan.dueAt)

  return (
    <Card className={`p-4 ${overdue ? 'border-destructive/50 bg-destructive/5' : ''}`}>
      <div className="flex gap-4">
        <div className="flex-none">
          {book ? (
            <Link to={`/buku/${book.id}`} aria-label={`Lihat detail ${book.title}`}>
              <BookCover title={book.title} coverImageUrl={book.coverImageUrl} className="h-24 w-16" />
            </Link>
          ) : (
            <div className="flex h-24 w-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <BookX size={20} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                to={book ? `/buku/${book.id}` : '#'}
                className="block truncate font-semibold text-foreground hover:underline"
              >
                {book?.title ?? 'Buku tidak ditemukan'}
              </Link>
              <p className="truncate text-sm text-muted-foreground">
                {book?.author || 'Penulis tidak diketahui'}
              </p>
            </div>
            <LoanStatusBadge status={loan.status} />
          </div>

          <div className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Peminjam: </span>
              <span className="font-medium text-foreground">{loan.borrowerName}</span>
            </p>
            {loan.borrowerContact ? (
              <p>
                <span className="text-muted-foreground">Kontak: </span>
                <span className="font-medium text-foreground">{loan.borrowerContact}</span>
              </p>
            ) : null}
            <p>
              <span className="text-muted-foreground">Dipinjam: </span>
              <span className="font-medium text-foreground">{formatDate(loan.borrowedAt)}</span>
            </p>
            {loan.dueAt ? (
              <p>
                <span className="text-muted-foreground">Jatuh tempo: </span>
                <span className={`font-medium ${overdue ? 'text-destructive' : 'text-foreground'}`}>
                  {formatDate(loan.dueAt)}
                  {overdue ? ` (terlambat ${Math.abs(dueDays ?? 0)} hari)` : ''}
                </span>
              </p>
            ) : (
              <p>
                <span className="text-muted-foreground">Jatuh tempo: </span>
                <span className="italic text-muted-foreground">Tidak ditentukan</span>
              </p>
            )}
            {loan.returnedAt ? (
              <p>
                <span className="text-muted-foreground">Dikembalikan: </span>
                <span className="font-medium text-foreground">{formatDate(loan.returnedAt)}</span>
              </p>
            ) : null}
          </div>

          {loan.notes ? (
            <p className="text-sm italic text-muted-foreground">"{loan.notes}"</p>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-1">
            {loan.status !== 'dikembalikan' ? (
              <Button
                variant="success"
                size="sm"
                onClick={() => onReturn(loan)}
                leftIcon={<Check size={14} />}
              >
                Tandai Dikembalikan
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onReturn(loan)}
                leftIcon={<RotateCcw size={14} />}
              >
                Batal Pengembalian
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(loan)}
              leftIcon={<Trash2 size={14} />}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              Hapus
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function LoansPage() {
  const [activeTab, setActiveTab] = useState<LoanTab>('active')

  const { data: loans = [], isLoading } = useLoans()
  const { data: books = [] } = useAllBooks()

  const createLoan = useCreateLoan()
  const updateLoan = useUpdateLoan()
  const deleteLoan = useDeleteLoan()

  const [formOpen, setFormOpen] = useState(false)
  const [values, setValues] = useState<LoanFormValues>({
    bookId: '',
    borrowerName: '',
    borrowerContact: '',
    borrowedAt: todayIso(),
    dueAt: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Loan | null>(null)

  const visibleLoans = useMemo(() => {
    return loans.filter((loan) => loanMatchesTab(loan, activeTab))
  }, [loans, activeTab])

  const tabCounts = useMemo(() => {
    const counts: Record<LoanTab, number> = { active: 0, overdue: 0, returned: 0, all: 0 }
    loans.forEach((loan) => {
      counts.all += 1
      if (loan.status === 'dikembalikan') {
        counts.returned += 1
      } else if (isOverdue(loan.dueAt)) {
        counts.overdue += 1
      } else {
        counts.active += 1
      }
    })
    return counts
  }, [loans])

  // Hanya buku yang dimiliki yang bisa dipinjamkan
  const borrowableBooks = useMemo(() => {
    return books.filter((book) => book.ownershipStatus !== 'hilang')
  }, [books])

  function openCreateForm() {
    setValues({
      bookId: '',
      borrowerName: '',
      borrowerContact: '',
      borrowedAt: todayIso(),
      dueAt: '',
      notes: '',
    })
    setErrors({})
    setFormOpen(true)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const result = loanFormSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      const nextErrors: Record<string, string> = {}
      Object.entries(fieldErrors).forEach(([key, messages]) => {
        if (messages?.[0]) nextErrors[key] = messages[0]
      })
      setErrors(nextErrors)
      const firstKey = Object.keys(nextErrors)[0]
      if (firstKey) document.querySelector<HTMLInputElement>(`[name=${firstKey}]`)?.focus()
      return
    }

    setSubmitting(true)
    try {
      await createLoan.mutateAsync({
        bookId: result.data.bookId,
        borrowerName: result.data.borrowerName,
        borrowerContact: result.data.borrowerContact || null,
        borrowedAt: result.data.borrowedAt,
        dueAt: result.data.dueAt || null,
        notes: result.data.notes || null,
        status: 'dipinjam',
      })
      const bookTitle = books.find((b) => b.id === result.data.bookId)?.title ?? 'Buku'
      toast.success(`Peminjaman "${bookTitle}" oleh ${result.data.borrowerName} dicatat.`)
      setFormOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mencatat peminjaman.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleReturn(loan: Loan) {
    const isReturned = loan.status === 'dikembalikan'
    try {
      await updateLoan.mutateAsync({
        id: loan.id,
        input: {
          status: isReturned ? 'dipinjam' : 'dikembalikan',
          returnedAt: isReturned ? null : todayIso(),
        },
      })
      toast.success(
        isReturned
          ? 'Status peminjaman dikembalikan ke "dipinjam".'
          : `Buku "${loan.book?.title ?? ''}" ditandai sudah dikembalikan.`
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui status peminjaman.')
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteLoan.mutateAsync(deleteTarget.id)
      toast.success('Catatan peminjaman berhasil dihapus.')
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus peminjaman.')
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Peminjaman"
        subtitle="Pantau buku yang Anda pinjamkan kepada orang lain."
        actions={
          <Button onClick={openCreateForm} leftIcon={<Plus size={16} />}>
            Catat Peminjaman
          </Button>
        }
      />

      {/* Tab navigasi */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter peminjaman">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeTab === tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:bg-muted'
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                activeTab === tab.value
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {tabCounts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="p-4">
                <TableRowSkeleton columns={4} />
              </div>
            ))}
          </div>
        </Card>
      ) : visibleLoans.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={HandCoins}
            title={
              activeTab === 'overdue'
                ? 'Tidak ada yang terlambat'
                : activeTab === 'returned'
                  ? 'Belum ada buku yang dikembalikan'
                  : activeTab === 'active'
                    ? 'Tidak ada peminjaman aktif'
                    : 'Belum ada peminjaman'
            }
            description={
              activeTab === 'all'
                ? 'Catat peminjaman buku Anda agar tidak lupa kepada siapa buku itu dipinjam.'
                : 'Catat peminjaman baru lewat tombol "Catat Peminjaman".'
            }
            action={{
              label: 'Catat Peminjaman',
              onClick: openCreateForm,
            }}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {visibleLoans.map((loan) => (
            <LoanRow
              key={loan.id}
              loan={loan}
              onReturn={handleToggleReturn}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Catat Peminjaman"
        description="Isi data buku yang dipinjam dan siapa yang meminjamnya."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button type="submit" form="loan-form" loading={submitting}>
              Simpan
            </Button>
          </div>
        }
      >
        <form id="loan-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="loan-book" required>
              Buku
            </Label>
            <Select
              id="loan-book"
              name="bookId"
              value={values.bookId}
              onChange={(event) => {
                setValues((prev) => ({ ...prev, bookId: event.target.value }))
                setErrors((prev) => ({ ...prev, bookId: '' }))
              }}
              error={errors.bookId}
              disabled={submitting}
              placeholder="Pilih buku yang dipinjam"
              options={borrowableBooks.map((book) => ({
                value: book.id,
                label: book.title + (book.author ? ` — ${book.author}` : ''),
              }))}
            />
            {borrowableBooks.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Anda belum memiliki buku. Tambahkan buku terlebih dahulu di halaman Koleksi.
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="loan-borrower" required>
                Nama Peminjam
              </Label>
              <Input
                id="loan-borrower"
                name="borrowerName"
                value={values.borrowerName}
                onChange={(event) => {
                  setValues((prev) => ({ ...prev, borrowerName: event.target.value }))
                  setErrors((prev) => ({ ...prev, borrowerName: '' }))
                }}
                error={errors.borrowerName}
                placeholder="Contoh: Budi"
                disabled={submitting}
              />
            </div>
            <div>
              <Label htmlFor="loan-contact">Nomor Kontak</Label>
              <Input
                id="loan-contact"
                name="borrowerContact"
                value={values.borrowerContact}
                onChange={(event) => {
                  setValues((prev) => ({ ...prev, borrowerContact: event.target.value }))
                  setErrors((prev) => ({ ...prev, borrowerContact: '' }))
                }}
                error={errors.borrowerContact}
                placeholder="Opsional - no. HP atau email"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="loan-borrowed-at" required>
                Tanggal Dipinjam
              </Label>
              <Input
                id="loan-borrowed-at"
                name="borrowedAt"
                type="date"
                value={values.borrowedAt}
                onChange={(event) => {
                  setValues((prev) => ({ ...prev, borrowedAt: event.target.value }))
                  setErrors((prev) => ({ ...prev, borrowedAt: '' }))
                }}
                error={errors.borrowedAt}
                disabled={submitting}
              />
            </div>
            <div>
              <Label htmlFor="loan-due-at">Jatuh Tempo</Label>
              <Input
                id="loan-due-at"
                name="dueAt"
                type="date"
                value={values.dueAt ?? ''}
                onChange={(event) => {
                  setValues((prev) => ({ ...prev, dueAt: event.target.value }))
                  setErrors((prev) => ({ ...prev, dueAt: '' }))
                }}
                error={errors.dueAt}
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="loan-notes">Catatan</Label>
            <Textarea
              id="loan-notes"
              name="notes"
              value={values.notes}
              onChange={(event) => {
                setValues((prev) => ({ ...prev, notes: event.target.value }))
                setErrors((prev) => ({ ...prev, notes: '' }))
              }}
              error={errors.notes}
              placeholder="Opsional - catatan tentang peminjaman ini"
              disabled={submitting}
              maxLength={1000}
              showCount
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Catatan Peminjaman"
        description={`Catatan peminjaman "${deleteTarget?.book?.title ?? 'buku'}" kepada ${deleteTarget?.borrowerName ?? ''} akan dihapus permanen.`}
        confirmLabel="Ya, hapus"
        loading={deleteLoan.isPending}
      />
    </div>
  )
}
