import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
})

// Para TanStack Query DevTools Chrome Extension
declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: QueryClient
  }
}

if (typeof window !== 'undefined') {
  window.__TANSTACK_QUERY_CLIENT__ = queryClient
}
