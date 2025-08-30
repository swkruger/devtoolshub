import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If user has a Stripe customer ID, check their subscription
    if (profile.stripe_customer_id && stripe) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: 'active',
          limit: 1
        })

        if (subscriptions.data.length > 0) {
          // User has an active subscription, update their plan and ensure customer ID is set
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              plan: 'premium',
              stripe_customer_id: profile.stripe_customer_id || subscriptions.data[0].customer
            })
            .eq('id', user.id)

          if (updateError) {
            return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
          }

          return NextResponse.json({ 
            success: true, 
            message: 'Plan updated to backer',
            subscription: subscriptions.data[0]
          })
        } else {
          return NextResponse.json({ 
            success: false, 
            message: 'No active subscription found',
            customerId: profile.stripe_customer_id
          })
        }
      } catch (stripeError) {
        console.error('Stripe error:', stripeError)
        return NextResponse.json({ error: 'Stripe error' }, { status: 500 })
      }
    } else {
      // Fallback: try to find customer by email if no customer ID is set
      console.log('🔍 No Stripe customer ID found, trying to find customer by email...')
      
      if (stripe && user.email) {
        try {
          const customers = await stripe.customers.list({
            email: user.email,
            limit: 1
          })

          if (customers.data.length > 0) {
            const customer = customers.data[0]
            console.log(`🔍 Found customer by email: ${customer.id}`)
            
            // Check for active subscriptions
            const subscriptions = await stripe.subscriptions.list({
              customer: customer.id,
              status: 'active',
              limit: 1
            })

            if (subscriptions.data.length > 0) {
              // Update user with customer ID and backer plan
              const { error: updateError } = await supabase
                .from('users')
                .update({ 
                  plan: 'backer',
                  stripe_customer_id: customer.id
                })
                .eq('id', user.id)

              if (updateError) {
                return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
              }

              return NextResponse.json({ 
                success: true, 
                message: 'Plan updated to premium (found via email)',
                subscription: subscriptions.data[0],
                customerId: customer.id
              })
            }
          }
        } catch (stripeError) {
          console.error('Stripe error in fallback:', stripeError)
        }
      }

      return NextResponse.json({ 
        success: false, 
        message: 'No Stripe customer ID found and no customer found by email',
        profile 
      })
    }
  } catch (error) {
    console.error('Error fixing subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
