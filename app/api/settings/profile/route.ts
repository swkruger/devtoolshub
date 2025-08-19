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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get user preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      profile,
      preferences: preferences || {
        timezone: 'UTC',
        theme: 'system',
        language: 'en',
        email_notifications: {},
        developer_preferences: {}
      }
    })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { profile, preferences } = body

          // Update profile if provided
      if (profile) {
        const { error: profileError } = await supabase
          .from('users')
          .update({
            name: profile.name,
            avatar_url: profile.avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

      if (profileError) {
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 400 })
      }
    }

    // Update preferences if provided
    if (preferences) {
      // Check if preferences exist
      const { data: existingPreferences } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existingPreferences) {
        // Update existing preferences
        const { error: preferencesError } = await supabase
          .from('user_preferences')
          .update({
            timezone: preferences.timezone,
            theme: preferences.theme,
            language: preferences.language,
            email_notifications: preferences.email_notifications,
            developer_preferences: preferences.developer_preferences,
            bio: preferences.bio,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (preferencesError) {
          return NextResponse.json({ error: 'Failed to update preferences' }, { status: 400 })
        }
      } else {
        // Create new preferences
        const { error: preferencesError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            timezone: preferences.timezone || 'UTC',
            theme: preferences.theme || 'system',
            language: preferences.language || 'en',
            email_notifications: preferences.email_notifications || {},
            developer_preferences: preferences.developer_preferences || {},
            bio: preferences.bio
          })

        if (preferencesError) {
          return NextResponse.json({ error: 'Failed to create preferences' }, { status: 400 })
        }
      }
    }

    return NextResponse.json({ message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
