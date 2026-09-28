import { type ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Mencegah modal ditutup saat klik di luar */
  closeOnOverlayClick?: boolean
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  // Tutup modal dengan tombol Escape (aksesibilitas)
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Kunci scroll body & fokus ke modal saat terbuka
  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    contentRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="presentation"
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-card shadow-2xl animate-scale-in sm:rounded-2xl',
          sizeClasses[size]
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div className="min-w-0">
              {title && (
                <h2 className="text-lg font-semibold leading-tight tracking-tight">{title}</h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="flex-shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
