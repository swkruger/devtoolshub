import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    console.log('Sign out API - Starting sign out process...')
    
    // Try to get the user and sign them out server-side
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (user && !userError) {
      console.log('Sign out API - Signing out user:', user.id)
      try {
        // Try to sign out the user server-side
        const { error } = await supabase.auth.admin.signOut(user.id)
        if (error) {
          console.log('Sign out API - Server-side sign out failed:', error.message)
        } else {
          console.log('Sign out API - Server-side sign out successful')
        }
      } catch (error) {
        console.log('Sign out API - Server-side sign out error:', error)
      }
    }
    
    // Create response with comprehensive cookie clearing
    const response = NextResponse.json({ 
      success: true, 
      message: 'Signed out successfully'
    })
    
    // Clear all possible Supabase auth cookies
    const cookieNames = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token',
      'supabase.auth.token',
      'auth-token',
      'session',
    ]
    
    cookieNames.forEach(cookieName => {
      response.cookies.set(cookieName, '', { 
        maxAge: 0, 
        path: '/', 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const
      })
      response.cookies.set(cookieName, '', { 
        maxAge: 0, 
        path: '/', 
        httpOnly: false, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const
      })
    })
    
    console.log('Sign out API - Sign out completed successfully')
    
    return response
  } catch (error) {
    console.error('Sign out API - Unexpected error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
