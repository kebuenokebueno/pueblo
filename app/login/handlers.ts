'use client'

import { useRouter } from 'next/navigation'
import { captureAndStoreLocation } from '@/lib/locationStorage'
import { getPuebloClient } from '@/lib/supabase/client'
import { useAppDispatch } from '@/lib/store/hooks'
import { fetchMunicipios, resetMunicipios } from '@/lib/store/municipiosSlice'
import { fetchEntries, resetEntries } from '@/lib/store/entriesSlice'

export function useLoginHandlers(
  setEmail: (value: string) => void,
  setPassword: (value: string) => void,
  setError: (value: string | null) => void,
  setLoading: (value: boolean) => void,
  setLoadingGoogle: (value: boolean) => void
) {
  const router = useRouter()
  const supabase = getPuebloClient()
  const dispatch = useAppDispatch()

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    dispatch(resetMunicipios())
    dispatch(resetEntries())

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)

      if (error || !data.session) {
        setError(error?.message || 'Login failed')
        return
      }
      try {
        await Promise.race([
          captureAndStoreLocation({ force: true, timeoutMs: 2500, maximumAgeMs: 60_000 }),
          new Promise((resolve) => setTimeout(resolve, 2600)),
        ])
      } catch {}

      try {
        await dispatch(fetchMunicipios()).unwrap()
      } catch (fetchError) {
        console.error('Failed to fetch municipios after login', fetchError)
      }

      try {
        await dispatch(fetchEntries()).unwrap()
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

