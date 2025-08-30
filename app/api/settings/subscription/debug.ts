// Debug script to test Stripe integration
// Run this in production to identify the exact error

export async function debugStripeIntegration() {
  console.log('🔍 Starting Stripe Integration Debug')
  console.log('=====================================')

  // Check environment variables
  console.log('📋 Environment Variables:')
  console.log('STRIPE_SECRET_KEY:', !!process.env.STRIPE_SECRET_KEY)
  console.log('STRIPE_WEBHOOK_SECRET:', !!process.env.STRIPE_WEBHOOK_SECRET)
  console.log('STRIPE_BACKER_PRICE_ID:', !!process.env.STRIPE_BACKER_PRICE_ID)
  console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

  // Test Stripe initialization
  console.log('\n💳 Testing Stripe Initialization:')
  try {
    const { stripe } = await import('@/lib/stripe')
    console.log('Stripe initialized:', !!stripe)
    if (!stripe) {
      console.error('❌ Stripe failed to initialize - STRIPE_SECRET_KEY missing or invalid')
    }
  } catch (error) {
    console.error('❌ Stripe initialization error:', error)
  }

  // Test Supabase connection
  console.log('\n🗄️ Testing Supabase Connection:')
  try {
    const { createSupabaseServerClient } = await import('@/lib/supabase-server')
    const supabase = createSupabaseServerClient()
    console.log('Supabase client created:', !!supabase)

    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.log('Auth error (expected in test):', authError.message)
    } else {
      console.log('Auth successful for user:', user?.id)
    }
  } catch (error) {
    console.error('❌ Supabase connection error:', error)
  }

  console.log('\n✅ Debug complete')
}
