'use client'

import { useRouter } from 'next/navigation'
import { captureAndStoreLocation } from '@/lib/locationStorage'
import {createPuebloClient} from "@/lib/supabase/client";

export function useLoginHandlers(
  setEmail: (value: string) => void,
  setPassword: (value: string) => void,
  setError: (value: string | null) => void,
  setLoading: (value: boolean) => void,
  setLoadingGoogle: (value: boolean) => void
) {
  const router = useRouter()
  const supabase = createPuebloClient()

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

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

      router.push('/')
    } catch (err: any) {
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

