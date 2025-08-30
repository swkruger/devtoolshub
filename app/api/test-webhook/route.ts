import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
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

    console.log('🔍 User profile:', profile)

    // If user has a Stripe customer ID, check their subscription
    if (profile.stripe_customer_id && stripe) {
      try {
        console.log('🔍 Checking subscription for customer:', profile.stripe_customer_id)
        
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: 'active',
          limit: 1
        })

        console.log('🔍 Found subscriptions:', subscriptions.data.length)

        if (subscriptions.data.length > 0) {
          // User has an active subscription, update their plan
          console.log('⬆️ Updating user plan to backer')
          const { error: updateError } = await supabase
            .from('users')
            .update({ plan: 'backer' })
            .eq('id', user.id)

          if (updateError) {
            console.error('❌ Error updating plan:', updateError)
            return NextResponse.json({ error: 'Failed to update plan', details: updateError }, { status: 500 })
          }

          console.log('✅ Successfully updated plan to backer')
          return NextResponse.json({ 
            success: true, 
            message: 'Plan updated to backer',
            subscription: subscriptions.data[0],
            profile: { ...profile, plan: 'backer' }
          })
        } else {
          console.log('⚠️ No active subscription found')
          return NextResponse.json({ 
            success: false, 
            message: 'No active subscription found',
            customerId: profile.stripe_customer_id,
            profile
          })
        }
      } catch (stripeError) {
        console.error('❌ Stripe error:', stripeError)
        return NextResponse.json({ error: 'Stripe error', details: stripeError }, { status: 500 })
      }
    } else {
      console.log('⚠️ No Stripe customer ID found')
      return NextResponse.json({ 
        success: false, 
        message: 'No Stripe customer ID found',
        profile 
      })
    }
  } catch (error) {
    console.error('❌ Error in test webhook:', error)
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 })
  }
}
