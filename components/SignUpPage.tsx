'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setMessage(decodeURIComponent(errorParam))
      // Clean up URL
      router.replace('/signup')
    }
  }, [searchParams, router])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      setLoading(false)
      if (error || !data.user) {
        setMessage(error?.message || 'Sign up failed')
        return
      }
      setMessage('Account created! Check your email for confirmation.')
      router.push('/login')
    } catch (err: any) {
      setLoading(false)
      setMessage('Network error')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6 text-center">Sign Up</h1>

        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-2 w-full rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="border p-2 w-full rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-500">OR</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <button
          type="button"
          disabled={loadingGoogle}
          onClick={async () => {
            setMessage('')
            setLoadingGoogle(true)
            const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: `${window.location.origin}/auth/callback` },
            })
            setLoadingGoogle(false)
            if (error) setMessage(error.message)
          }}
          className="w-full border border-gray-300 bg-white text-gray-800 py-2 rounded hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          {!loadingGoogle && (
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.893 31.658 29.389 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.869 5.053 29.706 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.816C14.464 16.104 18.879 13 24 13c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.869 5.053 29.706 3 24 3c-7.59 0-14.088 4.26-17.694 10.491z"/>
              <path fill="#4CAF50" d="M24 43c5.342 0 10.216-2.045 13.9-5.371l-6.422-5.432C29.42 33.551 26.872 34.5 24 34.5c-5.357 0-9.875-3.571-11.5-8.5l-6.61 5.098C9.46 38.798 16.153 43 24 43z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.009 2.936-3.167 5.217-5.825 6.414l6.422 5.432C38.97 36.919 44 31.5 44 23c0-1.341-.138-2.651-.389-3.917z"/>
            </svg>
          )}
          {loadingGoogle ? 'Redirecting…' : 'Continue with Google'}
        </button>

        {message && <p className="text-gray-700 mt-2">{message}</p>}
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
