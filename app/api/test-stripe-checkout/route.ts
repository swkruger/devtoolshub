import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    subscription_plans: SUBSCRIPTION_PLANS,
    environment_variables: {
      STRIPE_PREMIUM_PRICE_ID: process.env.STRIPE_PREMIUM_PRICE_ID,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
    },
    stripe_tests: {
      price_retrieval: null,
      customer_creation: null,
      checkout_session_creation: null
    },
    errors: [] as string[]
  }

  try {
    // Test 1: Check if price exists
    console.log('Testing price retrieval...')
    const priceId = SUBSCRIPTION_PLANS.premium.priceId
    console.log('Price ID:', priceId)

    if (!stripe) {
      console.error('❌ Stripe not initialized')
      results.errors.push('Stripe not initialized - STRIPE_SECRET_KEY missing')
      results.stripe_tests.price_retrieval = 'failed'
    } else {
      try {
        const price = await stripe.prices.retrieve(priceId)
        results.stripe_tests.price_retrieval = {
          id: price.id,
          active: price.active,
          currency: price.currency,
          unit_amount: price.unit_amount
        }
        console.log('✅ Price retrieved successfully')
      } catch (error) {
        console.error('❌ Error retrieving price:', error)
        results.errors.push(`Price retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        results.stripe_tests.price_retrieval = 'failed'
      }
    }

    // Test 2: Try creating a test customer
    console.log('Testing customer creation...')
    if (!stripe) {
      console.error('❌ Stripe not initialized for customer creation')
      results.errors.push('Stripe not initialized for customer creation')
      results.stripe_tests.customer_creation = 'failed'
    } else {
      try {
        const testCustomer = await stripe.customers.create({
          email: 'test@example.com',
          metadata: {
            test_user: true
          }
        })
        results.stripe_tests.customer_creation = {
          id: testCustomer.id,
          email: testCustomer.email
        }
        console.log('✅ Test customer created successfully')

        // Clean up test customer
        await stripe.customers.del(testCustomer.id)
      } catch (error) {
        console.error('❌ Error creating test customer:', error)
        results.errors.push(`Customer creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        results.stripe_tests.customer_creation = 'failed'
      }
    }

    // Test 3: Try creating a minimal checkout session
    if (results.stripe_tests.price_retrieval !== 'failed') {
      console.log('Testing checkout session creation...')
      if (!stripe) {
        console.error('❌ Stripe not initialized for checkout session creation')
        results.errors.push('Stripe not initialized for checkout session creation')
        results.stripe_tests.checkout_session_creation = 'failed'
      } else {
        try {
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
              {
                price: priceId,
                quantity: 1,
              },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
          })
          results.stripe_tests.checkout_session_creation = {
            id: session.id,
            url: session.url
          }
          console.log('✅ Test checkout session created successfully')
        } catch (error) {
          console.error('❌ Error creating test checkout session:', error)
          results.errors.push(`Checkout session creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
          results.stripe_tests.checkout_session_creation = 'failed'
        }
      }
    }

  } catch (error) {
    console.error('❌ General error in test:', error)
    results.errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return NextResponse.json(results)
}
