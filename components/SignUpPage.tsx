'use client'

import { useState, useEffect, startTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { getPuebloClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getPuebloClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agree, setAgree] = useState(true)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const passwordsMatch = password === confirmPassword && password.length > 0

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (!errorParam) return

    const decodedError = decodeURIComponent(errorParam)
    startTransition(() => {
      setMessage(decodedError)
    })

    router.replace('/signup')
  }, [searchParams, router])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      return
    }
    if (!agree) {
      setMessage('Please accept the terms to continue')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      setLoading(false)
      if (error || !data.user) {
        setMessage(error?.message || 'Sign up failed')
        return
      }
      setMessage('Account created! Check your email for confirmation.')
      router.push('/login')
    } catch (error: unknown) {
      setLoading(false)
      setMessage('Network error')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#eaf2ff] to-[#eef7ef] px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-xl ring-1 ring-black/[0.04]">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <Image src="/aquiahora-logo.svg" alt="AquiAhora logo" width={40} height={40} priority />
            <span className="text-2xl font-semibold tracking-tight text-zinc-900">AquiAhora</span>
          </div>
          <h2 className="w-full text-left font-medium text-zinc-700">Create an account</h2>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">E-mail address</label>
            <input
              type="email"
              placeholder="e-mail address"
              className="w-full rounded-xl border-2 border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">Password</label>
            <input
              type="password"
              placeholder="password"
              className="w-full rounded-xl border-2 border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">Repeat password</label>
            <input
              type="password"
              placeholder="password"
              className={`w-full rounded-xl border-2 px-4 py-3 text-zinc-900 outline-none focus:border-blue-500 ${passwordsMatch || confirmPassword.length === 0 ? 'border-zinc-200' : 'border-red-500'}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            {!passwordsMatch && confirmPassword.length > 0 && (
              <p className="text-xs text-red-600">Passwords must match.</p>
            )}
          </div>

        <label className="mt-2 flex items-start gap-3 text-sm text-zinc-700">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <span>
            I agree with the terms and conditions and privacy statement
          </span>
        </label>

          <button
            type="submit"
            disabled={loading || !agree || !passwordsMatch}
            className="w-full rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create an account'}
          </button>
        </form>

        {message && <p className="mt-3 text-sm text-red-600">{message}</p>}

        <div className="mt-6 text-center text-sm text-zinc-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  )
}
