import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import {
  useBooks,
  useDeleteLocation,
  useLocations,
  useCreateLocation,
  useUpdateLocation,
} from '@/hooks/queries'
import type { StorageLocation } from '@/types'
import { locationFormSchema, type LocationFormValues } from '@/utils/validation'
import { toast } from 'sonner'

interface LocationRowProps {
  location: StorageLocation
  bookCount: number
  onEdit: (location: StorageLocation) => void
  onDelete: (location: StorageLocation) => void
}

function LocationRow({ location, bookCount, onEdit, onDelete }: LocationRowProps) {
  return (
    <div className="card flex items-center justify-between gap-4 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MapPin size={18} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{location.name}</p>
          {location.description ? (
            <p className="truncate text-sm text-muted-foreground">{location.description}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground">Tanpa keterangan</p>
          )}
        </div>
      </div>

      <div className="flex flex-none items-center gap-2">
        <Link
          to={`/koleksi?locationId=${encodeURIComponent(location.id)}`}
          className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          {bookCount} buku
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(location)}
          aria-label={`Edit lokasi ${location.name}`}
        >
          <Pencil size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(location)}
          aria-label={`Hapus lokasi ${location.name}`}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  )
}

export default function LocationsPage() {
  const { data: locations = [], isLoading } = useLocations()
  const { data: booksData } = useBooks({ limit: 1 })

  const createLocation = useCreateLocation()
  const updateLocation = useUpdateLocation()
  const deleteLocation = useDeleteLocation()

  const [formOpen, setFormOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<StorageLocation | null>(null)
  const [values, setValues] = useState<LocationFormValues>({ name: '', description: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<StorageLocation | null>(null)

  // Hitung jumlah buku per lokasi dari seluruh koleksi
  const books = booksData?.data ?? []
  const countByLocation = books.reduce<Record<string, number>>((acc, book) => {
    if (book.storageLocationId) acc[book.storageLocationId] = (acc[book.storageLocationId] ?? 0) + 1
    return acc
  }, {})

  function openCreateForm() {
    setEditingLocation(null)
    setValues({ name: '', description: '' })
    setErrors({})
    setFormOpen(true)
  }

  function openEditForm(location: StorageLocation) {
    setEditingLocation(location)
    setValues({ name: location.name, description: location.description ?? '' })
    setErrors({})
    setFormOpen(true)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const result = locationFormSchema.safeParse(values)
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
      if (editingLocation) {
        await updateLocation.mutateAsync({
          id: editingLocation.id,
          input: { name: result.data.name, description: result.data.description || null },
        })
        toast.success(`Lokasi "${result.data.name}" berhasil diperbarui.`)
      } else {
        await createLocation.mutateAsync({
          name: result.data.name,
          description: result.data.description || null,
        })
        toast.success(`Lokasi "${result.data.name}" berhasil ditambahkan.`)
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
      await deleteLocation.mutateAsync(deleteTarget.id)
      toast.success(`Lokasi "${deleteTarget.name}" berhasil dihapus.`)
      setDeleteTarget(null)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Gagal menghapus lokasi. Mungkin masih ada buku yang memakainya.'
      )
      setDeleteTarget(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Lokasi Penyimpanan" subtitle="Catat di mana buku Anda disimpan." />
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="skeleton h-[72px] rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lokasi Penyimpanan"
        subtitle="Catat di mana buku Anda disimpan."
        actions={
          <Button onClick={openCreateForm} leftIcon={<Plus size={16} />}>
            Tambah Lokasi
          </Button>
        }
      />

      {locations.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={MapPin}
            title="Belum ada lokasi"
            description="Tambahkan lokasi penyimpanan, misalnya 'Rak Utama', 'Meja Belajar', atau 'Kardus 1'."
            action={{
              label: 'Tambah Lokasi Pertama',
              onClick: openCreateForm,
            }}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {locations.map((location) => (
            <LocationRow
              key={location.id}
              location={location}
              bookCount={countByLocation[location.id] ?? 0}
              onEdit={openEditForm}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingLocation ? 'Edit Lokasi' : 'Tambah Lokasi'}
        description={
          editingLocation
            ? 'Ubah nama atau keterangan lokasi penyimpanan.'
            : 'Isi nama lokasi tempat Anda menyimpan buku.'
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
            <Button type="submit" form="location-form" loading={submitting}>
              {editingLocation ? 'Simpan Perubahan' : 'Tambah'}
            </Button>
          </div>
        }
      >
        <form id="location-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="location-name" required>
              Nama Lokasi
            </Label>
            <Input
              id="location-name"
              name="name"
              value={values.name}
              onChange={(event) => {
                setValues((prev) => ({ ...prev, name: event.target.value }))
                setErrors((prev) => ({ ...prev, name: '' }))
              }}
              error={errors.name}
              placeholder="Contoh: Rak Utama"
              disabled={submitting}
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="location-description">Keterangan</Label>
            <Textarea
              id="location-description"
              name="description"
              value={values.description}
              onChange={(event) => {
                setValues((prev) => ({ ...prev, description: event.target.value }))
                setErrors((prev) => ({ ...prev, description: '' }))
              }}
              error={errors.description}
              placeholder="Opsional - keterangan singkat tentang lokasi ini"
              disabled={submitting}
              maxLength={200}
              showCount
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Lokasi"
        description={`Lokasi "${deleteTarget?.name}" akan dihapus. Buku yang memakai lokasi ini akan menjadi tanpa lokasi.`}
        confirmLabel="Ya, hapus"
        loading={deleteLocation.isPending}
      />
    </div>
  )
}
