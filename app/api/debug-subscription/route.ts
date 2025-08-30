import { NextRequest, NextResponse } from 'next/server'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    subscription_plans: {
      backer: {
        name: SUBSCRIPTION_PLANS.backer.name,
        price: SUBSCRIPTION_PLANS.backer.price,
        priceId: SUBSCRIPTION_PLANS.backer.priceId,
        priceIdType: typeof SUBSCRIPTION_PLANS.backer.priceId,
        priceIdLength: SUBSCRIPTION_PLANS.backer.priceId?.length
      }
    },
    environment_variables: {
      STRIPE_BACKER_PRICE_ID: process.env.STRIPE_BACKER_PRICE_ID,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? '***configured***' : 'NOT_SET'
    },
    validation_checks: {
      priceIdExists: !!SUBSCRIPTION_PLANS.backer.priceId,
      priceIdNotUndefined: SUBSCRIPTION_PLANS.backer.priceId !== 'undefined',
      priceIdStartsWithPrice: SUBSCRIPTION_PLANS.backer.priceId?.startsWith('price_'),
      appUrlExists: !!process.env.NEXT_PUBLIC_APP_URL,
      appUrlNotEmpty: process.env.NEXT_PUBLIC_APP_URL !== ''
    }
  }

  return NextResponse.json(debugInfo)
}
