// ==========================================
// components/LogoutButton.tsx (ACTUALIZADO)
// ==========================================
'use client'

import { useRouter } from 'next/navigation'
import { getPuebloClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'  // ✅ CAMBIO
import { useAppStore } from '@/lib/store/useAppStore'   // ✅ CAMBIO (si usas selectedMunicipio)

export default function LogoutButton() {
    const router = useRouter()
    const queryClient = useQueryClient()  // ✅ Para limpiar cache
    const clearSelectedMunicipio = useAppStore(state => state.clearSelectedMunicipio)  // ✅ Si usas Zustand

    const handleLogout = async () => {
        const supabase = getPuebloClient()

        // 1. Logout de Supabase
        await supabase.auth.signOut()

        // 2. Limpiar cache de TanStack Query
        queryClient.clear()

        // 3. Limpiar estado UI de Zustand (opcional)
        clearSelectedMunicipio()

        // 4. Redirect a login o home
        router.push('/login')  // o '/'
    }

    return (
        <button onClick={handleLogout}>
            Logout
        </button>
    )
}