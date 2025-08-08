import { NextResponse } from 'next/server'
import { authServer } from '@/lib/auth'
import { initializeDefaultWorldClockCities } from '@/lib/services/world-clock-cities'

/**
 * POST /api/world-clock-cities/initialize
 * Initialize default cities for a new user's World Clock
 */
export async function POST() {
  try {
    const user = await authServer.requireAuth()
    const cities = await initializeDefaultWorldClockCities(user.id)
    
    return NextResponse.json({ 
      success: true,
      cities,
      message: 'Default cities initialized for World Clock' 
    })
  } catch (error) {
    console.error('Error initializing default world clock cities:', error)
    
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to initialize default cities' }, 
      { status: 500 }
    )
  }
}