'use client'

import { useCallback, useEffect } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import LocationCapture from '@/components/LocationCapture'
import LogoutButton from '@/components/LogoutButton'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { getPuebloClient } from '@/lib/supabase/client'
import { fetchMunicipios } from '@/lib/store/municipiosSlice'
import { selectMunicipios, selectMunicipiosStatus } from '@/lib/store/selectors'

export default function HomePage() {
  const MunicipiosMap = dynamic(() => import('@/components/MunicipiosMap'), { ssr: false })
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectMunicipios)
  const status = useAppSelector(selectMunicipiosStatus)

  const handleFetch = useCallback(() => {
    void dispatch(fetchMunicipios())
  }, [dispatch])

  useEffect(() => {
    if (status !== 'idle') return

    const supabase = getPuebloClient()

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        handleFetch()
      }
    })
  }, [handleFetch, status])

  return (
    <div className="relative h-screen w-full overflow-hidden bg-zinc-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center px-4 pt-3">
        <div className="pointer-events-auto flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-md">
          <div className="flex items-center gap-3">
            <Image src="/aquiahora-logo.svg" alt="AquiAhora" width={28} height={28} />
            <span className="text-base font-semibold text-zinc-900">AquiAhora</span>
          </div>
          <button
            aria-label="Menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-4 absolute inset-0">
        {status === 'succeeded' && (
          <div className="h-full w-full pt-16">
            <MunicipiosMap municipios={items} />
          </div>
        )}
        {status === 'loading' && (
          <div className="flex h-full items-center justify-center text-zinc-600">Preparando el mapa…</div>
        )}
        {status === 'failed' && (
          <div className="flex h-full items-center justify-center text-red-600">
            No se puede mostrar el mapa sin datos disponibles.
          </div>
        )}
      </div>

      <button
        className="absolute bottom-6 right-6 z-10 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700"
        aria-label="Add"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>

      <div className="absolute left-4 bottom-6 z-10">
        <LogoutButton />
      </div>

      <LocationCapture />
    </div>
  )
}

