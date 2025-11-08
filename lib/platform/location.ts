import { Geolocation } from '@capacitor/geolocation'
import { Capacitor } from '@capacitor/core'


export interface LocationSnapshot {
  lat: number
  lng: number
  accuracy?: number
  timestamp: number
}

export interface LocationFetchOptions {
  timeoutMs?: number
  maximumAgeMs?: number
  enableHighAccuracy?: boolean
}

export type LocationProvider = (
  options?: LocationFetchOptions
) => Promise<LocationSnapshot | null>

let customProvider: LocationProvider | null = null

export const setLocationProvider = (provider: LocationProvider | null) => {
  customProvider = provider
}

const defaultProvider: LocationProvider = async (options) => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return null

  const {
    timeoutMs = 5000,
    maximumAgeMs = 60000,
    enableHighAccuracy = false,
  } = options ?? {}

  return await new Promise<LocationSnapshot | null>((resolve) => {
    let resolved = false
    const finish = (value: LocationSnapshot | null) => {
      if (resolved) return
      resolved = true
      clearTimeout(timeout)
      resolve(value)
    }

    const timeout = setTimeout(() => finish(null), timeoutMs + 1000)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        finish({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp || Date.now(),
        })
      },
      () => finish(null),
      {
        enableHighAccuracy,
        maximumAge: maximumAgeMs,
        timeout: timeoutMs,
      }
    )
  })
}

const capacitorProvider: LocationProvider = async (options) => {
    try {
        const pos = await Geolocation.getCurrentPosition({
            enableHighAccuracy: options?.enableHighAccuracy ?? true,
            timeout: options?.timeoutMs ?? 5000,
        })
        return {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp ?? Date.now(),
        }
    } catch (err) {
        console.warn('Capacitor Geolocation failed', err)
        return null
    }
}

export const fetchLocation = async (
    options?: LocationFetchOptions
): Promise<LocationSnapshot | null> => {
    if (customProvider) {
        try {
            return await customProvider(options)
        } catch {
            return null
        }
    }

    if (Capacitor.isNativePlatform()) {
        return capacitorProvider(options)
    }

    return defaultProvider(options)
}


