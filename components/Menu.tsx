'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { clearStoredLocation } from '@/lib/locationStorage'
import { getPuebloClient } from '@/lib/supabase/client'
import { useAppDispatch } from '@/lib/store/hooks'
import { resetMunicipios } from '@/lib/store/municipiosSlice'

type MenuProps = {
  onClose: () => void
}

export default function Menu({ onClose }: MenuProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const supabase = getPuebloClient()

  const handleLogout = async () => {
    try {
      await clearStoredLocation()
    } catch {}
    await supabase.auth.signOut()
    dispatch(resetMunicipios())
    router.push('/login')
  }

  const handleSeeEntries = () => {
    router.push('/entries')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[1500] flex items-end bg-black/30" onClick={onClose}>
      <div
        className="w-full rounded-t-3xl bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Menu</h2>
          <button
            className="rounded-full p-2 text-zinc-600 hover:bg-zinc-100"
            aria-label="Close"
            onClick={onClose}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleSeeEntries}
            className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-left text-zinc-900 transition hover:bg-zinc-50"
          >
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-medium">See all entries</span>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="w-full rounded-xl border-2 border-red-200 bg-white px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
          >
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-medium">Logout</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

