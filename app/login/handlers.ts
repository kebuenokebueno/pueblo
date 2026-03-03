'use client'

import { useRouter } from 'next/navigation'
import { captureAndStoreLocation } from '@/lib/locationStorage'
import { getPuebloClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { entriesQueryKey, municipiosQueryKey, sessionQueryKey } from '@/lib/queries/keys'
import { fetchMunicipiosCercanos } from '@/lib/queries/useMunicipiosQuery'
import { fetchEntries } from '@/lib/queries/useEntriesQuery'

export function useLoginHandlers(
  setEmail: (value: string) => void,
  setPassword: (value: string) => void,
  setError: (value: string | null) => void,
  setLoading: (value: boolean) => void,
  setLoadingGoogle: (value: boolean) => void
) {
  const router = useRouter()
  const supabase = getPuebloClient()
  const queryClient = useQueryClient()

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    queryClient.removeQueries({ queryKey: municipiosQueryKey })
    queryClient.removeQueries({ queryKey: entriesQueryKey })

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)

      if (error || !data.session) {
        setError(error?.message || 'Login failed')
        return
      }

      queryClient.setQueryData(sessionQueryKey, data.session)
      try {
        await Promise.race([
          captureAndStoreLocation({ force: true, timeoutMs: 2500, maximumAgeMs: 60_000 }),
          new Promise((resolve) => setTimeout(resolve, 2600)),
        ])
      } catch {}

      try {
        await queryClient.prefetchQuery({
          queryKey: municipiosQueryKey,
          queryFn: fetchMunicipiosCercanos,
        })
      } catch (fetchError) {
        console.error('Failed to fetch municipios after login', fetchError)
      }

      try {
        await queryClient.prefetchQuery({
          queryKey: entriesQueryKey,
          queryFn: fetchEntries,
        })
      } catch (fetchError) {
        console.error('Failed to fetch entries after login', fetchError)
      }

      router.push('/')
    } catch (error: unknown) {
      setLoading(false)
      setError('Network error')
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setLoadingGoogle(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoadingGoogle(false)
    if (error) setError(error.message)
  }

  return { handleLogin, handleGoogleLogin }
}

