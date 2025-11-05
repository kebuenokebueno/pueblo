'use client'

import { useEffect } from 'react'

export default function LocationCapture() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const save = (value: unknown) => {
      try {
        window.localStorage.setItem('userLocation', JSON.stringify(value))
      } catch {}
    }

    const doneKey = 'userLocationSavedAt'
    const last = typeof window !== 'undefined' ? window.localStorage.getItem(doneKey) : null
    if (last) return

    if ('geolocation' in navigator) {
      const controller = new AbortController()
      const timeout = setTimeout(() => {
        try { controller.abort() } catch {}
      }, 5000)

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeout)
          const payload = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: Date.now(),
          }
          save(payload)
          try { window.localStorage.setItem(doneKey, String(Date.now())) } catch {}
        },
        (err) => {
          clearTimeout(timeout)
          save({ error: err?.code || 'unknown', timestamp: Date.now() })
          try { window.localStorage.setItem(doneKey, String(Date.now())) } catch {}
        },
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 5000 }
      )
    }
  }, [])

  return null
}


