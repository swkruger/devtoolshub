import { NextResponse } from 'next/server'

export async function GET() {
  const envPrice = process.env.STRIPE_PREMIUM_PRICE
  let price = 9.99 // Default fallback
  
  if (envPrice) {
    const parsedPrice = parseFloat(envPrice)
    if (!isNaN(parsedPrice) && parsedPrice > 0) {
      price = parsedPrice
    }
  }
  
  return NextResponse.json({ price })
}
