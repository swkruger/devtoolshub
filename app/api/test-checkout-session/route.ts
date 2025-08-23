import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing checkout session creation...')

    const supabase = createSupabaseServerClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        error: 'Not authenticated',
        timestamp: new Date().toISOString()
      }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({
        error: 'Profile not found',
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    console.log('✅ User and profile loaded:', {
      userId: user.id,
      email: user.email,
      plan: profile.plan,
      stripeCustomerId: profile.stripe_customer_id
    })

    // Test the exact same checkout session creation as the real endpoint
    if (!stripe) {
      return NextResponse.json({
        error: 'Stripe not configured',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    const priceId = SUBSCRIPTION_PLANS.premium.priceId
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    console.log('📋 Checkout parameters:', {
      priceId,
      customerId: profile.stripe_customer_id,
      appUrl,
      mode: 'subscription'
    })

    if (!priceId || priceId === 'undefined') {
      return NextResponse.json({
        error: 'Invalid price ID',
        priceId,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    if (!appUrl) {
      return NextResponse.json({
        error: 'Missing NEXT_PUBLIC_APP_URL',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    try {
      console.log('💳 Creating test checkout session...')

      const session = await stripe.checkout.sessions.create({
        customer: profile.stripe_customer_id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${appUrl}/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/settings?canceled=true`,
        metadata: {
          user_id: user.id,
          plan: 'premium'
        },
        subscription_data: {
          metadata: {
            user_id: user.id,
            plan: 'premium'
          }
        }
      })

      console.log('✅ Test checkout session created successfully')

      return NextResponse.json({
        success: true,
        message: 'Checkout session created successfully',
        session: {
          id: session.id,
          url: session.url,
          customer: session.customer,
          mode: session.mode
        },
        timestamp: new Date().toISOString()
      })

    } catch (stripeError) {
      console.error('❌ Stripe error:', stripeError)

      return NextResponse.json({
        error: 'Stripe checkout session creation failed',
        stripeError: stripeError instanceof Error ? {
          message: stripeError.message,
          type: stripeError.name,
          stack: stripeError.stack
        } : stripeError,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ General error:', error)

    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
