import { createSupabaseServerClient } from "@/lib/supabase-server"
import { City } from "@/app/tools/world-clock/lib/cities-data"

export interface UserWorldClockCity {
  id: string
  user_id: string
  city_id: string
  city_name: string
  custom_label?: string
  country: string
  country_code: string
  timezone: string
  latitude: number
  longitude: number
  region?: string
  population?: number
  is_popular: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface CreateWorldClockCityData {
  city_id: string
  city_name: string
  custom_label?: string
  country: string
  country_code: string
  timezone: string
  latitude: number
  longitude: number
  region?: string
  population?: number
  is_popular?: boolean
  display_order?: number
}

export interface UpdateWorldClockCityData {
  custom_label?: string
  display_order?: number
}

/**
 * Get all cities for a user's World Clock, ordered by display_order
 */
export async function getUserWorldClockCities(userId: string): Promise<City[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('user_world_clock_cities')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching user world clock cities:', error)
    throw new Error(`Failed to fetch world clock cities: ${error.message}`)
  }

  // Convert database records to City interface with custom labels
  return (data || []).map(dbCity => ({
    id: dbCity.city_id,
    name: dbCity.custom_label || dbCity.city_name,
    originalName: dbCity.city_name,
    customLabel: dbCity.custom_label,
    country: dbCity.country,
    countryCode: dbCity.country_code,
    timezone: dbCity.timezone,
    coordinates: { lat: dbCity.latitude, lng: dbCity.longitude },
    region: dbCity.region,
    population: dbCity.population,
    isPopular: dbCity.is_popular,
    displayOrder: dbCity.display_order
  }))
}

/**
 * Add a new city to user's World Clock
 */
export async function addUserWorldClockCity(
  userId: string,
  city: City
): Promise<UserWorldClockCity> {
  const supabase = await createSupabaseServerClient()

  // Get the next display order
  const { count } = await supabase
    .from('user_world_clock_cities')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  const displayOrder = count || 0

  const { data, error } = await supabase
    .from('user_world_clock_cities')
    .insert({
      user_id: userId,
      city_id: city.id,
      city_name: city.originalName || city.name,
      custom_label: city.customLabel,
      country: city.country,
      country_code: city.countryCode,
      timezone: city.timezone,
      latitude: city.coordinates.lat,
      longitude: city.coordinates.lng,
      region: city.region,
      population: city.population,
      is_popular: city.isPopular || false,
      display_order: displayOrder
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('This city is already added to your World Clock')
    }
    console.error('Error adding world clock city:', error)
    throw new Error(`Failed to add city to World Clock: ${error.message}`)
  }

  return data
}

/**
 * Remove a city from user's World Clock
 */
export async function removeUserWorldClockCity(
  userId: string,
  cityId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('user_world_clock_cities')
    .delete()
    .eq('user_id', userId)
    .eq('city_id', cityId)

  if (error) {
    console.error('Error removing world clock city:', error)
    throw new Error(`Failed to remove city from World Clock: ${error.message}`)
  }
}

/**
 * Remove all cities from user's World Clock
 */
export async function clearUserWorldClockCities(userId: string): Promise<void> {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('user_world_clock_cities')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Error clearing world clock cities:', error)
    throw new Error(`Failed to clear World Clock cities: ${error.message}`)
  }
}

/**
 * Update a user's World Clock city (custom label or display order)
 */
export async function updateUserWorldClockCity(
  userId: string,
  cityId: string,
  updateData: UpdateWorldClockCityData
): Promise<UserWorldClockCity> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('user_world_clock_cities')
    .update(updateData)
    .eq('user_id', userId)
    .eq('city_id', cityId)
    .select()
    .single()

  if (error) {
    console.error('Error updating world clock city:', error)
    throw new Error(`Failed to update city: ${error.message}`)
  }

  return data
}

/**
 * Reorder user's World Clock cities
 */
export async function reorderUserWorldClockCities(
  userId: string,
  cityOrders: { city_id: string; display_order: number }[]
): Promise<void> {
  const supabase = await createSupabaseServerClient()

  // Update each city's display order
  const promises = cityOrders.map(({ city_id, display_order }) =>
    supabase
      .from('user_world_clock_cities')
      .update({ display_order })
      .eq('user_id', userId)
      .eq('city_id', city_id)
  )

  const results = await Promise.all(promises)
  
  for (const result of results) {
    if (result.error) {
      console.error('Error reordering world clock cities:', result.error)
      throw new Error('Failed to reorder cities')
    }
  }
}

/**
 * Initialize default cities for a new user (popular cities)
 */
export async function initializeDefaultWorldClockCities(userId: string): Promise<City[]> {
  const supabase = await createSupabaseServerClient()

  const defaultCities = [
    {
      city_id: 'new-york',
      city_name: 'New York',
      country: 'United States',
      country_code: 'US',
      timezone: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.0060,
      is_popular: true,
      display_order: 0
    },
    {
      city_id: 'london',
      city_name: 'London',
      country: 'United Kingdom',
      country_code: 'GB',
      timezone: 'Europe/London',
      latitude: 51.5074,
      longitude: -0.1278,
      is_popular: true,
      display_order: 1
    },
    {
      city_id: 'tokyo',
      city_name: 'Tokyo',
      country: 'Japan',
      country_code: 'JP',
      timezone: 'Asia/Tokyo',
      latitude: 35.6762,
      longitude: 139.6503,
      is_popular: true,
      display_order: 2
    }
  ]

  const { data, error } = await supabase
    .from('user_world_clock_cities')
    .upsert(
      defaultCities.map(city => ({
        user_id: userId,
        ...city
      })),
      { 
        onConflict: 'user_id,city_id',
        ignoreDuplicates: true 
      }
    )
    .select()

  if (error) {
    console.error('Error initializing default world clock cities:', error)
    throw new Error(`Failed to initialize default cities: ${error.message}`)
  }

  // Convert database records to City interface with custom labels
  return (data || []).map(dbCity => ({
    id: dbCity.city_id,
    name: dbCity.custom_label || dbCity.city_name,
    originalName: dbCity.city_name,
    customLabel: dbCity.custom_label,
    country: dbCity.country,
    countryCode: dbCity.country_code,
    timezone: dbCity.timezone,
    coordinates: { lat: dbCity.latitude, lng: dbCity.longitude },
    region: dbCity.region,
    population: dbCity.population,
    isPopular: dbCity.is_popular,
    displayOrder: dbCity.display_order
  }))
}

/**
 * Get World Clock statistics for a user (count, most recent, etc.)
 */
export async function getUserWorldClockStats(userId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('user_world_clock_cities')
    .select('city_name, timezone, created_at')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching world clock stats:', error)
    return { total: 0, oldest: null, newest: null, timezones: [] }
  }

  if (!data || data.length === 0) {
    return { total: 0, oldest: null, newest: null, timezones: [] }
  }

  const sorted = data.sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  const uniqueTimezones = Array.from(new Set(data.map(city => city.timezone)))

  return {
    total: data.length,
    oldest: sorted[0]?.created_at,
    newest: sorted[sorted.length - 1]?.created_at,
    timezones: uniqueTimezones
  }
}