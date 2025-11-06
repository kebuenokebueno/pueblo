import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | null = null

export const getPuebloClient = (): SupabaseClient => {
    if (supabase) return supabase

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
        throw new Error('Missing Supabase environment variables')
    }

    supabase = createClient(url, anonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            storage: localStorage,
        },
    })

    return supabase
}
