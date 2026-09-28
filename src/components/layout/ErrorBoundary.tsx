import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Dipanggil ketika error ditangkap (mis. untuk logging) */
  onError?: (error: Error, info: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

/**
 * Pembungkus error boundary agar error pada satu halaman tidak
 * membuat seluruh aplikasi ikut blank (white screen of death).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Konsol tetap menjadi alat debugging utama
    console.error('Katalog Pribadiku: terjadi error:', error, info)
    this.props.onError?.(error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-8 w-8" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold text-foreground">
              Terjadi kesalahan
            </h3>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              Maaf, halaman ini tidak dapat ditampilkan untuk sementara. Data Anda tetap
              aman. Silakan muat ulang halaman ini.
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <RefreshCw size={16} aria-hidden="true" /> Muat ulang
          </button>
          {this.state.error && (
            <p className="mt-2 max-w-md break-words rounded-md bg-secondary px-3 py-2 text-left text-xs text-muted-foreground">
              {this.state.error.message}
            </p>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
