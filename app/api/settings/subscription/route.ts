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
            const fullSubscription = await stripe.subscriptions.retrieve(subscriptions.data[0].id)
            subscription = fullSubscription
          }
        }
      } catch (error) {
        // Continue without subscription data if there's an error
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
          amount_paid: invoice.amount_paid,
          currency: invoice.currency,
          status: invoice.status,
          created: invoice.created,
          invoice_pdf: invoice.invoice_pdf,
          hosted_invoice_url: invoice.hosted_invoice_url,
          description: invoice.description || `Backer Subscription - ${invoice.currency.toUpperCase()} ${(invoice.amount_paid / 100).toFixed(2)}`,
          period_start: invoice.period_start,
          period_end: invoice.period_end
        }))
      } catch (error) {
        // Continue without billing history if there's an error
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

    if (!action) {
      return NextResponse.json({ error: 'Missing action parameter' }, { status: 400 })
    }

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
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

async function createCheckoutSession(user: any, plan: string, supabase: any) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get or create Stripe customer
    let customerId = profile.stripe_customer_id

    if (!customerId) {
      // Create new Stripe customer
      try {
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
      } catch (error) {
        return NextResponse.json({ error: 'Failed to create customer account' }, { status: 500 })
      }
    } else {
      // Verify the customer exists in Stripe
      try {
        const existingCustomer = await stripe.customers.retrieve(customerId)
        if (existingCustomer.deleted) {
          throw new Error('Customer has been deleted')
        }
      } catch (error) {
        // Create a new customer since the existing one is invalid
        try {
          const newCustomer = await stripe.customers.create({
            email: user.email,
            metadata: {
              user_id: user.id,
              replaced_invalid_customer: customerId
            }
          })

          customerId = newCustomer.id

          // Update user profile with new Stripe customer ID
          await supabase
            .from('users')
            .update({ stripe_customer_id: customerId })
            .eq('id', user.id)
        } catch (createError) {
          return NextResponse.json({
            error: 'Customer account error. Please contact support.'
          }, { status: 500 })
        }
      }
    }

    // Validate configuration
    const priceId = SUBSCRIPTION_PLANS.backer.priceId
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!priceId || !appUrl) {
      return NextResponse.json({
        error: 'Configuration error. Please contact support.'
      }, { status: 500 })
    }

    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
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
          plan: 'backer'
        },
        subscription_data: {
          metadata: {
            user_id: user.id,
            plan: 'backer'
          }
        }
      })

      return NextResponse.json({ sessionId: session.id, url: session.url })
    } catch (error) {
      return NextResponse.json({
        error: 'Failed to create checkout session. Please try again or contact support.'
      }, { status: 500 })
    }
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
      return NextResponse.json({
        error: 'No subscription found. Please become a backer first.'
      }, { status: 404 })
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to create billing portal session. Please try again or contact support.'
    }, { status: 500 })
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

    return NextResponse.json({
      message: 'Subscription cancelled successfully. You will remain a backer until the end of your current billing period.',
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
      currentPeriodEnd: (subscription as any).current_period_end
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}
