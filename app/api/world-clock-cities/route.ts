import { NextRequest, NextResponse } from 'next/server'
import { authServer } from '@/lib/auth'
import { 
  getUserWorldClockCities, 
  addUserWorldClockCity, 
  clearUserWorldClockCities,
  initializeDefaultWorldClockCities
} from '@/lib/services/world-clock-cities'
import { City } from '@/app/tools/world-clock/lib/cities-data'

/**
 * GET /api/world-clock-cities
 * Get all cities for the authenticated user's World Clock
 */
export async function GET() {
  try {
    const user = await authServer.getUserProfile()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const cities = await getUserWorldClockCities(user.id)
    return NextResponse.json({ cities })
  } catch (error) {
    console.error('Error fetching world clock cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' }, 
      { status: 500 }
    )
  }
}

/**
 * POST /api/world-clock-cities
 * Add a city to the authenticated user's World Clock
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
    
    // Validate required fields
    const { city } = body as { city: City }
    if (!city || !city.id || !city.name || !city.timezone) {
      return NextResponse.json(
        { error: 'Invalid city data provided' },
        { status: 400 }
      )
    }
    
    const result = await addUserWorldClockCity(user.id, city)
    
    return NextResponse.json({ 
      success: true, 
      city: result,
      message: 'City added to World Clock successfully' 
    })
  } catch (error) {
    console.error('Error adding world clock city:', error)
    

    
    if (error instanceof Error && error.message.includes('already added')) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to add city to World Clock' }, 
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/world-clock-cities
 * Clear all cities from the authenticated user's World Clock
 */
export async function DELETE() {
  try {
    const user = await authServer.getUserProfile()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    await clearUserWorldClockCities(user.id)
    
    return NextResponse.json({ 
      success: true,
      message: 'All cities cleared from World Clock' 
    })
  } catch (error) {
    console.error('Error clearing world clock cities:', error)
    

    
    return NextResponse.json(
      { error: 'Failed to clear cities from World Clock' }, 
      { status: 500 }
    )
  }
}