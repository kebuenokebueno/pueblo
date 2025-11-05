'use client'

import { createClient } from '@/lib/supabase/client'
import { clearStoredLocation } from '@/lib/locationStorage'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await clearStoredLocation()
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
