'use client'

import { ReactNode, useMemo } from 'react'
import { Provider } from 'react-redux'

import { AppStore, makeStore } from '@/lib/store'

export default function StoreProvider({ children }: { children: ReactNode }) {
  const store = useMemo<AppStore>(() => makeStore(), [])

  return <Provider store={store}>{children}</Provider>
}

