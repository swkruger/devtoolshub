'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function deleteUserAccount(userId: string, reason?: string) {
  try {
    // Check if we're in a static generation context (build time)
    const isStaticGeneration = process.env.NEXT_PHASE === 'phase-production-build'
    
    if (isStaticGeneration) {
      // During build time, return a mock response
      return {
        success: false,
        error: 'Cannot delete account during build process'
      }
    }

    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || user.id !== userId) {
      throw new Error('Unauthorized or user mismatch')
    }

    // Use the database function to delete the user completely
    const { data, error } = await supabase.rpc('delete_my_account', {
      reason: reason || null
    })

    if (error) {
      console.error('Error calling delete_my_account function:', error)
      throw new Error(`Failed to delete account: ${error.message}`)
    }

    if (!data || !data.success) {
      throw new Error(data?.error || 'Failed to delete account')
    }

    // Sign out the user to invalidate their session
    try {
      await supabase.auth.signOut()
    } catch (signOutError) {
      console.error('Error signing out user:', signOutError)
    }

    return {
      success: true,
      message: data.message || 'Account deleted successfully',
      deletionResults: data.deletion_results,
      deleted_at: data.deleted_at,
      user_email: data.user_email,
      sign_out_required: data.sign_out_required
    }

  } catch (error) {
    console.error('Error deleting user account:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete account'
    }
  }
}
