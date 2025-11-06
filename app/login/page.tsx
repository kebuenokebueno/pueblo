'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import LoginForm from '@/components/LoginForm'
import { useLoginHandlers } from './handlers'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)

  const { handleLogin, handleGoogleLogin } = useLoginHandlers(
    setEmail,
    setPassword,
    setError,
    setLoading,
    setLoadingGoogle
  )

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
      // Clean up URL
      router.replace('/login')
    }
  }, [searchParams, router])

  return (
    <LoginForm
      email={email}
      password={password}
      error={error}
      loading={loading}
      loadingGoogle={loadingGoogle}
      onEmailChange={(e) => setEmail(e.target.value)}
      onPasswordChange={(e) => setPassword(e.target.value)}
      onSubmit={(e) => {
        e.preventDefault()
        handleLogin(email, password)
      }}
      onGoogleLogin={handleGoogleLogin}
    />
  )
}

