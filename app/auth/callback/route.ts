import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('OAuth callback received, code:', code ? 'present' : 'missing')

  let response = NextResponse.redirect(`${requestUrl.origin}/dashboard`)

  if (code) {
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
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      console.log('Code exchange result:', { 
        hasSession: !!data.session, 
        hasUser: !!data.user, 
        error: error?.message 
      })
      
      if (error) {
        throw error
      }

      console.log('OAuth successful, redirecting to dashboard for client-side profile sync...')
      
    } catch (error) {
      console.error('Error exchanging code for session:', error)
      // Redirect to sign-in page with error
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=auth_error`)
    }
  }

  console.log('Redirecting to dashboard...')
  return response
} 