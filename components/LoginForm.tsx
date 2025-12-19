'use client'

import Link from 'next/link'
import Image from 'next/image'

interface LoginFormProps {
  email: string
  password: string
  error: string | null
  loading: boolean
  loadingGoogle: boolean
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  onGoogleLogin: () => void
}

const GoogleIcon = () => (
  <svg
    aria-hidden="true"
    width="18"
    height="18"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.893 31.658 29.389 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.869 5.053 29.706 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.816C14.464 16.104 18.879 13 24 13c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.869 5.053 29.706 3 24 3c-7.59 0-14.088 4.26-17.694 10.491z"/>
    <path fill="#4CAF50" d="M24 43c5.342 0 10.216-2.045 13.9-5.371l-6.422-5.432C29.42 33.551 26.872 34.5 24 34.5c-5.357 0-9.875-3.571-11.5-8.5l-6.61 5.098C9.46 38.798 16.153 43 24 43z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.009 2.936-3.167 5.217-5.825 6.414l6.422 5.432C38.97 36.919 44 31.5 44 23c0-1.341-.138-2.651-.389-3.917z"/>
  </svg>
)

export default function LoginForm({
  email,
  password,
  error,
  loading,
  loadingGoogle,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onGoogleLogin,
}: LoginFormProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#eaf2ff] to-[#eef7ef] px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-xl ring-1 ring-black/[0.04]">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <Image src="/aquiahora-logo.svg" alt="AquiAhora logo" width={40} height={40} priority />
            <span className="text-2xl font-semibold tracking-tight text-zinc-900">AquiAhora</span>
          </div>
          <h2 className="text-left w-full text-zinc-700 font-medium">Log in here</h2>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">E-mail address</label>
            <input
              type="email"
              placeholder="e-mail address"
              className="w-full rounded-xl border-2 border-zinc-200 px-4 py-3 text-zinc-900 outline-none ring-offset-0 focus:border-blue-500"
              value={email}
              onChange={onEmailChange}
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
              onChange={onPasswordChange}
              autoComplete="current-password"
            />
            <div className="text-right">
              <button type="button" className="text-xs font-medium text-blue-600 hover:underline">
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200" />
          <span className="text-xs text-zinc-500">Or log in with Google</span>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        <button
          type="button"
          disabled={loadingGoogle}
          onClick={onGoogleLogin}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-3 text-zinc-800 transition hover:bg-zinc-50"
        >
          {!loadingGoogle && <GoogleIcon />}
          {loadingGoogle ? 'Redirecting…' : 'Google'}
        </button>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex items-center justify-center text-sm text-zinc-600">
          <span>New here? </span>
          <Link href="/signup" className="ml-2 font-medium text-blue-600 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}

