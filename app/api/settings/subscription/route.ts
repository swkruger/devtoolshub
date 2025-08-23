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
          amount_paid: invoice.amount_paid,
          currency: invoice.currency,
          status: invoice.status,
          created: invoice.created,
          invoice_pdf: invoice.invoice_pdf,
          hosted_invoice_url: invoice.hosted_invoice_url,
          description: invoice.description || `Premium Subscription - ${invoice.currency.toUpperCase()} ${(invoice.amount_paid / 100).toFixed(2)}`,
          period_start: invoice.period_start,
          period_end: invoice.period_end
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
    console.log('🔄 Subscription POST request started')

    // Environment variable validation
    const requiredEnvVars = [
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'STRIPE_PREMIUM_PRICE_ID',
      'NEXT_PUBLIC_APP_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
    if (missingEnvVars.length > 0) {
      console.error('❌ Missing environment variables:', missingEnvVars)
      return NextResponse.json({
        error: `Missing required environment variables: ${missingEnvVars.join(', ')}`
      }, { status: 500 })
    }

    // Additional validation for price ID format
    const priceId = process.env.STRIPE_PREMIUM_PRICE_ID
    if (!priceId || priceId.startsWith('price_') === false) {
      console.error('❌ Invalid STRIPE_PREMIUM_PRICE_ID format:', priceId)
      return NextResponse.json({
        error: 'Invalid price ID configuration. Please contact support.'
      }, { status: 500 })
    }

    console.log('✅ Environment variables validated')

    const supabase = createSupabaseServerClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('❌ Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user) {
      console.error('❌ No user found in auth session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.id)

    // Check if Stripe is configured
    if (!stripe) {
      console.error('❌ Stripe not configured - STRIPE_SECRET_KEY missing or invalid')
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    console.log('✅ Stripe configured successfully')

    const body = await request.json()
    const { action, plan } = body

    console.log('📥 Received request body:', { action, plan })

    if (!action) {
      console.error('❌ Missing action in request body')
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
    console.error('❌ Subscription POST error:', error)

    // Provide detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }

    // Return appropriate error message based on error type
    let errorMessage = 'Internal server error'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('STRIPE')) {
        errorMessage = 'Stripe configuration error'
      } else if (error.message.includes('auth')) {
        errorMessage = 'Authentication error'
        statusCode = 401
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error - please try again'
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

async function createCheckoutSession(user: any, plan: string, supabase: any) {
  try {
    console.log('🛒 Creating checkout session for user:', user.id, 'plan:', plan)
    console.log('📋 User object:', { id: user.id, email: user.email })

    // Check if Stripe is configured
    if (!stripe) {
      console.error('❌ Stripe not configured in createCheckoutSession')
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    // Get user profile
    console.log('🔍 Fetching user profile from database...')
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('❌ Database error fetching user profile:', profileError)
      return NextResponse.json({ error: 'Database error fetching user profile' }, { status: 500 })
    }

    if (!profile) {
      console.error('❌ User profile not found in database')
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    console.log('✅ User profile found:', { id: profile.id, email: profile.email, plan: profile.plan, stripe_customer_id: profile.stripe_customer_id })

    // Get or create Stripe customer
    let customerId = profile.stripe_customer_id

    if (!customerId) {
      console.log('👤 No existing customer ID, creating new Stripe customer for user:', user.id)
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            user_id: user.id
          }
        })

        customerId = customer.id
        console.log('✅ Created Stripe customer:', customerId)

        // Update user profile with Stripe customer ID
        console.log('📝 Updating user profile with customer ID')
        const { error: updateError } = await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id)

        if (updateError) {
          console.error('❌ Error updating user with customer ID:', updateError)
          // Continue anyway - we can still create the checkout session
        } else {
          console.log('✅ User profile updated with customer ID')
        }
      } catch (error) {
        console.error('❌ Error creating Stripe customer:', error)
        return NextResponse.json({ error: 'Failed to create customer account' }, { status: 500 })
      }
    } else {
      console.log('👤 Verifying existing Stripe customer:', customerId)

      // Verify the customer exists in Stripe
      try {
        const existingCustomer = await stripe.customers.retrieve(customerId)
        if (existingCustomer.deleted) {
          throw new Error('Customer has been deleted')
        }
        console.log('✅ Existing Stripe customer verified:', customerId)
      } catch (error) {
        console.error('❌ Existing customer verification failed:', error)
        console.log('🔄 Creating new customer to replace invalid one...')

        try {
          // Create a new customer since the existing one is invalid
          const newCustomer = await stripe.customers.create({
            email: user.email,
            metadata: {
              user_id: user.id,
              replaced_invalid_customer: customerId
            }
          })

          customerId = newCustomer.id
          console.log('✅ Created replacement Stripe customer:', customerId)

          // Update user profile with new Stripe customer ID
          const { error: updateError } = await supabase
            .from('users')
            .update({ stripe_customer_id: customerId })
            .eq('id', user.id)

          if (updateError) {
            console.error('❌ Error updating user with new customer ID:', updateError)
          } else {
            console.log('✅ User profile updated with new customer ID')
          }
        } catch (createError) {
          console.error('❌ Error creating replacement customer:', createError)
          return NextResponse.json({
            error: 'Customer account error. Please contact support.',
            details: 'Unable to create or verify customer account'
          }, { status: 500 })
        }
      }
    }

    // Validate price ID before creating checkout session
    const priceId = SUBSCRIPTION_PLANS.premium.priceId
    console.log('💳 Creating Stripe checkout session')
    console.log('Price ID:', priceId)
    console.log('Customer ID:', customerId)
    console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL)

    if (!priceId || priceId === 'undefined') {
      console.error('❌ Invalid or missing price ID:', priceId)
      console.error('STRIPE_PREMIUM_PRICE_ID env var:', process.env.STRIPE_PREMIUM_PRICE_ID)
      return NextResponse.json({
        error: 'Invalid price configuration. Please contact support.'
      }, { status: 500 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!appUrl) {
      console.error('❌ Missing NEXT_PUBLIC_APP_URL environment variable')
      return NextResponse.json({
        error: 'Application configuration error. Please contact support.'
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
          plan: 'premium'
        },
        subscription_data: {
          metadata: {
            user_id: user.id,
            plan: 'premium'
          }
        }
      })

      console.log('✅ Checkout session created successfully:', session.id)
      return NextResponse.json({ sessionId: session.id, url: session.url })
    } catch (error) {
      console.error('❌ Error creating checkout session:', error)

      // Provide specific error messages based on Stripe error types
      if (error instanceof Error) {
        if (error.message.includes('price')) {
          return NextResponse.json({
            error: 'Invalid price configuration. Please contact support.'
          }, { status: 500 })
        } else if (error.message.includes('customer')) {
          return NextResponse.json({
            error: 'Invalid customer configuration. Please try refreshing the page.'
          }, { status: 500 })
        } else if (error.message.includes('API key')) {
          return NextResponse.json({
            error: 'Stripe API configuration error. Please contact support.'
          }, { status: 500 })
        }
      }

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
      console.error('Stripe not configured - missing STRIPE_SECRET_KEY')
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
    }

    if (!profile) {
      console.error('User profile not found for user:', user.id)
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    if (!profile.stripe_customer_id) {
      console.error('No stripe_customer_id found for user:', user.id)
      return NextResponse.json({ 
        error: 'No subscription found. Please upgrade to premium first.' 
      }, { status: 404 })
    }

    console.log('Creating portal session for customer:', profile.stripe_customer_id)

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    })

    console.log('Portal session created successfully:', session.id)
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('customer')) {
        return NextResponse.json({ 
          error: 'Customer not found in Stripe. Please contact support.' 
        }, { status: 404 })
      }
      if (error.message.includes('billing_portal')) {
        return NextResponse.json({ 
          error: 'Billing portal not configured. Please contact support.' 
        }, { status: 500 })
      }
    }
    
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

    // Keep user as premium until the end of the billing period
    // The plan will be updated to 'free' when the subscription actually ends via webhook
    // This ensures premium features remain active until the billing period ends

    return NextResponse.json({ 
      message: 'Subscription cancelled successfully. You will remain premium until the end of your current billing period.',
      subscription: subscription,
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
      currentPeriodEnd: (subscription as any).current_period_end
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}
