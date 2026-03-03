'use client'

import { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queries/client'

export default function StoreProvider({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* DevTools - solo en desarrollo */}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools
                    initialIsOpen={false}
                    position="bottom"
                    buttonPosition="bottom-right"
                />
            )}
        </QueryClientProvider>
    )
}