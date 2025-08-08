import { NextRequest, NextResponse } from 'next/server'
import { authServer } from '@/lib/auth'
import { reorderUserWorldClockCities } from '@/lib/services/world-clock-cities'

/**
 * POST /api/world-clock-cities/reorder
 * Reorder cities in the authenticated user's World Clock
 */
export async function POST(request: NextRequest) {
  try {
    const user = await authServer.getUserProfile()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Validate reorder data
    const { cityOrders } = body as { 
      cityOrders: { city_id: string; display_order: number }[] 
    }
    
    if (!Array.isArray(cityOrders)) {
      return NextResponse.json(
        { error: 'Invalid city orders data provided' },
        { status: 400 }
      )
    }
    
    // Validate each city order entry
    for (const order of cityOrders) {
      if (!order.city_id || typeof order.display_order !== 'number') {
        return NextResponse.json(
          { error: 'Invalid city order entry: missing city_id or display_order' },
          { status: 400 }
        )
      }
    }
    
    await reorderUserWorldClockCities(user.id, cityOrders)
    
    return NextResponse.json({ 
      success: true,
      message: 'Cities reordered successfully' 
    })
  } catch (error) {
    console.error('Error reordering world clock cities:', error)
    
    return NextResponse.json(
      { error: 'Failed to reorder cities' }, 
      { status: 500 }
    )
  }
}