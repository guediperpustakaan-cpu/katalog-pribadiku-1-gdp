import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderPlus, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import {
  useAllBooks,
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/hooks/queries'
import type { Category } from '@/types'
import { categoryFormSchema, type CategoryFormValues } from '@/utils/validation'
import { formatNumber } from '@/utils/date'
import { toast } from 'sonner'

interface CategoryRowProps {
  category: Category
  bookCount: number
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

function CategoryRow({ category, bookCount, onEdit, onDelete }: CategoryRowProps) {
  return (
    <div className="card flex items-center justify-between gap-4 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
          {category.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{category.name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {formatNumber(bookCount)} buku di kategori ini
          </p>
        </div>
      </div>

      <div className="flex flex-none items-center gap-2">
        <Link
          to={`/koleksi?categoryId=${encodeURIComponent(category.id)}`}
          className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          {formatNumber(bookCount)} buku
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(category)}
          aria-label={`Edit kategori ${category.name}`}
        >
          <Pencil size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(category)}
          aria-label={`Hapus kategori ${category.name}`}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories()
  const { data: books = [] } = useAllBooks()

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [values, setValues] = useState<CategoryFormValues>({ name: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  // Hitung jumlah buku per kategori dari seluruh koleksi
  const countByCategory = books.reduce<Record<string, number>>((acc, book) => {
    if (book.categoryId) acc[book.categoryId] = (acc[book.categoryId] ?? 0) + 1
    return acc
  }, {})

  function openCreateForm() {
    setEditingCategory(null)
    setValues({ name: '' })
    setErrors({})
    setFormOpen(true)
  }

  function openEditForm(category: Category) {
    setEditingCategory(category)
    setValues({ name: category.name })
    setErrors({})
    setFormOpen(true)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const result = categoryFormSchema.safeParse(values)
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
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          input: { name: result.data.name },
        })
        toast.success(`Kategori "${result.data.name}" berhasil diperbarui.`)
      } else {
        await createCategory.mutateAsync({ name: result.data.name })
        toast.success(`Kategori "${result.data.name}" berhasil ditambahkan.`)
      }
      setFormOpen(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteCategory.mutateAsync(deleteTarget.id)
      toast.success(`Kategori "${deleteTarget.name}" berhasil dihapus.`)
      setDeleteTarget(null)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Gagal menghapus kategori. Mungkin masih ada buku yang memakainya.'
      )
      setDeleteTarget(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Kategori" subtitle="Kelompokkan buku Anda berdasarkan kategori." />
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="skeleton h-[72px] rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori"
        subtitle="Kelompokkan buku Anda berdasarkan kategori."
        actions={
          <Button onClick={openCreateForm} leftIcon={<Plus size={16} />}>
            Tambah Kategori
          </Button>
        }
      />

      {categories.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={FolderPlus}
            title="Belum ada kategori"
            description="Tambahkan kategori untuk mengelompokkan buku Anda, misalnya 'Fiksi', 'Non-Fiksi', atau 'Komik'."
            action={{
              label: 'Tambah Kategori Pertama',
              onClick: openCreateForm,
            }}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              bookCount={countByCategory[category.id] ?? 0}
              onEdit={openEditForm}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
        description={
          editingCategory
            ? 'Ubah nama kategori.'
            : 'Isi nama kategori baru untuk buku Anda.'
        }
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setFormOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" form="category-form" loading={submitting}>
              {editingCategory ? 'Simpan Perubahan' : 'Tambah'}
            </Button>
          </div>
        }
      >
        <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category-name" required>
              Nama Kategori
            </Label>
            <Input
              id="category-name"
              name="name"
              value={values.name}
              onChange={(event) => {
                setValues((prev) => ({ ...prev, name: event.target.value }))
                setErrors((prev) => ({ ...prev, name: '' }))
              }}
              error={errors.name}
              placeholder="Contoh: Fiksi"
              disabled={submitting}
              autoFocus
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Kategori"
        description={`Kategori "${deleteTarget?.name}" akan dihapus. Buku yang memakai kategori ini akan menjadi tanpa kategori.`}
        confirmLabel="Ya, hapus"
        loading={deleteCategory.isPending}
      />
    </div>
  )
}
