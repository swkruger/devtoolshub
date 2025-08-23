import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    const signInUrl = new URL('/sign-in', requestUrl.origin)
    signInUrl.searchParams.set('error', error)
    if (errorDescription) {
      signInUrl.searchParams.set('error_description', errorDescription)
    }
    return NextResponse.redirect(signInUrl)
  }

  // Validate code parameter
  if (!code) {
    const signInUrl = new URL('/sign-in', requestUrl.origin)
    signInUrl.searchParams.set('error', 'missing_code')
    signInUrl.searchParams.set('error_description', 'No authorization code provided')
    return NextResponse.redirect(signInUrl)
  }

  try {
    // Create Supabase client
    const supabase = createSupabaseServerClient()

    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      const signInUrl = new URL('/sign-in', requestUrl.origin)
      signInUrl.searchParams.set('error', 'exchange_error')
      signInUrl.searchParams.set('error_description', exchangeError.message)
      return NextResponse.redirect(signInUrl)
    }

    // Determine redirect URL
    const getRedirectUrl = (origin: string) => {
      if (origin && origin.startsWith('https://')) {
        return `${origin}/dashboard`
      }
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return `${origin}/dashboard`
      }
      return 'https://www.devtoolskithub.com/dashboard'
    }

    const redirectUrl = getRedirectUrl(requestUrl.origin)

    // Create response with redirect
    const response = NextResponse.redirect(redirectUrl)
    
    // Set session cookies if available
    if (data.session) {
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: data.session.expires_in
      })
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      })
    }

    return response

  } catch (error) {
    const signInUrl = new URL('/sign-in', requestUrl.origin)
    signInUrl.searchParams.set('error', 'callback_error')
    signInUrl.searchParams.set('error_description', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.redirect(signInUrl)
  }
} 