import { NextRequest, NextResponse } from 'next/server'
import { authServer } from '@/lib/auth'
import { getCurrentWeather, getWeatherForecast } from '@/app/tools/world-clock/lib/weather-utils'

/**
 * GET /api/weather?lat=40.7128&lng=-74.0060&forecast=true
 * Fetch current weather and optionally forecast for coordinates
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and has premium access
    const user = await authServer.getUserProfile()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const isPremiumUser = user.plan === 'premium'
    if (!isPremiumUser) {
      return NextResponse.json(
        { error: 'Weather data is a premium feature' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const includeForecast = searchParams.get('forecast') === 'true'

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude' },
        { status: 400 }
      )
    }

    // Get OpenWeatherMap API key from environment
    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      console.error('OpenWeatherMap API key not configured')
      return NextResponse.json(
        { error: 'Weather service not available' },
        { status: 503 }
      )
    }

    // Fetch current weather
    const currentWeather = await getCurrentWeather(latitude, longitude, apiKey)
    if (!currentWeather) {
      return NextResponse.json(
        { error: 'Failed to fetch weather data' },
        { status: 502 }
      )
    }

    const response: any = {
      current: currentWeather
    }

    // Fetch forecast if requested
    if (includeForecast) {
      const forecast = await getWeatherForecast(latitude, longitude, apiKey)
      response.forecast = forecast
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Weather API error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}