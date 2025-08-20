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

    // Remove sessions older than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { error: cleanupError } = await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .lt('last_active', thirtyDaysAgo.toISOString())

    if (cleanupError) {
      console.error('Error cleaning up old sessions:', cleanupError)
      return NextResponse.json({ error: 'Failed to cleanup old sessions' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Old sessions cleaned up successfully' })
  } catch (error) {
    console.error('Session cleanup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
