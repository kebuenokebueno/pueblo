'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPuebloClient } from '@/lib/supabase/client'

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
      const supabase = createPuebloClient()
      supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/')
      } else {
        setChecking(false)
      }
    })
  }, [router])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-2xl shadow-md">Checking session…</div>
      </div>
    )
  }

  return <>{children}</>
}
