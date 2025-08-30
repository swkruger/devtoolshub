import { NextResponse } from 'next/server'
import { getBackerPriceInDollars } from '@/lib/stripe'

export async function GET() {
  try {
    const price = getBackerPriceInDollars()
    
    return NextResponse.json({ 
      price,
      success: true 
    })
  } catch (error) {
    console.error('Error fetching backer price:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch backer price',
        success: false 
      },
      { status: 500 }
    )
  }
}
