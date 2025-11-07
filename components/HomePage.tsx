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
  selectMunicipiosError,
  selectMunicipiosStatus,
} from '@/lib/store/selectors'

export default function HomePage() {
  const MunicipiosMap = dynamic(() => import('@/components/MunicipiosMap'), { ssr: false })
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectMunicipios)
  const status = useAppSelector(selectMunicipiosStatus)
  const error = useAppSelector(selectMunicipiosError)

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

  const handleRetry = useCallback(() => {
    handleFetch()
  }, [handleFetch])

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

        <section className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Municipios</h2>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Mostrando hasta 10 resultados
            </span>
          </div>

          {status === 'loading' && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando municipios…</p>
          )}

          {status === 'failed' && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-red-600">
                No fue posible recuperar los municipios{error ? `: ${error}` : ''}
              </p>
              <button
                onClick={handleRetry}
                className="self-start rounded-full border border-zinc-300 px-4 py-1 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Reintentar
              </button>
            </div>
          )}

          {status === 'succeeded' && items.length === 0 && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No se encontraron municipios para mostrar.
            </p>
          )}

          {items.length > 0 && (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {items.map((municipio) => (
                <li key={municipio.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                      <span className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                        {municipio.NOMBRE_ACTUAL ?? 'Nombre no disponible'}
                      </span>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        {municipio.PROVINCIA ?? 'Provincia desconocida'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <span>Habitantes: {municipio.POBLACION_MUNI ?? 'N/D'}</span>
                      <span>Código INE: {municipio.COD_INE ?? 'N/D'}</span>
                      <span>
                        Coordenadas: {municipio.LATITUD_ETRS89 ?? 'N/D'}, {municipio.LONGITUD_ETRS89 ?? 'N/D'}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

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

