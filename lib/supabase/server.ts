import { createServerClient as _createServerClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient(): Promise<SupabaseClient<any, 'public', 'public'>> {
  const cookieStore = await cookies()

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
    if (!url || !anonKey) {
      throw new Error('Missing Supabase environment variables')
    }
  
  return _createServerClient(
    url,
    anonKey,
    {
      cookies: {
        get: (name: string) => {
          const value = cookieStore.get(name)
          return value?.value
        },
        set: (name: string, value: string, options?: any) => {
          try { cookieStore.set(name, value, options) } catch {}
        },
        remove: (name: string, options?: any) => {
          try { cookieStore.set(name, '', { ...options, maxAge: 0 }) } catch {}
        },
      },
    }
  )
}
