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

    // Fetch all user data from various tables
    const exportData: any = {
      export_info: {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        export_version: '1.0'
      },
      auth_user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_sign_in_at: user.last_sign_in_at,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata
      }
    }

    // Fetch user profile data
    try {
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profileError && userProfile) {
        exportData.user_profile = userProfile
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }

    // Fetch user preferences
    try {
      const { data: userPreferences, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!preferencesError && userPreferences) {
        exportData.user_preferences = userPreferences
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error)
    }

    // Fetch notification preferences
    try {
      const { data: notificationPreferences, error: notificationError } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!notificationError && notificationPreferences) {
        exportData.notification_preferences = notificationPreferences
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
    }

    // Fetch active sessions
    try {
      const { data: userSessions, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (!sessionsError && userSessions) {
        exportData.active_sessions = userSessions
      }
    } catch (error) {
      console.error('Error fetching user sessions:', error)
    }

    // Fetch account deletion requests (if any)
    try {
      const { data: accountDeletions, error: deletionError } = await supabase
        .from('account_deletions')
        .select('*')
        .eq('user_id', user.id)

      if (!deletionError && accountDeletions) {
        exportData.account_deletions = accountDeletions
      }
    } catch (error) {
      console.error('Error fetching account deletions:', error)
    }

    // Fetch audit logs (if any)
    try {
      const { data: auditLogs, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100) // Limit to last 100 audit entries

      if (!auditError && auditLogs) {
        exportData.audit_logs = auditLogs
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    }

    // Fetch Stripe subscription data (if exists)
    try {
      const { data: stripeData, error: stripeError } = await supabase
        .from('users')
        .select('stripe_customer_id, plan')
        .eq('id', user.id)
        .single()

      if (!stripeError && stripeData) {
        exportData.stripe_data = {
          stripe_customer_id: stripeData.stripe_customer_id,
          current_plan: stripeData.plan
        }
      }
    } catch (error) {
      console.error('Error fetching Stripe data:', error)
    }

    // Add any tool-specific data here
    // For example, if you have tables for saved tool data, add them here
    exportData.tool_data = {
      note: 'Tool-specific data would be exported here if any tools store user data'
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json({ error: 'Failed to export user data' }, { status: 500 })
  }
}
