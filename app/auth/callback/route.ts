import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/'

    if (code) {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('OAuth callback error:', error)
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
      }
    } else {
      // No code parameter means something went wrong
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('No authorization code received')}`, request.url))
    }

    // Successfully authenticated, redirect to home or specified next URL
    const redirectUrl = new URL(next, request.url)
    if (redirectUrl.pathname === '/auth/callback') {
      redirectUrl.pathname = '/'
    }
    return NextResponse.redirect(redirectUrl)
  } catch (error: any) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('Authentication failed')}`, request.url))
  }
}


