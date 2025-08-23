import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing subscription flow (GET)...')

    const supabase = createSupabaseServerClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json({
        error: 'Not authenticated',
        details: authError.message,
        instruction: 'Please login first and try again',
        timestamp: new Date().toISOString()
      }, { status: 401 })
    }

    if (!user) {
      console.error('❌ No user found')
      return NextResponse.json({
        error: 'No user found',
        instruction: 'Please login first and try again',
        timestamp: new Date().toISOString()
      }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.id)

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('❌ Profile error:', profileError)
      return NextResponse.json({
        error: 'Profile database error',
        details: profileError.message,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    if (!profile) {
      console.error('❌ Profile not found')
      return NextResponse.json({
        error: 'User profile not found in database',
        instruction: 'Please contact support',
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    console.log('✅ User profile:', {
      id: profile.id,
      email: profile.email,
      plan: profile.plan,
      stripe_customer_id: profile.stripe_customer_id
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription flow test completed successfully',
      user: {
        id: user.id,
        email: user.email
      },
      profile: {
        id: profile.id,
        email: profile.email,
        plan: profile.plan,
        stripe_customer_id: profile.stripe_customer_id
      },
      timestamp: new Date().toISOString(),
      instruction: 'Now try the actual subscription endpoint with POST: {"action": "create_checkout_session", "plan": "premium"}'
    })

  } catch (error) {
    console.error('❌ Test error:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing subscription flow...')

    const supabase = createSupabaseServerClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized', details: authError.message }, { status: 401 })
    }

    if (!user) {
      console.error('❌ No user found')
      return NextResponse.json({ error: 'Unauthorized', details: 'No user found' }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.id)

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('❌ Profile error:', profileError)
      return NextResponse.json({ error: 'Profile error', details: profileError.message }, { status: 500 })
    }

    if (!profile) {
      console.error('❌ Profile not found')
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    console.log('✅ User profile:', {
      id: profile.id,
      email: profile.email,
      plan: profile.plan,
      stripe_customer_id: profile.stripe_customer_id
    })

    // Test the request body parsing
    const body = await request.json()
    console.log('📥 Request body:', body)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      profile: {
        id: profile.id,
        email: profile.email,
        plan: profile.plan,
        stripe_customer_id: profile.stripe_customer_id
      },
      request_body: body,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Test error:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
