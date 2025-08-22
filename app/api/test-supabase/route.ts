import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Supabase connection...')

    const supabase = createSupabaseServerClient()

    // Test basic connection by trying to get the current user (should return null if no session)
    const { data: { user }, error } = await supabase.auth.getUser()

    console.log('Supabase connection test result:', {
      hasUser: !!user,
      userId: user?.id,
      error: error ? {
        message: error.message,
        status: error.status,
        name: error.name
      } : null,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })

    return NextResponse.json({
      success: !error,
      hasUser: !!user,
      userId: user?.id,
      error: error ? {
        message: error.message,
        status: error.status,
        name: error.name
      } : null,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Supabase connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
