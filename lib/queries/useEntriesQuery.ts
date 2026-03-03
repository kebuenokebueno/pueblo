'use client'

import { useQuery } from '@tanstack/react-query'

import { getPuebloClient } from '@/lib/supabase/client'
import { entriesQueryKey } from '@/lib/queries/keys'
import type { Entry } from '@/lib/types'

export async function fetchEntries(): Promise<Entry[]> {
  const supabase = getPuebloClient()
  const { data, error } = await supabase.rpc('ultimas_entradas', {})
  if (error) throw error
  return (data ?? []) as Entry[]
}

export function useEntriesQuery(enabled: boolean) {
  return useQuery({
    queryKey: entriesQueryKey,
    queryFn: fetchEntries,
    enabled,
  })
}


