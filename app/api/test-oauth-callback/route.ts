import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Manual test endpoint for OAuth callback debugging
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.json({
      error: 'No code provided',
      usage: 'Add ?code=YOUR_OAUTH_CODE to test'
    })
  }

  console.log('Manual OAuth callback test with code:', code.substring(0, 20) + '...')

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() { return undefined },
          set() { },
          remove() { }
        }
      }
    )

    console.log('Testing Supabase connection...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    console.log('Current user check:', {
      hasUser: !!user,
      userId: user?.id,
      error: userError?.message
    })

    console.log('Attempting code exchange...')
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    console.log('Code exchange result:', {
      hasData: !!data,
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      sessionUserId: data?.session?.user?.id,
      error: exchangeError ? {
        message: exchangeError.message,
        status: exchangeError.status,
        name: exchangeError.name
      } : null
    })

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      codeProvided: code.substring(0, 20) + '...',
      connectionTest: {
        success: !userError,
        hasUser: !!user,
        userId: user?.id,
        error: userError?.message
      },
      codeExchange: {
        success: !exchangeError,
        hasSession: !!data?.session,
        hasUser: !!data?.user,
        sessionUserId: data?.session?.user?.id,
        error: exchangeError ? {
          message: exchangeError.message,
          status: exchangeError.status,
          name: exchangeError.name
        } : null
      }
    })

  } catch (error) {
    console.error('Manual OAuth callback test failed:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
