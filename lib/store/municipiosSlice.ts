'use client'

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { getPuebloClient } from '@/lib/supabase/client'
import { storageGet } from '@/lib/platform/storage'
import { LOCATION_KEY } from '@/lib/locationStorage'

export interface Municipio {
  id: number
  COD_INE: number | null
  NOMBRE_ACTUAL: string | null
  PROVINCIA: string | null
  POBLACION_MUNI: number | null
  LONGITUD_ETRS89: string | null
  LATITUD_ETRS89: string | null
}

export type MunicipiosStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface MunicipiosState {
  items: Municipio[]
  status: MunicipiosStatus
  error?: string
}

const initialState: MunicipiosState = {
  items: [],
  status: 'idle',
}

export const fetchMunicipios = createAsyncThunk<
  Municipio[],
  void,
  { rejectValue: string }
>('municipios/fetchFirst10', async (_, { rejectWithValue }) => {
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
  }

  if (latInput === null || lonInput === null) {
    return [] as Municipio[]
  }

  const { data, error } = await supabase
    .rpc('municipios_cercanos', { lat_input: latInput, lon_input: lonInput });

  if (error) {
    return rejectWithValue(error.message)
  }

  return (data ?? []) as Municipio[]
})

const municipiosSlice = createSlice({
  name: 'municipios',
  initialState,
  reducers: {
    resetMunicipios: (state) => {
      state.items = []
      state.status = 'idle'
      state.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMunicipios.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchMunicipios.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchMunicipios.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Failed to fetch municipios'
      })
  },
})

export const { resetMunicipios } = municipiosSlice.actions

export default municipiosSlice.reducer

