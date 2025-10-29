import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LognLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.auth.getUser()

  if (data.user) redirect('/') // Already logged in → redirect to home

  return <>{children}</>
}
