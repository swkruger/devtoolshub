import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { stripe, SUBSCRIPTION_PLANS } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    // Get user profile to check current plan
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get subscription data from Stripe (if user has a subscription)
    let subscription = null
    let customer = null
    
    if (profile?.stripe_customer_id) {
      try {
        customer = await stripe.customers.retrieve(profile.stripe_customer_id)
        
        if (customer && !customer.deleted) {
          const subscriptions = await stripe.subscriptions.list({
            customer: profile.stripe_customer_id,
            status: 'active',
            expand: ['data.default_payment_method']
          })
          
                    if (subscriptions.data.length > 0) {
            // Get the full subscription object with all fields
            const fullSubscription = await stripe.subscriptions.retrieve(subscriptions.data[0].id)
            subscription = fullSubscription
            
            console.log('📅 API: Full subscription data retrieved:', {
              id: subscription.id,
              current_period_end: subscription.current_period_end,
              cancel_at_period_end: subscription.cancel_at_period_end,
              status: subscription.status,
              type: typeof subscription.current_period_end,
              full_subscription_keys: Object.keys(subscription)
            })
          }
        }
      } catch (error) {
        console.error('Error fetching Stripe data:', error)
      }
    }

    // Get billing history
    let billingHistory: any[] = []
    if (profile?.stripe_customer_id) {
      try {
        const invoices = await stripe.invoices.list({
          customer: profile.stripe_customer_id,
          limit: 10
        })
        
        billingHistory = invoices.data.map(invoice => ({
          id: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: invoice.status,
          created: invoice.created,
          invoice_pdf: invoice.invoice_pdf,
          hosted_invoice_url: invoice.hosted_invoice_url
        }))
      } catch (error) {
        console.error('Error fetching billing history:', error)
      }
    }

    return NextResponse.json({
      currentPlan: profile?.plan || 'free',
      subscription,
      customer,
      billingHistory,
      plans: SUBSCRIPTION_PLANS
    })
  } catch (error) {
    console.error('Subscription GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { action, plan } = body

    switch (action) {
      case 'create_checkout_session':
        return await createCheckoutSession(user, plan, supabase)
      
      case 'create_portal_session':
        return await createPortalSession(user, supabase)
      
      case 'cancel_subscription':
        return await cancelSubscription(user, supabase)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Subscription POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function createCheckoutSession(user: any, plan: string, supabase: any) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get or create Stripe customer
    let customerId = profile.stripe_customer_id
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      })
      
      customerId = customer.id
      
      // Update user profile with Stripe customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: SUBSCRIPTION_PLANS.premium.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
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

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}

async function createPortalSession(user: any, supabase: any) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}

async function cancelSubscription(user: any, supabase: any) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    // Get active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active'
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(subscriptions.data[0].id, {
      cancel_at_period_end: true
    })

    console.log('📅 API: Cancelled subscription data:', {
      id: subscription.id,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      status: subscription.status,
      type: typeof subscription.current_period_end
    })

    // Keep user as premium until the end of the billing period
    // The plan will be updated to 'free' when the subscription actually ends via webhook
    // This ensures premium features remain active until the billing period ends

    return NextResponse.json({ 
      message: 'Subscription cancelled successfully. You will remain premium until the end of your current billing period.',
      subscription,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}
