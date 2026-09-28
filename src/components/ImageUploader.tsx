import { type DragEvent, useCallback, useRef, useState } from 'react'
import { ImagePlus, Loader2, Upload, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { compressImage, validateImageFile } from '@/utils/image'
import { MAX_IMAGE_SIZE } from '@/constants'

export interface ImageUploaderProps {
  value?: string | null
  onChange: (dataUrl: string | null) => void
  onError?: (message: string) => void
  label?: string
  disabled?: boolean
  className?: string
}

/**
 * Unggah foto sampul dengan drag & drop, preview sebelum disimpan,
 * kompresi otomatis, dan batas ukuran file.
 */
export function ImageUploader({
  value,
  onChange,
  onError,
  label = 'Foto Sampul',
  disabled = false,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)

  const handleFile = useCallback(
    async (file: File | undefined | null) => {
      if (!file) return

      const validationError = validateImageFile(file)
      if (validationError) {
        onError?.(validationError)
        return
      }

      try {
        setIsCompressing(true)
        const compressed = await compressImage(file)
        onChange(compressed)
      } catch (error) {
        onError?.(
          error instanceof Error
            ? error.message
            : 'Gagal memproses gambar. Silakan coba gambar lain.'
        )
      } finally {
        setIsCompressing(false)
      }
    },
    [onChange, onError]
  )

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragging(false)
      if (disabled) return
      handleFile(event.dataTransfer.files?.[0])
    },
    [disabled, handleFile]
  )

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      if (disabled) return
      setIsDragging(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  const handleRemove = useCallback(() => {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [onChange])

  const maxSizeMb = MAX_IMAGE_SIZE / (1024 * 1024)

  return (
    <div className={cn('w-full', className)}>
      <span className="label-field">{label}</span>

      {value ? (
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={value}
              alt="Pratinjau foto sampul"
              className="h-40 w-28 rounded-lg border border-border object-cover shadow-sm"
            />
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              aria-label="Hapus foto sampul"
              className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <X size={14} />
            </button>
          </div>
          <div className="space-y-2 pt-1">
            <p className="text-xs text-muted-foreground">
              Pratinjau foto sampul. Gambar akan dikompresi otomatis saat disimpan.
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              leftIcon={<ImagePlus size={14} />}
            >
              Ganti foto
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(event) => {
            if (disabled) return
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              inputRef.current?.click()
            }
          }}
          aria-label="Unggah foto sampul (seret dan lepas atau tekan untuk memilih)"
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isDragging
              ? 'border-primary bg-accent'
              : 'border-border bg-secondary/40 hover:border-primary/50 hover:bg-secondary/80',
            disabled && 'cursor-not-allowed opacity-60'
          )}
        >
          {isCompressing ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">Sedang mengompresi gambar…</p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Upload className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Seret dan lepas foto sampul di sini
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  atau klik untuk memilih file. Maksimal {maxSizeMb} MB (JPG, PNG, WEBP, GIF).
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => handleFile(event.target.files?.[0])}
        disabled={disabled}
        aria-hidden="true"
      />
    </div>
  )
}
