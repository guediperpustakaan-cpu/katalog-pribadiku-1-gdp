import {
  IMAGE_FULL_WIDTH,
  IMAGE_THUMBNAIL_WIDTH,
  MAX_IMAGE_SIZE,
} from '@/constants'

/**
 * Kompresi dan resize gambar menggunakan canvas sebelum diupload.
 * Mengembalikan data URL (base64) yang langsung bisa disimpan.
 */
export async function compressImage(
  file: File,
  maxWidth = IMAGE_FULL_WIDTH,
  quality = 0.82
): Promise<string> {
  const dataUrl = await readAsDataUrl(file)
  const img = await loadImage(dataUrl)

  // Jika gambar lebih kecil dari maxWidth, tetap di-encode ulang agar ukuran file mengecil
  const ratio = img.width > maxWidth ? maxWidth / img.width : 1
  const targetWidth = Math.round(img.width * ratio)
  const targetHeight = Math.round(img.height * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Browser tidak mendukung canvas untuk kompresi gambar.')

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

  // Kompresi bertahap hingga di bawah batas ukuran
  const maxBytes = MAX_IMAGE_SIZE
  let currentQuality = quality
  let blob = await canvasToBlob(canvas, currentQuality)

  while (blob && blob.size > maxBytes && currentQuality > 0.3) {
    currentQuality -= 0.1
    blob = await canvasToBlob(canvas, currentQuality)
  }

  if (!blob) throw new Error('Gagal mengompresi gambar.')

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Gagal membaca hasil kompresi gambar.'))
    reader.readAsDataURL(blob)
  })
}

/** Buat versi thumbnail kecil dari gambar (untuk daftar buku) */
export async function createThumbnail(
  source: string | File,
  maxWidth = IMAGE_THUMBNAIL_WIDTH,
  quality = 0.7
): Promise<string> {
  const dataUrl = typeof source === 'string' ? source : await readAsDataUrl(source)
  const img = await loadImage(dataUrl)

  const ratio = img.width > maxWidth ? maxWidth / img.width : 1
  const targetWidth = Math.round(img.width * ratio)
  const targetHeight = Math.round(img.height * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Browser tidak mendukung canvas.')

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

  return canvas.toDataURL('image/jpeg', quality)
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Gagal memuat gambar.'))
    img.src = src
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      'image/jpeg',
      quality
    )
  })
}

/** Validasi file gambar: tipe & ukuran */
export function validateImageFile(file: File): string | null {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return 'Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.'
  }
  if (file.size > MAX_IMAGE_SIZE) {
    const maxSizeMb = MAX_IMAGE_SIZE / (1024 * 1024)
    return `Ukuran file terlalu besar. Maksimal ${maxSizeMb} MB.`
  }
  return null
}

/** Ekstrak nama file dari URL atau data URL */
export function getImageAlt(title?: string | null): string {
  return title ? `Sampul buku "${title}"` : 'Sampul buku'
}
