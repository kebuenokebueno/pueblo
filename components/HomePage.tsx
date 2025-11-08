"use client"

import Image from "next/image"
import { useCallback, useEffect } from "react"

import LogoutButton from '@/components/LogoutButton'
import LocationCapture from '@/components/LocationCapture'
import dynamic from 'next/dynamic'
import { getPuebloClient } from '@/lib/supabase/client'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { fetchMunicipios } from '@/lib/store/municipiosSlice'
import {
  selectMunicipios,
  selectMunicipiosStatus,
} from '@/lib/store/selectors'

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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col gap-12 py-16 px-10 md:px-16 bg-white dark:bg-black">
        <header className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={120}
            height={24}
            priority
          />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
              Bienvenido a Pueblo
            </h1>
            <p className="mt-2 text-lg leading-7 text-zinc-600 dark:text-zinc-400">
              Consulta rápidamente los primeros municipios disponibles en tu base de datos.
            </p>
          </div>
        </header>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Mapa</h2>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Visualiza su ubicación aproximada</span>
          </div>

          {status === 'loading' && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Preparando el mapa…</p>
          )}

          {status === 'succeeded' && <MunicipiosMap municipios={items} />}

          {status === 'failed' && (
            <p className="text-sm text-red-600">
              No se puede mostrar el mapa sin datos disponibles.
            </p>
          )}
        </section>

        <div className="flex flex-col items-start gap-6">
          <LocationCapture />
          <LogoutButton />
        </div>
      </main>
    </div>
  )
}

