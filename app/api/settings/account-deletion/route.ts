import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { deleteUserAccount } from '@/app/actions/delete-user'

export async function POST(request: NextRequest) {
  try {
    // Check if we're in a static generation context (build time)
    const isStaticGeneration = process.env.NEXT_PHASE === 'phase-production-build'
    
    if (isStaticGeneration) {
      return NextResponse.json({ error: 'API not available during build' }, { status: 503 })
    }

    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, reason, password } = body

    switch (action) {
      case 'delete_account_immediate':
        // Use server action to delete user account
        try {
          const result = await deleteUserAccount(user.id, reason)
          
          if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 })
          }

          return NextResponse.json({ 
            message: result.message,
            deleted_at: result.deleted_at,
            deletionResults: result.deletionResults
          })

        } catch (error) {
          console.error('Error deleting account:', error)
          return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
        }

      case 'initiate_deletion':
        if (!password) {
          return NextResponse.json({ error: 'Password is required' }, { status: 400 })
        }

        // Verify password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email!,
          password: password
        })

        if (signInError) {
          return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
        }

        // Check if deletion already exists
        const { data: existingDeletion } = await supabase
          .from('account_deletions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_cancelled', false)
          .single()

        if (existingDeletion) {
          return NextResponse.json({ error: 'Account deletion already requested' }, { status: 400 })
        }

        // Schedule account deletion
        const { data: recoveryToken, error: deletionError } = await supabase.rpc('schedule_account_deletion', {
          user_uuid: user.id,
          reason: reason || null
        })

        if (deletionError) {
          return NextResponse.json({ error: 'Failed to schedule account deletion' }, { status: 400 })
        }

        // Log security event
        await supabase.rpc('log_security_event', {
          user_uuid: user.id,
          event_type: 'account_deletion_requested',
          event_details: { 
            reason: reason,
            recovery_token: recoveryToken,
            ip_address: request.headers.get('x-forwarded-for') || 'unknown'
          }
        })

        return NextResponse.json({ 
          message: 'Account deletion scheduled successfully',
          recovery_token: recoveryToken,
          scheduled_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })

      case 'cancel_deletion':
        const { data: deletion, error: fetchError } = await supabase
          .from('account_deletions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_cancelled', false)
          .single()

        if (fetchError || !deletion) {
          return NextResponse.json({ error: 'No active deletion request found' }, { status: 404 })
        }

        // Cancel deletion
        const { error: cancelError } = await supabase
          .from('account_deletions')
          .update({
            is_cancelled: true,
            cancelled_at: new Date().toISOString()
          })
          .eq('id', deletion.id)

        if (cancelError) {
          return NextResponse.json({ error: 'Failed to cancel deletion' }, { status: 400 })
        }

        // Log security event
        await supabase.rpc('log_security_event', {
          user_uuid: user.id,
          event_type: 'account_deletion_cancelled',
          event_details: { 
            deletion_id: deletion.id,
            ip_address: request.headers.get('x-forwarded-for') || 'unknown'
          }
        })

        return NextResponse.json({ message: 'Account deletion cancelled successfully' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Account deletion POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if we're in a static generation context (build time)
    const isStaticGeneration = process.env.NEXT_PHASE === 'phase-production-build'
    
    if (isStaticGeneration) {
      return NextResponse.json({ error: 'API not available during build' }, { status: 503 })
    }

    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current deletion status
    const { data: deletion, error: fetchError } = await supabase
      .from('account_deletions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_cancelled', false)
      .single()

    if (fetchError) {
      return NextResponse.json({ deletion: null })
    }

    return NextResponse.json({ deletion })
  } catch (error) {
    console.error('Account deletion GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
