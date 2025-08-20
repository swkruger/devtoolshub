import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { authServer } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const isAdmin = await authServer.isAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('blogs')
      .select('id, title, slug, status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching blogs:', error)
      return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 })
    }

    return NextResponse.json({ 
      blogs: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Error in blogs list API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
