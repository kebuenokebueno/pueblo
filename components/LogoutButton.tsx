'use client'

import { clearStoredLocation } from '@/lib/locationStorage'
import { useRouter } from 'next/navigation'
import { getPuebloClient } from '@/lib/supabase/client'
import { useAppDispatch } from '@/lib/store/hooks'
import { resetMunicipios } from '@/lib/store/municipiosSlice'

export default function LogoutButton() {
  const supabase = getPuebloClient()
  const router = useRouter()
  const dispatch = useAppDispatch()

  const handleLogout = async () => {
    try {
      await clearStoredLocation()
    } catch {}
    await supabase.auth.signOut()
    dispatch(resetMunicipios())
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
