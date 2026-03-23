import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import type { Municipio } from '@/lib/types'

interface AppStore {
  // Estado UI
  selectedMunicipio: Municipio | null
  sidebarOpen: boolean
  
  // Actions
  setSelectedMunicipio: (municipio: Municipio | null) => void
  clearSelectedMunicipio: () => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        selectedMunicipio: null,
        sidebarOpen: true,
        
        // Actions
        setSelectedMunicipio: (municipio) => 
          set({ selectedMunicipio: municipio }, false, 'setSelectedMunicipio'),
        
        clearSelectedMunicipio: () => 
          set({ selectedMunicipio: null }, false, 'clearSelectedMunicipio'),
        
        toggleSidebar: () => 
          set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),
      }),
      {
        name: 'app-storage', // localStorage key
        partialize: (state) => ({
          selectedMunicipio: state.selectedMunicipio,
        }),
      }
    ),
    { name: 'pueblo/ui' }
  )
)
