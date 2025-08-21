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

// Helper function to get premium price from environment variable
export const getPremiumPrice = () => {
  // Try both server-side and client-side environment variables
  const envPrice = process.env.STRIPE_PREMIUM_PRICE || process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE
  
  if (envPrice) {
    const price = parseFloat(envPrice)
    if (!isNaN(price) && price > 0) {
      return Math.round(price * 100) // Convert dollars to cents
    }
  }
  // Fallback to default price ($9.99)
  return 999
}

// Helper function to get premium price in dollars
export const getPremiumPriceInDollars = () => {
  return getPremiumPrice() / 100
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Access to all developer tools',
      'Basic tool functionality'
    ],
    limitations: [
      'Limited saved items',
      'No advanced features',
      'No priority support'
    ]
  },
  premium: {
    name: 'Premium',
    price: getPremiumPrice(), // Dynamic price from environment variable
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    features: [
      'Unlimited saved items across all tools',
      'Advanced features and algorithms',
      'Early access to new tools',
      'Advanced analytics and insights',
      'Batch processing capabilities',
      'Export/import functionality'
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
