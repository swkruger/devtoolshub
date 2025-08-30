import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { authServer } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const isAdmin = await authServer.isAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const supabase = await createSupabaseServerClient()

    // Apply the blog status constraint update
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.blogs DROP CONSTRAINT IF EXISTS blogs_status_check;'
    })

    if (dropError) {
      console.error('Error dropping constraint:', dropError)
      return NextResponse.json({ error: 'Failed to drop constraint' }, { status: 500 })
    }

    const { error: addError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE public.blogs 
            ADD CONSTRAINT blogs_status_check 
            CHECK (status IN ('draft', 'published', 'editing', 'rejected', 'ready to publish'));`
    })

    if (addError) {
      console.error('Error adding constraint:', addError)
      return NextResponse.json({ error: 'Failed to add constraint' }, { status: 500 })
    }

    // Update the comment
    const { error: commentError } = await supabase.rpc('exec_sql', {
      sql: `COMMENT ON COLUMN public.blogs.status IS 'Blog status: draft, published, editing, rejected, ready to publish';`
    })

    if (commentError) {
      console.error('Error updating comment:', commentError)
      // Not critical, continue
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Blog status constraint updated successfully' 
    })

  } catch (error) {
    console.error('Error fixing blog constraint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
