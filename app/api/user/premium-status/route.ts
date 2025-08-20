import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { authServer } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const user = await authServer.getUser()
    
    if (!user) {
      return NextResponse.json({ isPremium: false, error: 'Not authenticated' }, { status: 401 })
    }

    // Get user profile to check premium status
    const supabase = createSupabaseServerClient()
    const { data: profile, error } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return NextResponse.json({ isPremium: false, error: 'Failed to fetch profile' }, { status: 500 })
    }

    const isPremium = profile?.plan === 'premium'
    
    console.log('Premium status API - User:', user.id, 'Plan:', profile?.plan, 'IsPremium:', isPremium)
    
    return NextResponse.json({ 
      isPremium,
      plan: profile?.plan || 'free'
    })
  } catch (error) {
    console.error('Error in premium status API:', error)
    return NextResponse.json({ isPremium: false, error: 'Internal server error' }, { status: 500 })
  }
}
