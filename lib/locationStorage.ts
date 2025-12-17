import { fetchLocation, LocationFetchOptions, LocationSnapshot, setLocationProvider } from './platform/location'
import {
  storageAvailable,
  storageGet,
  storageRemove,
  storageSet,
  setStorageAdapter,
} from './platform/storage'

export const LOCATION_KEY = 'userLocation'
export const LOCATION_TIMESTAMP_KEY = 'userLocationSavedAt'

export interface CaptureAndStoreOptions extends LocationFetchOptions {
  force?: boolean
  maxAgeMs?: number
}

export const registerLocationProvider = setLocationProvider
export const registerStorageAdapter = setStorageAdapter

export const captureAndStoreLocation = async (
  options: CaptureAndStoreOptions = {}
): Promise<LocationSnapshot | null> => {
  if (!(await storageAvailable())) return null

  const { force = false, maxAgeMs = 5 * 60 * 1000, ...fetchOptions } = options

  if (!force) {
    const raw = await storageGet(LOCATION_TIMESTAMP_KEY)
    const ts = raw ? Number(raw) : NaN
    if (!Number.isNaN(ts) && Date.now() - ts < maxAgeMs) {
        const cached = await storageGet(LOCATION_KEY)
        if (cached) {
            try {
                return JSON.parse(cached) as LocationSnapshot
            } catch {
                // fall through to refresh
            }
        }
    }
  }

  const location = await fetchLocation(fetchOptions)
  if (!location) return null

  await storageSet(LOCATION_KEY, JSON.stringify(location))
  await storageSet(LOCATION_TIMESTAMP_KEY, String(location.timestamp ?? Date.now()))

  return location
}

export const clearStoredLocation = async () => {
  if (!(await storageAvailable())) return
  await storageRemove(LOCATION_KEY)
  await storageRemove(LOCATION_TIMESTAMP_KEY)
}
