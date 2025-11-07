'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getPuebloClient } from '@/lib/supabase/client'
import { useAppDispatch } from '@/lib/store/hooks'
import { fetchMunicipios, resetMunicipios } from '@/lib/store/municipiosSlice'

export default function AuthCallbackPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [status, setStatus] = useState<'verifying' | 'error'>('verifying')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const exchange = async () => {
      const supabase = getPuebloClient()
      const nextParams = new URLSearchParams(window.location.search)
      const next = nextParams.get('next') || '/'

      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
      if (error) {
        setStatus('error')
        setMessage(error.message || 'Authentication failed')
        return
      }

      dispatch(resetMunicipios())

      try {
        await dispatch(fetchMunicipios()).unwrap()
      } catch (fetchError) {
        console.error('Failed to fetch municipios after OAuth login', fetchError)
      }

      router.replace(next === '/auth/callback' ? '/' : next)
    }

    exchange().catch((err: unknown) => {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Unexpected error')
    })
  }, [dispatch, router])

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-sm text-center space-y-2">
          <h1 className="text-xl font-semibold">Authentication failed</h1>
          <p className="text-sm text-gray-600">{message}</p>
          <button
            className="mt-4 text-blue-600 underline"
            onClick={() => router.replace('/login')}
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-sm text-center space-y-2">
        <h1 className="text-xl font-semibold">Completing sign-in…</h1>
        <p className="text-sm text-gray-600">Please wait while we finish signing you in.</p>
      </div>
    </div>
  )
}


