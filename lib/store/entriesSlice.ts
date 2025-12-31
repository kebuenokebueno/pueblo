'use client'

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { getPuebloClient } from '@/lib/supabase/client'

export interface Entry {
  id: number
  entry_date: string
  title: string
  description: string
  municipio_id: string
}

export type EntriesStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface EntriesState {
  items: Entry[]
  status: EntriesStatus
  error?: string
}

const initialState: EntriesState = {
  items: [],
  status: 'idle',
}

export const fetchEntries = createAsyncThunk<
  Entry[],
  void,
  { rejectValue: string }
>('entries/fetchAll', async (_, { rejectWithValue }) => {
  const supabase = getPuebloClient()

  const { data, error } = await supabase.rpc('ultimas_entradas', {})

  if (error) {
    return rejectWithValue(error.message)
  }

  return (data ?? []) as Entry[]
})

const entriesSlice = createSlice({
  name: 'entries',
  initialState,
  reducers: {
    resetEntries: (state) => {
      state.items = []
      state.status = 'idle'
      state.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEntries.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchEntries.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchEntries.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Failed to fetch entries'
      })
  },
})

export const { resetEntries } = entriesSlice.actions

export default entriesSlice.reducer

