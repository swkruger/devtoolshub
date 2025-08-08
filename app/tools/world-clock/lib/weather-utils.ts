export interface WeatherData {
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  windDirection: number
  pressure: number
  feelsLike: number
  visibility: number
  uvIndex?: number
  icon: string
  sunrise?: string
  sunset?: string
}

export interface WeatherForecast {
  date: string
  high: number
  low: number
  condition: string
  description: string
  icon: string
  humidity: number
  windSpeed: number
}

/**
 * Fetch current weather for a city using OpenWeatherMap API
 */
export async function getCurrentWeather(
  latitude: number,
  longitude: number,
  apiKey: string
): Promise<WeatherData | null> {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
    )

    if (!response.ok) {
      console.error(`Weather API error: ${response.status}`)
      return null
    }

    const data = await response.json()

    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind?.speed * 3.6), // Convert m/s to km/h
      windDirection: data.wind?.deg || 0,
      pressure: data.main.pressure,
      feelsLike: Math.round(data.main.feels_like),
      visibility: Math.round((data.visibility || 10000) / 1000), // Convert to km
      icon: data.weather[0].icon,
      sunrise: data.sys?.sunrise ? new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      sunset: data.sys?.sunset ? new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
    }
  } catch (error) {
    console.error('Error fetching weather data:', error)
    return null
  }
}

/**
 * Fetch 3-day weather forecast for a city
 */
export async function getWeatherForecast(
  latitude: number,
  longitude: number,
  apiKey: string
): Promise<WeatherForecast[]> {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
    )

    if (!response.ok) {
      console.error(`Weather forecast API error: ${response.status}`)
      return []
    }

    const data = await response.json()

    // Group forecasts by date and get daily highs/lows
    const dailyForecasts: { [date: string]: any[] } = {}
    
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0]
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = []
      }
      dailyForecasts[date].push(item)
    })

    // Create 3-day forecast
    return Object.entries(dailyForecasts)
      .slice(0, 3)
      .map(([date, forecasts]) => {
        const temps = forecasts.map(f => f.main.temp)
        const high = Math.round(Math.max(...temps))
        const low = Math.round(Math.min(...temps))
        
        // Use the most common weather condition for the day
        const conditions = forecasts.map(f => f.weather[0].main)
        const mostCommonCondition = conditions.sort((a, b) =>
          conditions.filter(v => v === a).length - conditions.filter(v => v === b).length
        ).pop()
        
        const firstForecast = forecasts[0]
        
        return {
          date,
          high,
          low,
          condition: mostCommonCondition || firstForecast.weather[0].main,
          description: firstForecast.weather[0].description,
          icon: firstForecast.weather[0].icon,
          humidity: Math.round(forecasts.reduce((sum, f) => sum + f.main.humidity, 0) / forecasts.length),
          windSpeed: Math.round(forecasts.reduce((sum, f) => sum + (f.wind?.speed || 0), 0) / forecasts.length * 3.6)
        }
      })
  } catch (error) {
    console.error('Error fetching weather forecast:', error)
    return []
  }
}

/**
 * Get weather icon URL from OpenWeatherMap
 */
export function getWeatherIconUrl(icon: string, size: '2x' | '4x' = '2x'): string {
  return `https://openweathermap.org/img/wn/${icon}@${size}.png`
}

/**
 * Get weather condition emoji based on condition and icon
 */
export function getWeatherEmoji(condition: string, icon: string): string {
  const isNight = icon.includes('n')
  
  switch (condition.toLowerCase()) {
    case 'clear':
      return isNight ? '🌙' : '☀️'
    case 'clouds':
      return isNight ? '☁️' : '⛅'
    case 'rain':
      return '🌧️'
    case 'drizzle':
      return '🌦️'
    case 'thunderstorm':
      return '⛈️'
    case 'snow':
      return '❄️'
    case 'mist':
    case 'fog':
    case 'haze':
      return '🌫️'
    case 'dust':
    case 'sand':
      return '🌪️'
    default:
      return isNight ? '🌙' : '☀️'
  }
}

/**
 * Format temperature with unit
 */
export function formatTemperature(temp: number, unit: 'C' | 'F' = 'C'): string {
  if (unit === 'F') {
    temp = (temp * 9/5) + 32
  }
  return `${Math.round(temp)}°${unit}`
}

/**
 * Get wind direction from degrees
 */
export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}