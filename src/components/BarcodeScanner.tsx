import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BrowserMultiFormatReader,
  type IScannerControls,
} from '@zxing/browser'
import { Camera, CameraOff, Keyboard, Loader2, ScanLine, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'

export interface BarcodeScannerProps {
  isOpen: boolean
  onClose: () => void
  /** Dipanggil ketika kode ISBN berhasil terbaca */
  onDetected: (isbn: string) => void
}

type ScannerStatus = 'idle' | 'starting' | 'scanning' | 'error' | 'no-camera'

const ISBN_EAN_PREFIX = '978'

/**
 * Pemindai barcode ISBN menggunakan kamera perangkat.
 *
 * Mengikuti prinsip "graceful degradation": jika kamera tidak tersedia
 * atau pengguna menolak izin, secara otomatis beralih ke input manual ISBN.
 */
export function BarcodeScanner({
  isOpen,
  onClose,
  onDetected,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const [status, setStatus] = useState<ScannerStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [manualIsbn, setManualIsbn] = useState<string>('')
  const [manualError, setManualError] = useState<string | undefined>()
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>()

  /** Berhenti memindai dan melepaskan kamera */
  const stopScanning = useCallback(() => {
    controlsRef.current?.stop()
    controlsRef.current = null
    setStatus('idle')
  }, [])

  // Mulai kamera & pemindai
  const startScanning = useCallback(async () => {
    if (!videoRef.current) return
    setStatus('starting')
    setErrorMessage('')

    try {
      if (!readerRef.current) {
        readerRef.current = new BrowserMultiFormatReader()
      }

      const controls = await readerRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, error) => {
          if (error) return
          if (!result) return

          const text = result.getText().trim()
          // Hanya terima barcode yang merupakan ISBN (diawali 978 / 979) atau
          // deretan digit 10-13 angka.
          const digits = text.replace(/[-\s]/g, '')
          const isIsbn = /^97[89]/.test(digits) || /^\d{10,13}$/.test(digits)
          if (!isIsbn) return

            stopScanning()
            onDetected(digits)
        }
      )

      controlsRef.current = controls
      setStatus('scanning')
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (/NotFound|Requested device not found/i.test(message)) {
        setStatus('no-camera')
        setErrorMessage('Tidak ada kamera yang terdeteksi pada perangkat ini.')
      } else if (/NotAllowed|Permission/i.test(message)) {
        setStatus('error')
        setErrorMessage(
          'Akses kamera ditolak. Berikan izin kamera atau masukkan ISBN secara manual.'
        )
      } else {
        setStatus('error')
        setErrorMessage('Gagal memulai kamera. Silakan coba lagi.')
      }
    }
  }, [onDetected, selectedDeviceId, stopScanning])

  // Pilih kamera pertama yang tersedia (biasanya kamera belakang pada mobile)
  useEffect(() => {
    if (!isOpen) return
    let active = true

    async function pickCamera() {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices()
        if (!active) return
        if (!devices || devices.length === 0) {
          setStatus('no-camera')
          return
        }
        // Cari kamera belakang berdasarkan label
        const back = devices.find((device) =>
          /back|rear|environment|belakang/i.test(device.label)
        )
        setSelectedDeviceId((back ?? devices[devices.length - 1]).deviceId)
      } catch {
        if (!active) return
        setStatus('no-camera')
      }
    }

    pickCamera()
    return () => {
      active = false
    }
  }, [isOpen])

  // Mulai/berhenti pemindai sesuai status modal
  useEffect(() => {
    if (isOpen && selectedDeviceId && status === 'idle') {
      startScanning()
    }
    if (!isOpen) {
      stopScanning()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedDeviceId])

  // Pastikan kamera selalu dilepaskan saat komponen ditutup
  useEffect(() => {
    return () => {
      controlsRef.current?.stop()
      controlsRef.current = null
    }
  }, [])

  const handleManualSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const digits = manualIsbn.replace(/[-\s]/g, '')
    if (!/^\d{10,13}$/.test(digits)) {
      setManualError('Format ISBN tidak valid. Gunakan 10 atau 13 digit angka.')
      return
    }
    setManualError(undefined)
    stopScanning()
    onDetected(digits)
  }

  const showCameraView = status === 'scanning' || status === 'starting'

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopScanning()
        onClose()
      }}
      size="md"
      title="Pindai ISBN Buku"
      description="Arahkan kamera ke barcode ISBN di belakang sampul buku."
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {status === 'scanning'
              ? 'Memindai...'
              : status === 'starting'
                ? 'Menyalakan kamera...'
                : 'Input manual'}
          </span>
          <Button
            variant="secondary"
            onClick={() => {
              stopScanning()
              onClose()
            }}
            leftIcon={<X size={14} />}
          >
            Tutup
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {showCameraView ? (
          <div className="relative overflow-hidden rounded-xl bg-black">
            <video
              ref={videoRef}
              className="h-64 w-full object-cover sm:h-72"
              playsInline
              muted
            />
            {/* Bingkai pemindai agar pengguna tahu harus mengarahkan ke mana */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-40 w-64 border-2 border-white/80 rounded-lg">
                <span className="absolute -top-px -left-px h-6 w-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <span className="absolute -top-px -right-px h-6 w-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <span className="absolute -bottom-px -left-px h-6 w-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <span className="absolute -bottom-px -right-px h-6 w-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                <ScanLine className="absolute left-0 top-1/2 h-8 w-full -translate-y-1/2 text-white/80 animate-pulse" />
              </div>
            </div>
            {status === 'starting' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-white">
                <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
                <p className="text-sm">Menyalakan kamera...</p>
              </div>
            )}
            <p className="sr-only" aria-live="polite">
              Kamera aktif, sedang mencari kode ISBN.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-secondary/40 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-muted-foreground">
              {status === 'no-camera' ? (
                <CameraOff className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Camera className="h-6 w-6" aria-hidden="true" />
              )}
            </div>
            <p className="text-sm font-medium text-foreground">
              {status === 'no-camera'
                ? 'Kamera tidak tersedia'
                : 'Kamera tidak dapat digunakan'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {errorMessage || 'Masukkan ISBN secara manual di bawah ini.'}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={startScanning}
              leftIcon={<Camera size={14} />}
            >
              Coba lagi
            </Button>
          </div>
        )}

        {/* ---------------- Input manual (fallback) ---------------- */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <label
            htmlFor="manual-isbn"
            className="flex items-center gap-1.5 text-sm font-medium text-foreground"
          >
            <Keyboard size={14} aria-hidden="true" /> Masukkan ISBN manual
          </label>
          <div className="flex gap-2">
            <Input
              id="manual-isbn"
              value={manualIsbn}
              onChange={(event) => {
                setManualIsbn(event.target.value)
                setManualError(undefined)
              }}
              placeholder="9786020000000"
              inputMode="numeric"
              error={manualError}
              disabled={false}
            />
            <Button type="submit" variant="primary" className="flex-shrink-0">
              Lanjut
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            ISBN biasanya tercetak di belakang sampul, diawali dengan{' '}
            <span className="font-medium">{ISBN_EAN_PREFIX}</span>.
          </p>
        </form>
      </div>
    </Modal>
  )
}
