import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.error('🚨🚨🚨 CRITICAL OAUTH CALLBACK TRIGGERED 🚨🚨🚨:', {
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    searchParams: Object.fromEntries(request.nextUrl.searchParams.entries())
  })

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('🚨🚨🚨 OAUTH ERROR IN CALLBACK 🚨🚨🚨:', { error, errorDescription })
    const signInUrl = new URL('/sign-in', requestUrl.origin)
    signInUrl.searchParams.set('error', error)
    if (errorDescription) {
      signInUrl.searchParams.set('error_description', errorDescription)
    }
    return NextResponse.redirect(signInUrl)
  }

  // Validate code parameter
  if (!code) {
    console.error('🚨🚨🚨 NO CODE PARAMETER IN OAUTH CALLBACK 🚨🚨🚨')
    const signInUrl = new URL('/sign-in', requestUrl.origin)
    signInUrl.searchParams.set('error', 'missing_code')
    signInUrl.searchParams.set('error_description', 'No authorization code provided')
    return NextResponse.redirect(signInUrl)
  }

  try {
    console.log('🔥 OAUTH CALLBACK TRIGGERED 🔥', {
      timestamp: new Date().toISOString(),
      code: code.substring(0, 10) + '...', // Log partial code for security
      origin: requestUrl.origin,
      hostname: requestUrl.hostname
    })

    // Create Supabase client
    const supabase = createSupabaseServerClient()
    console.log('✅ Supabase client created successfully')

    // Exchange code for session
    console.log('🔄 Exchanging code for session...')
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('🚨🚨🚨 CODE EXCHANGE ERROR 🚨🚨🚨:', exchangeError)
      const signInUrl = new URL('/sign-in', requestUrl.origin)
      signInUrl.searchParams.set('error', 'exchange_error')
      signInUrl.searchParams.set('error_description', exchangeError.message)
      return NextResponse.redirect(signInUrl)
    }

    console.log('✅ Code exchanged successfully', {
      hasUser: !!data.user,
      hasSession: !!data.session,
      userId: data.user?.id
    })

    // Determine redirect URL
    const getRedirectUrl = (origin: string) => {
      console.log('getRedirectUrl called with origin:', origin)
      if (origin && origin.startsWith('https://')) {
        const redirectUrl = `${origin}/dashboard`
        console.log('Using origin for redirect:', redirectUrl)
        return redirectUrl
      }
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        const redirectUrl = `${origin}/dashboard`
        console.log('Using localhost for redirect:', redirectUrl)
        return redirectUrl
      }
      const fallbackUrl = 'https://www.devtoolskithub.com/dashboard'
      console.log('Using final fallback for redirect:', fallbackUrl)
      return fallbackUrl
    }

    const redirectUrl = getRedirectUrl(requestUrl.origin)
    console.log('🎯 Final redirect URL:', redirectUrl)

    // Create response with redirect
    const response = NextResponse.redirect(redirectUrl)
    
    // Set session cookies if available
    if (data.session) {
      console.log('🍪 Setting session cookies...')
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

    console.log('✅ OAuth callback completed successfully, redirecting to:', redirectUrl)
    return response

  } catch (error) {
    console.error('🚨🚨🚨 CRITICAL ERROR IN OAUTH CALLBACK 🚨🚨🚨:', error)
    const signInUrl = new URL('/sign-in', requestUrl.origin)
    signInUrl.searchParams.set('error', 'callback_error')
    signInUrl.searchParams.set('error_description', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.redirect(signInUrl)
  }
} 