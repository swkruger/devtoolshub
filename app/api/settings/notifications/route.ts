import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user notification preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (preferencesError && preferencesError.code !== 'PGRST116') {
      console.error('Error fetching notification preferences:', preferencesError)
      return NextResponse.json({ error: 'Failed to fetch notification preferences' }, { status: 500 })
    }

    // Return default preferences if none exist
    const defaultPreferences = {
      login_alerts: true,
      new_device_logins: true
    }

    return NextResponse.json({ 
      preferences: preferences || defaultPreferences 
    })
  } catch (error) {
    console.error('Notifications GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { login_alerts, new_device_logins } = body

    // Validate input
    if (typeof login_alerts !== 'boolean' || typeof new_device_logins !== 'boolean') {
      return NextResponse.json({ error: 'Invalid notification preferences' }, { status: 400 })
    }

    // Check if preferences already exist
    const { data: existingPreferences } = await supabase
      .from('user_notification_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let result
    if (existingPreferences) {
      // Update existing preferences
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .update({ 
          login_alerts, 
          new_device_logins,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating notification preferences:', error)
        return NextResponse.json({ error: 'Failed to update notification preferences' }, { status: 500 })
      }

      result = data
    } else {
      // Create new preferences
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .insert({
          user_id: user.id,
          login_alerts,
          new_device_logins
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating notification preferences:', error)
        return NextResponse.json({ error: 'Failed to create notification preferences' }, { status: 500 })
      }

      result = data
    }

    return NextResponse.json({ 
      success: true, 
      preferences: result 
    })
  } catch (error) {
    console.error('Notifications POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
