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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const sortField = searchParams.get('sortField') || 'updated_at'
    const sortDirection = searchParams.get('sortDirection') || 'desc'
    const search = searchParams.get('search') || ''

    const supabase = await createSupabaseServerClient()
    let query = supabase
      .from('blogs')
      .select('id, title, slug, status, is_featured, is_popular, created_at, updated_at, published_at')
      .order(sortField, { ascending: sortDirection === 'asc' })

    // Apply status filter if not 'all'
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply search filter if provided
    if (search.trim()) {
      // Check if search term looks like a UUID (contains hyphens and is long enough)
      const isUUIDLike = search.includes('-') && search.length >= 8
      
      if (isUUIDLike) {
        // If it looks like a UUID, search by exact ID match
        query = query.eq('id', search)
      } else {
        // Otherwise search in title (case-insensitive partial match)
        query = query.ilike('title', `%${search}%`)
      }
    }

    const { data, error } = await query

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
