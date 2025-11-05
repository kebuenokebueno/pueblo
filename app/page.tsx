'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import HomePage from '@/components/HomePage'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState<'loading' | 'authed'>('loading')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setStatus('authed')
      } else {
        router.replace('/login')
      }
    })
  }, [router, supabase])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-2xl shadow-md">Checking session…</div>
      </div>
    )
  }

  return <HomePage />
}