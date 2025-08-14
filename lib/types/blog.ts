export type BlogStatus = 'draft' | 'published'

export interface Blog {
  id: string
  title: string
  slug: string
  content_html: string
  status: BlogStatus
  is_featured: boolean
  is_popular: boolean
  created_at: string
  updated_at: string
  published_at: string | null
  author_id: string
  image_url?: string | null
}

export interface ListPublishedBlogsParams {
  search?: string
  limit?: number
  offset?: number
}

