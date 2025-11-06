'use client'

import { useEffect } from 'react'
import { captureAndStoreLocation } from '@/lib/locationStorage'

export default function LocationCapture() {
  useEffect(() => {
    captureAndStoreLocation({ maxAgeMs: 60_000 }).catch(() => {})
  }, [])

  return null
}


