import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  console.log('🧪🧪🧪 OAUTH FLOW TEST ROUTE HIT 🧪🧪🧪', {
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method
  })

  try {
    const supabase = createSupabaseServerClient()
    
    // Test 1: Check if we can create a Supabase client
    console.log('✅ Supabase client created successfully')
    
    // Test 2: Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('Session check result:', {
      hasSession: !!session,
      hasError: !!sessionError,
      error: sessionError?.message
    })
    
    // Test 3: Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('User check result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      hasError: !!userError,
      error: userError?.message
    })
    
    // Test 4: Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      vercelUrl: process.env.VERCEL_URL
    }
    console.log('Environment check:', envCheck)
    
    // Test 5: Check OAuth configuration
    const oauthConfig = {
      expectedCallbackUrl: 'https://www.devtoolskithub.com/auth/callback',
      supabaseCallbackUrl: 'https://nhghwzfrdbfrauktfluy.supabase.co/auth/v1/callback',
      currentOrigin: new URL(request.url).origin,
      isCustomDomain: new URL(request.url).hostname === 'www.devtoolskithub.com'
    }
    console.log('OAuth configuration:', oauthConfig)
    
    // Test 6: Check cookies
    const cookies = request.cookies
    const cookieCheck = {
      hasAccessToken: cookies.has('sb-access-token'),
      hasRefreshToken: cookies.has('sb-refresh-token'),
      hasSessionCookie: cookies.has('sb-session'),
      allCookies: Array.from(cookies.getAll()).map(cookie => cookie.name)
    }
    console.log('Cookie check:', cookieCheck)
    
    const results: {
      timestamp: string
      url: string
      method: string
      tests: {
        supabaseClient: string
        session: {
          hasSession: boolean
          error: string | null
        }
        user: {
          hasUser: boolean
          userId: string | null
          userEmail: string | null
          error: string | null
        }
        environment: typeof envCheck
        oauth: typeof oauthConfig
        cookies: typeof cookieCheck
      }
      recommendations: Array<{
        issue: string
        action: string
        priority: string
      }>
    } = {
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method,
      tests: {
        supabaseClient: 'PASS',
        session: {
          hasSession: !!session,
          error: sessionError?.message || null
        },
        user: {
          hasUser: !!user,
          userId: user?.id || null,
          userEmail: user?.email || null,
          error: userError?.message || null
        },
        environment: envCheck,
        oauth: oauthConfig,
        cookies: cookieCheck
      },
      recommendations: []
    }
    
    // Generate recommendations
    if (!session && !user) {
      results.recommendations.push({
        issue: 'No active session',
        action: 'User needs to sign in via OAuth',
        priority: 'HIGH'
      })
    }
    
    if (!envCheck.hasSupabaseUrl || !envCheck.hasAnonKey) {
      results.recommendations.push({
        issue: 'Missing Supabase environment variables',
        action: 'Check Vercel environment variables',
        priority: 'CRITICAL'
      })
    }
    
    if (oauthConfig.isCustomDomain && oauthConfig.expectedCallbackUrl !== oauthConfig.supabaseCallbackUrl) {
      results.recommendations.push({
        issue: 'OAuth callback URL mismatch',
        action: 'Supabase callback URL is fixed, but app expects custom domain callback',
        priority: 'HIGH'
      })
    }
    
    console.log('🧪🧪🧪 OAUTH FLOW TEST COMPLETED 🧪🧪🧪', results)
    
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('🚨🚨🚨 OAUTH FLOW TEST ERROR 🚨🚨🚨:', error)
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}
