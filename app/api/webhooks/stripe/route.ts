import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!stripe) {
    console.error('Stripe not configured')
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    console.error('No stripe-signature header found')
    return NextResponse.json({ error: 'No signature header' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    console.log(`✅ Webhook signature verified for event: ${event.type}`)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    console.error('Signature header:', signature)
    console.error('Webhook secret configured:', !!process.env.STRIPE_WEBHOOK_SECRET)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  try {
    console.log(`🔄 Processing webhook event: ${event.type}`)
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object, supabase)
        break
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, supabase)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabase)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabase)
        break
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object, supabase)
        break
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object, supabase)
        break
      
      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: any, supabase: any) {
  console.log(`💳 Processing checkout session completed for customer: ${session.customer}`)
  
  const { user_id, plan } = session.metadata || {}

  if (plan === 'backer' && user_id) {
    console.log(`⬆️ Upgrading user ${user_id} to backer plan`)
    
    // Update both plan and customer ID in one operation
    const { error } = await supabase
      .from('users')
      .update({ 
        plan: 'backer',
        stripe_customer_id: session.customer 
      })
      .eq('id', user_id)
    
    if (error) {
      console.error('❌ Error updating user plan and customer ID:', error)
    } else {
      console.log(`✅ Successfully upgraded user ${user_id} to backer and updated customer ID`)
    }
  } else {
    console.log(`⚠️ No user_id or plan in metadata:`, { user_id, plan })
    
    // Fallback: try to find user by customer ID if metadata is missing
    if (session.customer) {
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', session.customer)

      if (!userError && users && users.length > 0) {
        const user = users[0]
        console.log(`🔄 Fallback: Upgrading user ${user.id} to backer via customer ID`)
        const { error: updateError } = await supabase
          .from('users')
          .update({ plan: 'backer' })
          .eq('id', user.id)
        
        if (updateError) {
          console.error('❌ Error in fallback update:', updateError)
        } else {
          console.log(`✅ Successfully upgraded user ${user.id} to backer via fallback`)
        }
      }
    }
  }
}

async function handleSubscriptionCreated(subscription: any, supabase: any) {
  const customerId = subscription.customer as string
  console.log(`📅 Processing subscription created for customer: ${customerId}`)
  
  // Find user by Stripe customer ID
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)

  if (userError) {
    console.error('❌ Error finding user by customer ID:', userError)
    return
  }

  if (users && users.length > 0) {
    const user = users[0]
    console.log(`⬆️ Upgrading user ${user.id} to backer plan`)
    const { error } = await supabase
      .from('users')
      .update({ plan: 'backer' })
      .eq('id', user.id)
    
    if (error) {
      console.error('❌ Error updating user plan:', error)
    } else {
      console.log(`✅ Successfully upgraded user ${user.id} to backer`)
    }
  } else {
    console.log(`⚠️ No user found for customer ID: ${customerId}`)
    
    // Additional logging to help debug
    console.log(`🔍 Checking if customer ID exists in any user record...`)
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, stripe_customer_id')
      .not('stripe_customer_id', 'is', null)
    
    if (!allUsersError && allUsers) {
      console.log(`📊 Found ${allUsers.length} users with stripe_customer_id:`, allUsers.map((u: any) => ({ id: u.id, customer_id: u.stripe_customer_id })))
    }
  }
}

async function handleSubscriptionUpdated(subscription: any, supabase: any) {
  const customerId = subscription.customer as string
  const status = subscription.status
  const cancelAtPeriodEnd = subscription.cancel_at_period_end
  console.log(`📅 Processing subscription updated for customer: ${customerId}, status: ${status}, cancel_at_period_end: ${cancelAtPeriodEnd}`)

  // Find user by Stripe customer ID
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)

  if (userError) {
    console.error('❌ Error finding user by customer ID:', userError)
    return
  }

  if (users && users.length > 0) {
    const user = users[0]
    if (status === 'active') {
      // If subscription is active, keep user as backer (even if cancelled at period end)
      console.log(`✅ Keeping user ${user.id} as backer (subscription active)`)
      const { error } = await supabase
        .from('users')
        .update({ plan: 'backer' })
        .eq('id', user.id)
      
      if (error) {
        console.error('❌ Error updating user plan:', error)
      } else {
        console.log(`✅ Successfully kept user ${user.id} as backer`)
      }
    } else if (status === 'canceled' || status === 'unpaid' || status === 'past_due') {
      // Only downgrade to free when subscription is actually cancelled/ended
      console.log(`⬇️ Downgrading user ${user.id} to free plan (subscription ended)`)
      const { error } = await supabase
        .from('users')
        .update({ plan: 'free' })
        .eq('id', user.id)
      
      if (error) {
        console.error('❌ Error updating user plan:', error)
      } else {
        console.log(`✅ Successfully downgraded user ${user.id} to free`)
      }
    }
  } else {
    console.log(`⚠️ No user found for customer ID: ${customerId}`)
  }
}

async function handleSubscriptionDeleted(subscription: any, supabase: any) {
  const customerId = subscription.customer as string
  console.log(`📅 Processing subscription deleted for customer: ${customerId}`)
  
  // Find user by Stripe customer ID
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)

  if (userError) {
    console.error('❌ Error finding user by customer ID:', userError)
    return
  }

  if (users && users.length > 0) {
    const user = users[0]
    console.log(`⬇️ Downgrading user ${user.id} to free plan`)
    const { error } = await supabase
      .from('users')
      .update({ plan: 'free' })
      .eq('id', user.id)
    
    if (error) {
      console.error('❌ Error updating user plan:', error)
    } else {
      console.log(`✅ Successfully downgraded user ${user.id} to free`)
    }
  } else {
    console.log(`⚠️ No user found for customer ID: ${customerId}`)
  }
}

async function handleInvoicePaymentSucceeded(invoice: any, supabase: any) {
  const customerId = invoice.customer as string
  console.log(`💰 Processing invoice payment succeeded for customer: ${customerId}`)
  
  // Find user by Stripe customer ID
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)

  if (userError) {
    console.error('❌ Error finding user by customer ID:', userError)
    return
  }

  if (users && users.length > 0) {
    const user = users[0]
    console.log(`⬆️ Upgrading user ${user.id} to backer plan`)
    const { error } = await supabase
      .from('users')
      .update({ plan: 'backer' })
      .eq('id', user.id)
    
    if (error) {
      console.error('❌ Error updating user plan:', error)
    } else {
      console.log(`✅ Successfully upgraded user ${user.id} to backer`)
    }
  } else {
    console.log(`⚠️ No user found for customer ID: ${customerId}`)
  }
}

async function handleInvoicePaymentFailed(invoice: any, supabase: any) {
  const customerId = invoice.customer as string
  console.log(`❌ Processing invoice payment failed for customer: ${customerId}`)
  
  // Find user by Stripe customer ID
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)

  if (userError) {
    console.error('❌ Error finding user by customer ID:', userError)
    return
  }

  if (users && users.length > 0) {
    const user = users[0]
    // You might want to implement retry logic or downgrade to free plan
    // For now, we'll keep the current plan and let Stripe handle retries
    console.log(`⚠️ Payment failed for user ${user.id}`)
  } else {
    console.log(`⚠️ No user found for customer ID: ${customerId}`)
  }
}
