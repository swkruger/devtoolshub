import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    environment_variables: {
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      STRIPE_PREMIUM_PRICE_ID: !!process.env.STRIPE_PREMIUM_PRICE_ID,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    },
    stripe_initialized: !!stripe,
    supabase_test: false,
    errors: [] as string[]
  }

  // Test Supabase connection
  try {
    const supabase = createSupabaseServerClient()
    // Try to get the current user (will fail if no auth, but tests connection)
    const { error } = await supabase.auth.getUser()
    results.supabase_test = true // If we get here, connection works
    if (!error) {
      results.supabase_test = true
    }
  } catch (error) {
    results.errors.push(`Supabase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Test Stripe basic functionality
  if (stripe) {
    try {
      // Try to list customers (should fail due to permissions but test API key)
      await stripe.customers.list({ limit: 1 })
    } catch (error) {
      if (error instanceof Error && error.message.includes('API key')) {
        results.errors.push('Invalid Stripe API key')
      }
      // Other errors are expected (permission errors)
    }
  } else {
    results.errors.push('Stripe not initialized - missing STRIPE_SECRET_KEY')
  }

  return NextResponse.json(results)
}
