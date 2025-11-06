import { registerStorageAdapter, registerLocationProvider } from './locationStorage'
import type { LocationFetchOptions, LocationSnapshot } from './platform/location'

export interface RNStorageLike {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}

export type RNLocationProvider = (
  options?: LocationFetchOptions
) => Promise<LocationSnapshot | null>

export interface ConfigureReactNativePlatformOptions {
  storage?: RNStorageLike
  getCurrentPosition?: RNLocationProvider
}

export const configureReactNativePlatform = (
  options: ConfigureReactNativePlatformOptions
) => {
  const { storage, getCurrentPosition } = options

  if (storage) {
    registerStorageAdapter({
      getItem: storage.getItem,
      setItem: storage.setItem,
      removeItem: storage.removeItem,
    })
  }

  if (getCurrentPosition) {
    registerLocationProvider(async (opts?: LocationFetchOptions) => getCurrentPosition(opts))
  }
}

export interface ExpoLocationModule {
  requestForegroundPermissionsAsync(): Promise<{ status: 'granted' | 'denied' }>
  getCurrentPositionAsync(options?: {
    accuracy?: number
    maximumAge?: number
    timeout?: number
  }): Promise<{
    coords: {
      latitude: number
      longitude: number
      accuracy?: number | null
    }
    timestamp?: number
  }>
  Accuracy?: {
    High?: number
    Balanced?: number
  }
}

export const createExpoLocationProvider = (Location: ExpoLocationModule): RNLocationProvider => {
  return async (options) => {
    try {
      const {
        timeoutMs = 5000,
        maximumAgeMs = 60000,
        enableHighAccuracy = false,
      } = options ?? {}

      if (!Location?.requestForegroundPermissionsAsync || !Location?.getCurrentPositionAsync) {
        return null
      }

      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return null

      const accuracy = enableHighAccuracy ? Location.Accuracy?.High ?? 5 : Location.Accuracy?.Balanced

      const position = await Location.getCurrentPositionAsync({
        accuracy,
        maximumAge: maximumAgeMs,
        timeout: timeoutMs,
      })

      if (!position?.coords) return null

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: typeof position.coords.accuracy === 'number' ? position.coords.accuracy : undefined,
        timestamp: position.timestamp ?? Date.now(),
      }
    } catch {
      return null
    }
  }
}

export interface RNCommunityGeolocationModule {
  getCurrentPosition(
    success: (position: {
      coords: {
        latitude: number
        longitude: number
        accuracy?: number
      }
      timestamp?: number
    }) => void,
    error?: () => void,
    options?: {
      timeout?: number
      maximumAge?: number
      enableHighAccuracy?: boolean
    }
  ): void
}

export const createRNCommunityLocationProvider = (
  Geolocation: RNCommunityGeolocationModule
): RNLocationProvider => {
  return async (options) => {
    const {
      timeoutMs = 5000,
      maximumAgeMs = 60000,
      enableHighAccuracy = false,
    } = options ?? {}

    return await new Promise<LocationSnapshot | null>((resolve) => {
      let settled = false
      const finish = (value: LocationSnapshot | null) => {
        if (settled) return
        settled = true
        clearTimeout(timeout)
        resolve(value)
      }

      const timeout = setTimeout(() => finish(null), timeoutMs + 1000)

      try {
        Geolocation.getCurrentPosition(
          (position) => {
            finish({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp ?? Date.now(),
            })
          },
          () => finish(null),
          {
            timeout: timeoutMs,
            maximumAge: maximumAgeMs,
            enableHighAccuracy,
          }
        )
      } catch {
        finish(null)
      }
    })
  }
}


