'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('userLocation')
        window.localStorage.removeItem('userLocationSavedAt')
      }
    } catch {}
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="mt-4 text-blue-600 underline"
    >
      Logout
    </button>
  )
}
