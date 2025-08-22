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
    url: requestUrl.toString()
  })

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', { error, errorDescription })
    const signInUrl = new URL('/sign-in', requestUrl.origin)
    signInUrl.searchParams.set('error', 'oauth_error')
    signInUrl.searchParams.set('error_description', errorDescription || 'OAuth authentication failed')
    return NextResponse.redirect(signInUrl)
  }

  if (!code) {
    console.error('No authorization code received')
    const signInUrl = new URL('/sign-in', requestUrl.origin)
    signInUrl.searchParams.set('error', 'no_code')
    signInUrl.searchParams.set('error_description', 'No authorization code received')
    return NextResponse.redirect(signInUrl)
  }

  let response = NextResponse.redirect(`${requestUrl.origin}/dashboard`)

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

    console.log('Exchanging code for session...')
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      throw exchangeError
    }

    console.log('Code exchange successful:', {
      hasSession: !!data.session,
      hasUser: !!data.user,
      userId: data.user?.id,
      userEmail: data.user?.email
    })

    // Set proper cookie options for Vercel production
    if (data.session?.access_token) {
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
    }

    if (data.session?.refresh_token) {
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })
    }

    console.log('Session cookies set, redirecting to dashboard for profile sync...')

  } catch (error) {
    console.error('Error in OAuth callback:', error)
    const signInUrl = new URL('/sign-in', requestUrl.origin)
    signInUrl.searchParams.set('error', 'auth_error')
    signInUrl.searchParams.set('error_description', 'Failed to complete authentication')
    return NextResponse.redirect(signInUrl)
  }

  return response
} 