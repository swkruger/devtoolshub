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

  // Simple redirect URL logic - use the actual request origin
  const getRedirectUrl = (origin: string) => {
    console.log('getRedirectUrl called with origin:', origin)

    // For production domains, use the origin directly
    if (origin && origin.startsWith('https://')) {
      const redirectUrl = `${origin}/dashboard`
      console.log('Using origin for redirect:', redirectUrl)
      return redirectUrl
    }

    // For localhost development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      const redirectUrl = `${origin}/dashboard`
      console.log('Using localhost for redirect:', redirectUrl)
      return redirectUrl
    }

    // Final fallback
    const fallbackUrl = 'https://www.devtoolskithub.com/dashboard'
    console.log('Using final fallback for redirect:', fallbackUrl)
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
    console.log('Creating Supabase client with:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const value = request.cookies.get(name)?.value
            console.log(`Cookie get: ${name} = ${value ? 'present' : 'not found'}`)
            return value
          },
          set(name: string, value: string, options: any) {
            console.log(`Cookie set: ${name} = ${value?.substring(0, 20)}...`)
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            console.log(`Cookie remove: ${name}`)
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

    console.log('About to exchange code for session...')
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    console.log('Code exchange result:', {
      hasData: !!data,
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      error: exchangeError ? {
        message: exchangeError.message,
        status: exchangeError.status,
        name: exchangeError.name,
        details: exchangeError
      } : null
    })

    if (exchangeError) {
      console.error('Code exchange error:', {
        message: exchangeError.message,
        status: exchangeError.status,
        name: exchangeError.name,
        details: exchangeError,
        code: code?.substring(0, 20) + '...',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
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