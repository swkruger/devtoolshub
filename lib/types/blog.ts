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
  cover_image_alt_text?: string | null
  // SEO fields
  meta_description?: string | null
  meta_keywords?: string | null
  og_title?: string | null
  og_description?: string | null
  og_image?: string | null
  twitter_title?: string | null
  twitter_description?: string | null
  twitter_image?: string | null
}

export interface ListPublishedBlogsParams {
  search?: string
  limit?: number
  offset?: number
}

export interface CreateBlogData {
  title: string
  slug: string
  content_html: string
  status?: BlogStatus
  is_featured?: boolean
  is_popular?: boolean
  published_at?: string | null
  image_url?: string | null
  cover_image_alt_text?: string | null
  // SEO fields
  meta_description?: string | null
  meta_keywords?: string | null
  og_title?: string | null
  og_description?: string | null
  og_image?: string | null
  twitter_title?: string | null
  twitter_description?: string | null
  twitter_image?: string | null
}

export interface UpdateBlogData {
  title?: string
  slug?: string
  content_html?: string
  status?: BlogStatus
  is_featured?: boolean
  is_popular?: boolean
  published_at?: string | null
  image_url?: string | null
  cover_image_alt_text?: string | null
  // SEO fields
  meta_description?: string | null
  meta_keywords?: string | null
  og_title?: string | null
  og_description?: string | null
  og_image?: string | null
  twitter_title?: string | null
  twitter_description?: string | null
  twitter_image?: string | null
}

