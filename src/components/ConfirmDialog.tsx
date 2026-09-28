import { type LucideIcon, AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary' | 'success'
  icon?: LucideIcon
  loading?: boolean
}

/**
 * Dialog konfirmasi yang selalu ditampilkan sebelum menghapus data.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  variant = 'danger',
  icon: Icon = AlertTriangle,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={
            'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ' +
            (variant === 'danger'
              ? 'bg-destructive/10 text-destructive'
              : variant === 'success'
                ? 'bg-success/10 text-success'
                : 'bg-primary/10 text-primary')
          }
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="text-sm text-muted-foreground">
          {description ?? 'Tindakan ini tidak dapat dibatalkan.'}
        </p>
      </div>
    </Modal>
  )
}
