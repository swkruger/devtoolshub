import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('OAuth callback received, code:', code ? 'present' : 'missing')
  console.log('OAuth callback URL:', requestUrl.toString())
  console.log('OAuth callback origin:', requestUrl.origin)

  let response = NextResponse.redirect(`${requestUrl.origin}/dashboard`)

  if (code) {
    console.log('OAuth callback: Processing authorization code...')
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = request.cookies.get(name)?.value
            console.log(`OAuth callback: Getting cookie ${name}:`, cookie ? 'present' : 'missing')
            return cookie
          },
          set(name: string, value: string, options: any) {
            console.log(`OAuth callback: Setting cookie ${name} with options:`, options)
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            console.log(`OAuth callback: Removing cookie ${name}`)
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    try {
      console.log('OAuth callback: Exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('OAuth callback: Code exchange result:', { 
        hasSession: !!data.session, 
        hasUser: !!data.user,
        userEmail: data.user?.email,
        sessionExpiresAt: data.session?.expires_at,
        error: error?.message || 'No error'
      })
      
      if (error) {
        console.error('OAuth callback: Code exchange error:', error)
        throw error
      }

      if (data.session) {
        console.log('OAuth callback: Session established successfully')
        if (data.session.expires_at) {
          console.log('OAuth callback: Session expires at:', new Date(data.session.expires_at * 1000).toISOString())
        } else {
          console.log('OAuth callback: Session expires_at is undefined')
        }
      } else {
        console.error('OAuth callback: No session returned from code exchange')
      }

      console.log('OAuth successful, redirecting to dashboard for client-side profile sync...')
      
    } catch (error) {
      console.error('OAuth callback: Error exchanging code for session:', error)
      // Redirect to sign-in page with error
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=auth_error`)
    }
  } else {
    console.error('OAuth callback: No authorization code received')
  }

  console.log('OAuth callback: Redirecting to dashboard...')
  return response
} 