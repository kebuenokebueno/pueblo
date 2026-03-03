'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HomePage from '@/components/HomePage'
import { useSession } from '@/lib/queries/useSession'

export default function Home() {
  const router = useRouter()
  const { data: session, isLoading } = useSession()

  useEffect(() => {
    if (isLoading) return
    if (!session) router.replace('/login')
  }, [isLoading, router, session])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-2xl shadow-md">Checking session…</div>
      </div>
    )
  }

  if (!session) return null
  return <HomePage />
}