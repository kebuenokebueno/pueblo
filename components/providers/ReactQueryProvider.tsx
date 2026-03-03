'use client'

import { ReactNode, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { getPuebloClient } from '@/lib/supabase/client'
import { sessionQueryKey } from '@/lib/queries/keys'

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  useEffect(() => {
    const supabase = getPuebloClient()

    // Seed the cache with the current session.
    supabase.auth.getSession().then(({ data }) => {
      client.setQueryData(sessionQueryKey, data.session ?? null)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      client.setQueryData(sessionQueryKey, session ?? null)
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [client])

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}


