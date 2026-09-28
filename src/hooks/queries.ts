/**
 * Kumpulan hook TanStack Query untuk pengambilan data.
 * Query di-cache untuk mengurangi request database yang berulang.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { apiClient, type BookListParams } from '@/services/apiClient'
import type { Book, Category, Loan, StorageLocation } from '@/types'
import { DEFAULT_PAGE_SIZE } from '@/constants'

export const queryKeys = {
  books: (params?: BookListParams) => ['books', params ?? {}] as const
,
  booksAll: () => ['books', 'all'] as const,
  book: (id: string) => ['books', id] as const,
  categories: () => ['categories'] as const,
  locations: () => ['locations'] as const,
  loans: (status?: string) => ['loans', status ?? 'all'] as const,
  readingLogs: (bookId?: string) => ['reading-logs', bookId ?? 'all'] as const,
  statsDashboard: () => ['stats', 'dashboard'] as const,
  statsCollection: () => ['stats', 'collection'] as const,
}

// ============================================================
// BOOKS
// ============================================================

export function useBooks(params?: BookListParams) {
  return useQuery({
    queryKey: queryKeys.books(params),
    queryFn: () => apiClient.listBooks(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function useAllBooks() {
  return useQuery({
    queryKey: queryKeys.booksAll(),
    queryFn: () => apiClient.listAllBooks(),
    staleTime: 60_000,
  })
}

export function useBook(id?: string) {
  return useQuery({
    queryKey: queryKeys.book(id ?? 'none'),
    queryFn: () => apiClient.getBook(id as string),
    enabled: Boolean(id),
    retry: 1,
  })
}

export function useCreateBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<Book>) => apiClient.createBook(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.statsDashboard() })
      queryClient.invalidateQueries({ queryKey: queryKeys.statsCollection() })
    },
  })
}

export function useUpdateBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Book> }) =>
      apiClient.updateBook(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.book(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.statsDashboard() })
      queryClient.invalidateQueries({ queryKey: queryKeys.statsCollection() })
    },
  })
}

export function useDeleteBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.loans() })
      queryClient.invalidateQueries({ queryKey: queryKeys.statsDashboard() })
      queryClient.invalidateQueries({ queryKey: queryKeys.statsCollection() })
    },
  })
}

export function useBulkCreateBooks() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: Partial<Book>[]) => apiClient.bulkCreateBooks(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.statsDashboard() })
      queryClient.invalidateQueries({ queryKey: queryKeys.statsCollection() })
    },
  })
}

// ============================================================
// CATEGORIES
// ============================================================

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => apiClient.listCategories(),
    staleTime: 60_000,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<Category>) => apiClient.createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() })
      queryClient.invalidateQueries({ queryKey: queryKeys.statsDashboard() })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Category> }) =>
      apiClient.updateCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() })
      queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() })
      queryClient.invalidateQueries({ queryKey: queryKeys.statsDashboard() })
    },
  })
}

// ============================================================
// STORAGE LOCATIONS
// ============================================================

export function useLocations() {
  return useQuery({
    queryKey: queryKeys.locations(),
    queryFn: () => apiClient.listLocations(),
    staleTime: 60_000,
  })
}

export function useCreateLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<StorageLocation>) => apiClient.createLocation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations() })
      queryClient.invalidateQueries({ queryKey: queryKeys.statsDashboard() })
    },
  })
}

export function useUpdateLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<StorageLocation> }) =>
      apiClient.updateLocation(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations() })
      queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}

export function useDeleteLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations() })
      queryClient.invalidateQueries({ queryKey: queryKeys.statsDashboard() })
    },
  })
}

// ============================================================
// LOANS
// ============================================================

export function useLoans(status?: string) {
  return useQuery({
    queryKey: queryKeys.loans(status),
    queryFn: () => apiClient.listLoans(status),
    staleTime: 30_000,
  })
}

export function useCreateLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<Loan>) => apiClient.createLoan(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans() })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.statsDashboard() })
    },
  })
}

export function useUpdateLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Loan> }) =>
      apiClient.updateLoan(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans() })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.statsDashboard() })
    },
  })
}

export function useDeleteLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans() })
      queryClient.invalidateQueries({ queryKey: queryKeys.statsDashboard() })
    },
  })
}

// ============================================================
// READING LOGS
// ============================================================

export function useReadingLogs(bookId?: string) {
  return useQuery({
    queryKey: queryKeys.readingLogs(bookId),
    queryFn: () => apiClient.listReadingLogs(bookId),
    staleTime: 30_000,
  })
}

export function useCreateReadingLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: apiClient.createReadingLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.readingLogs() })
    },
  })
}

// ============================================================
// STATISTICS
// ============================================================

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.statsDashboard(),
    queryFn: () => apiClient.getDashboardStats(),
    staleTime: 30_000,
  })
}

export function useCollectionStats() {
  return useQuery({
    queryKey: queryKeys.statsCollection(),
    queryFn: () => apiClient.getCollectionStats(),
    staleTime: 30_000,
  })
}

export { DEFAULT_PAGE_SIZE }
