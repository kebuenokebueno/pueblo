'use client'

import { useQuery } from '@tanstack/react-query'

import { getPuebloClient } from '@/lib/supabase/client'
import { sessionQueryKey } from '@/lib/queries/keys'

export function useSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      const supabase = getPuebloClient()
      const { data } = await supabase.auth.getSession()
      return data.session ?? null
    },
    staleTime: Infinity,
  })
}


