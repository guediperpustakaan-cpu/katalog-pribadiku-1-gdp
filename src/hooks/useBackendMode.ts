import { useEffect, useState } from 'react'
import {
  checkBackendAvailability,
  getBackendMode,
  onBackendModeChange,
  type BackendMode,
} from '@/services/apiClient'

/**
 * Mengetahui mode backend aktif: 'remote' (Express + Neon) atau 'local'
 * (penyimpanan browser). Digunakan untuk indikator status di antarmuka.
 */
export function useBackendMode(): BackendMode {
  const [mode, setMode] = useState<BackendMode>(getBackendMode())

  useEffect(() => {
    checkBackendAvailability().then(setMode)
    const unsubscribe = onBackendModeChange(setMode)
    return unsubscribe
  }, [])

  return mode
}
