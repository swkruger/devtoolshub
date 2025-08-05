import { createSupabaseServerClient } from "@/lib/supabase-server"

export interface UserTimezone {
  id: string
  user_id: string
  timezone: string
  label: string
  display_order: number
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface CreateUserTimezoneData {
  timezone: string
  label: string
  display_order?: number
  is_default?: boolean
}

export interface UpdateUserTimezoneData {
  label?: string
  display_order?: number
}

/**
 * Get all timezones for a user, ordered by display_order
 */
export async function getUserTimezones(userId: string): Promise<UserTimezone[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('user_timezones')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching user timezones:', error)
    throw new Error(`Failed to fetch user timezones: ${error.message}`)
  }

  return data || []
}

/**
 * Create a new timezone for a user
 */
export async function createUserTimezone(
  userId: string, 
  timezoneData: CreateUserTimezoneData
): Promise<UserTimezone> {
  const supabase = await createSupabaseServerClient()

  // Get the next display order if not provided
  let displayOrder = timezoneData.display_order
  if (displayOrder === undefined) {
    const { count } = await supabase
      .from('user_timezones')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    displayOrder = (count || 0)
  }

  const { data, error } = await supabase
    .from('user_timezones')
    .insert({
      user_id: userId,
      timezone: timezoneData.timezone,
      label: timezoneData.label,
      display_order: displayOrder,
      is_default: timezoneData.is_default || false
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('This timezone is already added to your comparison')
    }
    console.error('Error creating user timezone:', error)
    throw new Error(`Failed to create user timezone: ${error.message}`)
  }

  return data
}

/**
 * Update a user timezone (label or display order)
 */
export async function updateUserTimezone(
  userId: string,
  timezoneId: string,
  updateData: UpdateUserTimezoneData
): Promise<UserTimezone> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('user_timezones')
    .update(updateData)
    .eq('id', timezoneId)
    .eq('user_id', userId) // Ensure user owns this timezone
    .select()
    .single()

  if (error) {
    console.error('Error updating user timezone:', error)
    throw new Error(`Failed to update user timezone: ${error.message}`)
  }

  return data
}

/**
 * Delete a user timezone (only if not default)
 */
export async function deleteUserTimezone(userId: string, timezoneId: string): Promise<void> {
  const supabase = await createSupabaseServerClient()

  // First check if this is a default timezone
  const { data: timezone, error: fetchError } = await supabase
    .from('user_timezones')
    .select('is_default')
    .eq('id', timezoneId)
    .eq('user_id', userId)
    .single()

  if (fetchError) {
    console.error('Error fetching timezone:', fetchError)
    throw new Error('Timezone not found')
  }

  if (timezone.is_default) {
    throw new Error('Cannot delete default timezone')
  }

  const { error } = await supabase
    .from('user_timezones')
    .delete()
    .eq('id', timezoneId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting user timezone:', error)
    throw new Error(`Failed to delete user timezone: ${error.message}`)
  }
}

/**
 * Reorder user timezones
 */
export async function reorderUserTimezones(
  userId: string, 
  timezoneOrders: { id: string; display_order: number }[]
): Promise<void> {
  const supabase = await createSupabaseServerClient()

  // Update display orders in a transaction-like manner
  const updates = timezoneOrders.map(({ id, display_order }) => 
    supabase
      .from('user_timezones')
      .update({ display_order })
      .eq('id', id)
      .eq('user_id', userId)
  )

  try {
    await Promise.all(updates)
  } catch (error) {
    console.error('Error reordering user timezones:', error)
    throw new Error('Failed to reorder timezones')
  }
}

/**
 * Initialize default timezones for a new premium user
 */
export async function initializeDefaultTimezones(userId: string): Promise<UserTimezone[]> {
  const supabase = await createSupabaseServerClient()

  const defaultTimezones = [
    { timezone: 'UTC', label: 'UTC', display_order: 0, is_default: true },
    { timezone: 'America/New_York', label: 'New York', display_order: 1, is_default: false },
    { timezone: 'Europe/London', label: 'London', display_order: 2, is_default: false },
    { timezone: 'Asia/Tokyo', label: 'Tokyo', display_order: 3, is_default: false }
  ]

  const { data, error } = await supabase
    .from('user_timezones')
    .upsert(
      defaultTimezones.map(tz => ({
        user_id: userId,
        ...tz
      })),
      { 
        onConflict: 'user_id,timezone',
        ignoreDuplicates: true 
      }
    )
    .select()

  if (error) {
    console.error('Error initializing default timezones:', error)
    throw new Error(`Failed to initialize default timezones: ${error.message}`)
  }

  return data || []
}

/**
 * Get timezone statistics for a user (count, most used, etc.)
 */
export async function getUserTimezoneStats(userId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('user_timezones')
    .select('timezone, created_at')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching timezone stats:', error)
    return { total: 0, oldest: null, newest: null }
  }

  if (!data || data.length === 0) {
    return { total: 0, oldest: null, newest: null }
  }

  const sorted = data.sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return {
    total: data.length,
    oldest: sorted[0]?.created_at,
    newest: sorted[sorted.length - 1]?.created_at
  }
}