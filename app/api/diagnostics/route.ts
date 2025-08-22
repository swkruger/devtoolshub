import { NextRequest, NextResponse } from 'next/server'
import { validateProductionEnvironment } from '@/lib/utils'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const results: {
    environment: {
      NODE_ENV: string | undefined
      VERCEL_ENV: string | undefined
      VERCEL_URL: string | undefined
      timestamp: string
    }
    validation: {
      passed: boolean
      issues: string[]
    }
    supabase: {
      hasUrl: boolean
      hasAnonKey: boolean
      hasServiceKey: boolean
      urlFormat: string
    }
    auth: {
      status: string
      hasSession: boolean
      userId: string | null
      error: string | null
    }
  } = {
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      timestamp: new Date().toISOString()
    },
    validation: {
      passed: false,
      issues: [] as string[]
    },
    supabase: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      urlFormat: 'unknown'
    },
    auth: {
      status: 'unknown',
      hasSession: false,
      userId: null,
      error: null
    }
  }

  // Run environment validation
  try {
    results.validation.passed = validateProductionEnvironment()
  } catch (error) {
    results.validation.issues.push(`Validation error: ${error}`)
  }

  // Check Supabase URL format
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
      results.supabase.urlFormat = url.hostname.includes('.supabase.co') ? 'valid' : 'invalid'
    } catch {
      results.supabase.urlFormat = 'invalid'
    }
  }

  // Test authentication
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    results.auth.status = error ? 'error' : (user ? 'authenticated' : 'no_session')
    results.auth.hasSession = !!user
    results.auth.userId = user?.id || null
    results.auth.error = error?.message || null
  } catch (error) {
    results.auth.status = 'error'
    results.auth.error = error instanceof Error ? error.message : 'Unknown error'
  }

  const statusCode = results.validation.passed && results.auth.hasSession ? 200 :
                    results.validation.passed ? 207 : 500

  return NextResponse.json(results, { status: statusCode })
}
