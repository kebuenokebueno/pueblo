'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import LocationCapture from '@/components/LocationCapture'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { getPuebloClient } from '@/lib/supabase/client'
import { fetchMunicipios } from '@/lib/store/municipiosSlice'
import { fetchEntries } from '@/lib/store/entriesSlice'
import { selectMunicipios, selectMunicipiosStatus } from '@/lib/store/selectors'
import { selectEntriesStatus } from '@/lib/store/selectors'
import type { Municipio } from '@/lib/store/municipiosSlice'
import { setStoredSelectedMunicipio } from '@/lib/selectedMunicipioStorage'
import EntryForm from '@/components/EntryForm'
import Menu from '@/components/Menu'

export default function HomePage() {
  const MunicipiosMap = dynamic(() => import('@/components/MunicipiosMap'), { ssr: false })
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectMunicipios)
  const status = useAppSelector(selectMunicipiosStatus)
  const entriesStatus = useAppSelector(selectEntriesStatus)
  const [formOpen, setFormOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleFetch = useCallback(() => {
    void dispatch(fetchMunicipios())
    if (entriesStatus === 'idle') {
      void dispatch(fetchEntries())
    }
  }, [dispatch, entriesStatus])

  const handleSelectionChange = useCallback(async (m: Municipio | null) => {
    await setStoredSelectedMunicipio(m)
  }, [])

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
            onClick={() => setMenuOpen(true)}
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
            <MunicipiosMap
              municipios={items}
              onSelectionChange={handleSelectionChange}
            />
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
        className="absolute bottom-6 right-6 z-[1000] inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700"
        aria-label="Add"
        onClick={() => setFormOpen(true)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>

      <LocationCapture />
      <EntryForm open={formOpen} onClose={() => setFormOpen(false)} />
      {menuOpen && <Menu onClose={() => setMenuOpen(false)} />}
    </div>
  )
}

