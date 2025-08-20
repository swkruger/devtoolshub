import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { sendLoginAlert, sendNewDeviceAlert, type LoginData } from '@/lib/email'
import { parseUserAgent, isNewDevice } from '@/lib/device-utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user sessions from our custom user_sessions table
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('last_active', { ascending: false })

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }

    // Get current session ID from headers or cookies
    const currentSessionId = request.headers.get('x-session-id') || 
                           request.cookies.get('sb-access-token')?.value

    // Transform sessions data for frontend
    const transformedSessions = (sessions || []).map(session => ({
      id: session.id,
      userAgent: session.user_agent || 'Unknown Browser',
      ipAddress: session.ip_address || 'Unknown IP',
      createdAt: session.created_at,
      lastActive: session.last_active,
      isCurrent: session.session_id === currentSessionId
    }))

    return NextResponse.json({ sessions: transformedSessions })
  } catch (error) {
    console.error('Sessions GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Mark the session as inactive instead of deleting
    const { error: revokeError } = await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('id', sessionId)
      .eq('user_id', user.id)

    if (revokeError) {
      console.error('Error revoking session:', revokeError)
      return NextResponse.json({ error: 'Failed to revoke session' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Session revoked successfully' })
  } catch (error) {
    console.error('Session DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST endpoint to create/update a session
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, userAgent, ipAddress } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Check if session already exists for this user and browser combination
    const { data: existingSessions } = await supabase
      .from('user_sessions')
      .select('id, session_id')
      .eq('user_id', user.id)
      .eq('is_active', true)

    // Find existing session with same session_id or similar user_agent
    const existingSession = existingSessions?.find(session => 
      session.session_id === sessionId || 
      session.session_id.includes(user.id)
    )

         if (existingSession) {
       // Update existing session
       const { error: updateError } = await supabase
         .from('user_sessions')
         .update({ 
           last_active: new Date().toISOString(),
           user_agent: userAgent,
           ip_address: ipAddress,
           session_id: sessionId // Update to new session ID format
         })
         .eq('id', existingSession.id)

       if (updateError) {
         console.error('Error updating session:', updateError)
         return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
       }
     } else {
       // This is a new session - check if we should send notifications
       try {
         // Get user data and notification preferences
         const { data: userData } = await supabase
           .from('users')
           .select('id, email, name, avatar_url')
           .eq('id', user.id)
           .single()

         const { data: notificationPrefs } = await supabase
           .from('user_notification_preferences')
           .select('login_alerts, new_device_logins')
           .eq('user_id', user.id)
           .single()

         // Get previous sessions to check if this is a new device
         const { data: previousSessions } = await supabase
           .from('user_sessions')
           .select('user_agent, last_active, ip_address')
           .eq('user_id', user.id)
           .eq('is_active', true)
           .order('last_active', { ascending: false })
           .limit(10)

         const previousUserAgents = (previousSessions || []).map(s => s.user_agent)
         const deviceInfo = parseUserAgent(userAgent)
         const isNewDeviceLogin = isNewDevice(userAgent, previousUserAgents)

         // Prepare login data
         const loginData: LoginData = {
           timestamp: new Date().toISOString(),
           ipAddress,
           userAgent,
           deviceType: deviceInfo.deviceType,
           browser: deviceInfo.browser
         }

         // Send login alert if enabled
         if (notificationPrefs?.login_alerts && userData) {
           await sendLoginAlert(userData, loginData)
         }

         // Send new device alert if enabled and it's a new device
         if (notificationPrefs?.new_device_logins && isNewDeviceLogin && userData) {
           // Get the most recent previous session for comparison
           const previousSession = previousSessions?.[0]
           const previousLoginData = previousSession ? {
             timestamp: previousSession.last_active || new Date().toISOString(),
             ipAddress: previousSession.ip_address || 'Unknown IP',
             userAgent: previousSession.user_agent || 'Unknown Browser',
             deviceType: parseUserAgent(previousSession.user_agent || '').deviceType,
             browser: parseUserAgent(previousSession.user_agent || '').browser
           } : undefined

           await sendNewDeviceAlert(userData, loginData, previousLoginData)
         }
                } catch (error) {
           console.error('Error sending security notifications:', error)
           // Don't fail the session creation if notifications fail
         }

         // Create new session only if no active session exists for this user
         const { error: insertError } = await supabase
           .from('user_sessions')
           .insert({
             user_id: user.id,
             session_id: sessionId,
             user_agent: userAgent,
             ip_address: ipAddress
           })

         if (insertError) {
           console.error('Error creating session:', insertError)
           return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
         }

         // Clean up old sessions for this user (keep only the 5 most recent)
         const { data: allUserSessions } = await supabase
           .from('user_sessions')
           .select('id')
           .eq('user_id', user.id)
           .eq('is_active', true)
           .order('last_active', { ascending: false })

         if (allUserSessions && allUserSessions.length > 5) {
           const sessionsToDeactivate = allUserSessions.slice(5)
           const sessionIds = sessionsToDeactivate.map(s => s.id)
           
           await supabase
             .from('user_sessions')
             .update({ is_active: false })
             .in('id', sessionIds)
         }
    }

    return NextResponse.json({ message: 'Session updated successfully' })
  } catch (error) {
    console.error('Session POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
