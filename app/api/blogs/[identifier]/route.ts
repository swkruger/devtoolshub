import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { authServer } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { identifier: string } }
) {
  try {
    // Check if user is admin
    const isAdmin = await authServer.isAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const supabase = await createSupabaseServerClient()
    
    // Try to fetch by ID first (UUID format)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.identifier)
    
    let query = supabase.from('blogs').select('*')
    
    if (isUUID) {
      // If it looks like a UUID, search by ID
      query = query.eq('id', params.identifier)
    } else {
      // Otherwise, search by slug
      query = query.eq('slug', params.identifier)
    }
    
    const { data, error } = await query.single()

    if (error) {
      console.error('Error fetching blog:', error)
      if ((error as any).code === 'PGRST116') {
        return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 })
    }

    return NextResponse.json({ blog: data })
  } catch (error) {
    console.error('Error in blog API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { identifier: string } }
) {
  try {
    // Check if user is admin
    const isAdmin = await authServer.isAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const body = await request.json()
    const supabase = await createSupabaseServerClient()
    
    // For updates, we need the ID, so check if identifier is a UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.identifier)
    
    if (!isUUID) {
      return NextResponse.json({ error: 'Invalid blog ID for update' }, { status: 400 })
    }
    
    const { error } = await supabase
      .from('blogs')
      .update(body)
      .eq('id', params.identifier)

    if (error) {
      console.error('Error updating blog:', error)
      return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in blog update API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { identifier: string } }
) {
  try {
    // Check if user is admin
    const isAdmin = await authServer.isAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const supabase = await createSupabaseServerClient()
    
    // For deletes, we need the ID, so check if identifier is a UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.identifier)
    
    if (!isUUID) {
      return NextResponse.json({ error: 'Invalid blog ID for deletion' }, { status: 400 })
    }
    
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', params.identifier)

    if (error) {
      console.error('Error deleting blog:', error)
      return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in blog delete API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
