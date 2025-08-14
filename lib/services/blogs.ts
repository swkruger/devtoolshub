import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Blog, ListPublishedBlogsParams } from '@/lib/types/blog'

export async function listPublishedBlogs(params: ListPublishedBlogsParams = {}): Promise<{ items: Blog[]; total: number }>{
  const supabase = await createSupabaseServerClient()
  const { search, limit = 12, offset = 0 } = params

  let query = supabase
    .from('blogs')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (search && search.trim()) {
    query = query.ilike('title', `%${search.trim()}%`)
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1)
  if (error) {
    throw new Error(`Failed to list blogs: ${error.message}`)
  }
  return { items: (data as Blog[]) || [], total: count || 0 }
}

export async function listFeaturedBlogs(limit = 6): Promise<Blog[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Failed to list featured blogs: ${error.message}`)
  return (data as Blog[]) || []
}

export async function listPopularBlogs(limit = 6): Promise<Blog[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('status', 'published')
    .eq('is_popular', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Failed to list popular blogs: ${error.message}`)
  return (data as Blog[]) || []
}

export async function getPublishedBlogBySlug(slug: string): Promise<Blog | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('status', 'published')
    .eq('slug', slug)
    .single()

  if (error) {
    if ((error as any).code === 'PGRST116') return null
    throw new Error(`Failed to get blog: ${error.message}`)
  }
  return (data as Blog) || null
}

// Admin CRUD (RLS-enforced via policies)
export interface UpsertBlogInput {
  id?: string
  title: string
  slug: string
  content_html: string
  status: 'draft' | 'published'
  is_featured?: boolean
  is_popular?: boolean
}

export async function createBlog(input: UpsertBlogInput): Promise<Blog> {
  const supabase = await createSupabaseServerClient()

  const payload = {
    title: input.title,
    slug: input.slug,
    content_html: input.content_html,
    status: input.status,
    is_featured: input.is_featured ?? false,
    is_popular: input.is_popular ?? false,
    // author_id is set by client; ensure admin via RLS
  } as any

  // Ensure published_at when publishing
  if (input.status === 'published') {
    payload.published_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('blogs')
    .insert(payload)
    .select()
    .single()

  if (error) throw new Error(`Failed to create blog: ${error.message}`)
  return data as Blog
}

export async function updateBlog(id: string, input: UpsertBlogInput): Promise<Blog> {
  const supabase = await createSupabaseServerClient()

  const payload: any = {
    title: input.title,
    slug: input.slug,
    content_html: input.content_html,
    status: input.status,
    is_featured: input.is_featured ?? false,
    is_popular: input.is_popular ?? false,
  }

  if (input.status === 'published') {
    payload.published_at = new Date().toISOString()
  } else {
    payload.published_at = null
  }

  const { data, error } = await supabase
    .from('blogs')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Failed to update blog: ${error.message}`)
  return data as Blog
}

export async function deleteBlog(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('blogs').delete().eq('id', id)
  if (error) throw new Error(`Failed to delete blog: ${error.message}`)
}

