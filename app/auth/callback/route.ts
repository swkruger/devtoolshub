import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  console.log('OAuth callback received:', {
    hasCode: !!code,
    error,
    errorDescription,
    url: requestUrl.toString(),
    origin: requestUrl.origin,
    vercelUrl: process.env.VERCEL_URL,
    nodeEnv: process.env.NODE_ENV,
    allEnvVars: Object.keys(process.env).filter(key => key.includes('VERCEL') || key.includes('SUPABASE'))
  })

  // Determine the correct redirect URL based on environment
  const getRedirectUrl = (origin: string) => {
    console.log('getRedirectUrl called with origin:', origin)

    // For Vercel production, use the correct domain
    if (process.env.VERCEL_URL) {
      const redirectUrl = `https://${process.env.VERCEL_URL}/dashboard`
      console.log('Using VERCEL_URL for redirect:', redirectUrl)
      return redirectUrl
    }

    // For local development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      const redirectUrl = `${origin}/dashboard`
      console.log('Using localhost for redirect:', redirectUrl)
      return redirectUrl
    }

    // For production, try to use the correct domain
    if (origin.includes('devtoolskithub.com')) {
      const redirectUrl = 'https://devtoolskithub.com/dashboard'
      console.log('Using devtoolskithub.com for redirect:', redirectUrl)
      return redirectUrl
    }

    // Fallback
    const fallbackUrl = `${origin}/dashboard`
    console.log('Using fallback for redirect:', fallbackUrl)
    return fallbackUrl
  }

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', { error, errorDescription })
    const signInUrl = new URL('/sign-in', getRedirectUrl(requestUrl.origin).replace('/dashboard', ''))
    signInUrl.searchParams.set('error', 'oauth_error')
    signInUrl.searchParams.set('error_description', errorDescription || 'OAuth authentication failed')
    return NextResponse.redirect(signInUrl)
  }

  if (!code) {
    console.error('No authorization code received')
    const signInUrl = new URL('/sign-in', getRedirectUrl(requestUrl.origin).replace('/dashboard', ''))
    signInUrl.searchParams.set('error', 'no_code')
    signInUrl.searchParams.set('error_description', 'No authorization code received')
    return NextResponse.redirect(signInUrl)
  }

  const redirectUrl = getRedirectUrl(requestUrl.origin)
  console.log('Final redirect URL:', redirectUrl)
  let response = NextResponse.redirect(redirectUrl)

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    console.log('Exchanging code for session...', {
      code: code.substring(0, 20) + '...', // Log partial code for debugging
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      expectedCallbackUrl: getRedirectUrl(requestUrl.origin).replace('/dashboard', '/auth/callback'),
      actualCallbackUrl: requestUrl.toString()
    })

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Code exchange error:', {
        message: exchangeError.message,
        status: exchangeError.status,
        details: exchangeError
      })
      throw exchangeError
    }

    if (!data.session) {
      console.error('Code exchange succeeded but no session returned')
      throw new Error('No session returned from code exchange')
    }

    console.log('Code exchange successful:', {
      hasSession: !!data.session,
      hasUser: !!data.user,
      userId: data.user?.id,
      userEmail: data.user?.email,
      sessionExpiry: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : null
    })

    // Set proper cookie options for Vercel production
    try {
      if (data.session?.access_token) {
        response.cookies.set('sb-access-token', data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        })
        console.log('Access token cookie set')
      }

      if (data.session?.refresh_token) {
        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
        })
        console.log('Refresh token cookie set')
      }

      console.log('Session cookies set, redirecting to dashboard for profile sync...', {
        redirectUrl,
        origin: requestUrl.origin,
        hasAccessToken: !!data.session?.access_token,
        hasRefreshToken: !!data.session?.refresh_token
      })
    } catch (cookieError) {
      console.error('Error setting cookies:', cookieError)
      // Continue with redirect even if cookie setting fails
    }

  } catch (error) {
    console.error('Error in OAuth callback:', error)
    const signInUrl = new URL('/sign-in', getRedirectUrl(requestUrl.origin).replace('/dashboard', ''))
    signInUrl.searchParams.set('error', 'auth_error')
    signInUrl.searchParams.set('error_description', 'Failed to complete authentication')
    return NextResponse.redirect(signInUrl)
  }

  return response
} 