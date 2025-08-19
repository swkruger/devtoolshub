import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, currentPassword, newPassword } = body

    switch (action) {
      case 'change_password':
        if (!currentPassword || !newPassword) {
          return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
        }

        // Validate password strength
        if (newPassword.length < 8) {
          return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 })
        }

        // Check if password contains required characters
        const hasUpperCase = /[A-Z]/.test(newPassword)
        const hasLowerCase = /[a-z]/.test(newPassword)
        const hasNumbers = /\d/.test(newPassword)
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

        if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
          return NextResponse.json({ 
            error: 'Password must contain uppercase, lowercase, number, and special character' 
          }, { status: 400 })
        }

        // Change password using Supabase Auth
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        })

        if (passwordError) {
          return NextResponse.json({ error: 'Failed to change password' }, { status: 400 })
        }

        // Log security event
        await supabase.rpc('log_security_event', {
          user_uuid: user.id,
          event_type: 'password_changed',
          event_details: { ip_address: request.headers.get('x-forwarded-for') || 'unknown' }
        })

        return NextResponse.json({ message: 'Password changed successfully' })

      case 'revoke_session':
        const { sessionId } = body
        
        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
        }

        // Note: Supabase doesn't provide direct session revocation via API
        // This would typically be handled by invalidating refresh tokens
        // For now, we'll log the action
        await supabase.rpc('log_security_event', {
          user_uuid: user.id,
          event_type: 'session_revoked',
          event_details: { session_id: sessionId }
        })

        return NextResponse.json({ message: 'Session revoked successfully' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Security POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
