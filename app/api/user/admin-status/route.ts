import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { authServer } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const user = await authServer.getUser()
    
    if (!user) {
      return NextResponse.json({ isAdmin: false, error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = await authServer.isAdmin(user.id)
    
    console.log('Admin status API - User:', user.id, 'IsAdmin:', isAdmin)
    
    return NextResponse.json({ 
      isAdmin,
      userId: user.id
    })
  } catch (error) {
    console.error('Error in admin status API:', error)
    return NextResponse.json({ isAdmin: false, error: 'Internal server error' }, { status: 500 })
  }
}
