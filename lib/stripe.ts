import Stripe from 'stripe'

// Server-side Stripe instance
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
      typescript: true,
    })
  : null

// Client-side Stripe instance
export const getStripe = () => {
  if (typeof window !== 'undefined') {
    return require('@stripe/stripe-js').loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return null
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Access to all basic tools',
      '5 saved items per tool',
      'Basic support',
      'Community access'
    ],
    limitations: [
      'No premium features',
      'No priority support',
      'No advanced analytics'
    ]
  },
  premium: {
    name: 'Premium',
    price: 999, // $9.99 in cents
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    features: [
      'Everything in Free',
      'Unlimited saved items',
      'Advanced features',
      'Priority support',
      'Early access to new tools',
      'Advanced analytics',
      'Custom themes',
      'API access'
    ],
    limitations: []
  }
} as const

export type PlanType = keyof typeof SUBSCRIPTION_PLANS

// Helper functions
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price / 100)
}

export const getPlanFeatures = (plan: PlanType) => {
  return SUBSCRIPTION_PLANS[plan]
}
