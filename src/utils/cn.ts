import { type ClassValue, clsx } from 'clsx'

/**
 * Gabungkan nama kelas Tailwind dengan aman (mengatasi kondisional & konflik).
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}
