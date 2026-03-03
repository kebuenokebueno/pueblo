'use client'

import { useQuery } from '@tanstack/react-query'

import { getPuebloClient } from '@/lib/supabase/client'
import { storageGet } from '@/lib/platform/storage'
import { LOCATION_KEY } from '@/lib/locationStorage'
import { municipiosQueryKey } from '@/lib/queries/keys'
import type { Municipio } from '@/lib/types'

export async function fetchMunicipiosCercanos(): Promise<Municipio[]> {
  const supabase = getPuebloClient()

  // Pull last known coordinates from local storage (via platform adapter)
  let latInput: number | null = null
  let lonInput: number | null = null
  try {
    const raw = await storageGet(LOCATION_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { lat?: unknown; lng?: unknown }
      const lat = typeof parsed.lat === 'number' ? parsed.lat : Number(parsed.lat)
      const lng = typeof parsed.lng === 'number' ? parsed.lng : Number(parsed.lng)
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        latInput = lat as number
        lonInput = lng as number
      }
    }
  } catch {
    // ignore parse errors
  }

  if (latInput === null || lonInput === null) {
    latInput = 43.26271
    lonInput = -2.92528
  }

  const { data, error } = await supabase.rpc('municipios_cercanos', {
    lat_input: latInput,
    lon_input: lonInput,
  })

  if (error) throw error
  return (data ?? []) as Municipio[]
}

export function useMunicipiosQuery(enabled: boolean) {
  return useQuery({
    queryKey: municipiosQueryKey,
    queryFn: fetchMunicipiosCercanos,
    enabled,
  })
}


