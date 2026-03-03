export interface AsyncStorageAdapter {
  getItem(key: string): Promise<string | null> | string | null
  setItem(key: string, value: string): Promise<void> | void
  removeItem(key: string): Promise<void> | void
}

let storageAdapter: AsyncStorageAdapter | null | undefined

const detectWebLocalStorage = (): AsyncStorageAdapter | null => {
  if (typeof window === 'undefined' || !window.localStorage) return null
  return {
    getItem: async (key: string) => window.localStorage.getItem(key),
    setItem: async (key: string, value: string) => {
      window.localStorage.setItem(key, value)
    },
    removeItem: async (key: string) => {
      window.localStorage.removeItem(key)
    },
  }
}

const getAdapter = async (): Promise<AsyncStorageAdapter | null> => {
  if (storageAdapter !== undefined) return storageAdapter
  storageAdapter = detectWebLocalStorage()
  return storageAdapter
}

export const storageGet = async (key: string): Promise<string | null> => {
  const adapter = await getAdapter()
  if (!adapter) return null
  return adapter.getItem(key);
}

export const storageSet = async (key: string, value: string): Promise<void> => {
  const adapter = await getAdapter()
  if (!adapter) return
  await adapter.setItem(key, value)
}

export const storageRemove = async (key: string): Promise<void> => {
  const adapter = await getAdapter()
  if (!adapter) return
  await adapter.removeItem(key)
}

export const storageAvailable = async (): Promise<boolean> => {
  return (await getAdapter()) !== null
}


