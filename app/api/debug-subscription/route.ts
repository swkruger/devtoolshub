import { NextRequest, NextResponse } from 'next/server'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    subscription_plans: {
      premium: {
        name: SUBSCRIPTION_PLANS.premium.name,
        price: SUBSCRIPTION_PLANS.premium.price,
        priceId: SUBSCRIPTION_PLANS.premium.priceId,
        priceIdType: typeof SUBSCRIPTION_PLANS.premium.priceId,
        priceIdLength: SUBSCRIPTION_PLANS.premium.priceId?.length
      }
    },
    environment_variables: {
      STRIPE_PREMIUM_PRICE_ID: process.env.STRIPE_PREMIUM_PRICE_ID,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? '***configured***' : 'NOT_SET'
    },
    validation_checks: {
      priceIdExists: !!SUBSCRIPTION_PLANS.premium.priceId,
      priceIdNotUndefined: SUBSCRIPTION_PLANS.premium.priceId !== 'undefined',
      priceIdStartsWithPrice: SUBSCRIPTION_PLANS.premium.priceId?.startsWith('price_'),
      appUrlExists: !!process.env.NEXT_PUBLIC_APP_URL,
      appUrlNotEmpty: process.env.NEXT_PUBLIC_APP_URL !== ''
    }
  }

  return NextResponse.json(debugInfo)
}
