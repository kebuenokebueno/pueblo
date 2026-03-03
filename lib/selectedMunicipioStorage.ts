import type { Municipio } from '@/lib/types'
import { storageGet, storageSet, storageRemove } from '@/lib/platform/storage'

const SELECTED_MUNICIPIO_KEY = 'selected_municipio'

export const getStoredSelectedMunicipio = async (): Promise<Municipio | null> => {
  try {
    const raw = await storageGet(SELECTED_MUNICIPIO_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Municipio
    return parsed
  } catch {
    return null
  }
}

export const setStoredSelectedMunicipio = async (municipio: Municipio | null): Promise<void> => {
  if (municipio === null) {
    await storageRemove(SELECTED_MUNICIPIO_KEY)
    return
  }
  await storageSet(SELECTED_MUNICIPIO_KEY, JSON.stringify(municipio))
}

export const clearStoredSelectedMunicipio = async (): Promise<void> => {
  await storageRemove(SELECTED_MUNICIPIO_KEY)
}


