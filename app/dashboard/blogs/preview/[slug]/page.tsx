'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DOMPurify from 'isomorphic-dompurify'
import { marked } from 'marked'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BlogStatusBadge } from '@/components/blog/blog-status-badge'
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Play, 
  Share2, 
  Clock, 
  Calendar,
  ArrowLeft,
  Eye,
  Edit,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

interface Blog {
  id: string
  title: string
  slug: string
  content_html: string
  content_markdown?: string
  status: 'draft' | 'published' | 'editing' | 'rejected' | 'ready to publish'
  is_featured: boolean
  is_popular: boolean
  created_at: string
  updated_at: string
  published_at: string | null
  author_id: string
  image_url?: string | null
  cover_image_alt_text?: string | null
  cover_image_caption?: string | null
  meta_description?: string | null
  meta_keywords?: string | null
  og_title?: string | null
  og_description?: string | null
  og_image?: string | null
  twitter_title?: string | null
  twitter_description?: string | null
  twitter_image?: string | null
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
  return `${Math.floor(diffInSeconds / 31536000)}y ago`
}

export default function BlogPreviewPage() {
  const params = useParams() as { slug: string }
  const router = useRouter()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

    // Combined admin check and blog fetch
  useEffect(() => {
    const loadData = async () => {
      try {
        // Step 1: Check admin status
        try {
          const adminResponse = await fetch('/api/user/admin-status')
          
          if (!adminResponse.ok) {
            setIsAdmin(false)
            setIsLoading(false)
            return
          }
          
          const adminData = await adminResponse.json()
          setIsAdmin(adminData.isAdmin)
          
          if (!adminData.isAdmin) {
            setIsLoading(false)
            return
          }
        } catch (adminError) {
          setIsAdmin(false)
          setIsLoading(false)
          return
        }
        
        // Step 2: Fetch blog data using server-side API
        try {
          const blogResponse = await fetch(`/api/blogs/${params.slug}`)
          
          if (!blogResponse.ok) {
            if (blogResponse.status === 404) {
              setError(`Blog with slug "${params.slug}" not found`)
            } else {
              setError('Failed to load blog')
            }
            return
          }
          
          const blogData = await blogResponse.json()
          
          if (blogData.blog) {
            setBlog(blogData.blog as Blog)
          } else {
            setError('Blog data not found')
          }
        } catch (blogError) {
          setError('Failed to load blog')
        }
      } catch (error) {
        setError('Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [params.slug])

  // Redirect if not admin (only if we're done loading and confirmed not admin)
  useEffect(() => {
    if (!isLoading && isAdmin === false) {
      router.push('/dashboard')
    }
  }, [isLoading, isAdmin, router])

  // Show loading or redirect if not admin
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Checking permissions...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect via useEffect
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
              <Button 
                onClick={() => router.push('/dashboard/blogs')}
                className="mt-4"
              >
                Back to Blogs
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

     if (!blog) {
     return (
       <div className="min-h-screen bg-white dark:bg-gray-900">
         <div className="container mx-auto px-4 py-8 max-w-4xl">
           <div className="flex items-center justify-center py-12">
             <div className="text-center">
               <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
               <h2 className="text-xl font-semibold mb-2">Blog Not Found</h2>
               <p className="text-gray-600 dark:text-gray-400 mb-4">
                 {error || 'The requested blog post could not be found.'}
               </p>
               <div className="flex gap-2 justify-center">
                 <Button 
                   onClick={() => router.push('/dashboard/blogs')}
                   variant="outline"
                 >
                   Back to Blogs
                 </Button>
                 <Button 
                   onClick={() => router.push('/dashboard/blogs/new')}
                 >
                   Create New Blog
                 </Button>
               </div>
             </div>
           </div>
         </div>
       </div>
     )
   }

  const isMarkdown = Boolean(blog.content_markdown)
  const htmlFromMarkdown = isMarkdown ? marked.parse(blog.content_markdown || '') : ''
  const sanitized = DOMPurify.sanitize(isMarkdown ? (htmlFromMarkdown as string) : blog.content_html, { USE_PROFILES: { html: true } })

  // Calculate read time (rough estimate: 200 words per minute)
  const textForCount = isMarkdown ? blog.content_markdown : blog.content_html
  const wordCount = (textForCount || '').replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
  const readTime = Math.max(1, Math.round(wordCount / 200))

  // Format date
  const publishedDate = blog.published_at ? new Date(blog.published_at) : null
  const timeAgo = publishedDate ? getTimeAgo(publishedDate) : 'Draft'

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Preview Banner */}
      <div className="bg-yellow-100 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Preview Mode - {blog.status === 'draft' ? 'Draft' : 'Published'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/blogs/${blog.id}/edit`)}
                className="text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-800"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/blogs')}
                className="text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-800"
              >
                Back to Blogs
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Main Content */}
        <article className="space-y-8">
          {/* Header Section */}
          <header className="space-y-6">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {blog.title}
            </h1>

            {/* Author and Metadata */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/icons/icon-192x192.png" alt="DevToolsHub" />
                  <AvatarFallback>DT</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">DevToolsHub</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {timeAgo} • {readTime} min read
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <BlogStatusBadge status={blog.status} size="sm" />

              {/* Featured/Popular Badges */}
              {blog.is_featured && (
                <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300">
                  ⭐ Featured
                </Badge>
              )}
              {blog.is_popular && (
                <Badge variant="outline" className="border-amber-200 text-amber-700 dark:border-amber-700 dark:text-amber-300">
                  🔥 Popular
                </Badge>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {blog.image_url && (
            <div className="space-y-2">
              <div className="aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                <img
                  src={blog.image_url}
                  alt={blog.cover_image_alt_text || blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Cover Image Caption */}
              {blog.cover_image_caption && (
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    {blog.cover_image_caption}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="max-w-none">
            <div 
              className="blog-content text-gray-800 dark:text-gray-200 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitized }} 
            />
          </div>

          {/* SEO Preview Section */}
          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                SEO Preview
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description:</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {blog.meta_description || 'No meta description set'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Keywords:</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {blog.meta_keywords || 'No keywords set'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Open Graph Title:</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {blog.og_title || blog.title}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Open Graph Description:</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {blog.og_description || blog.meta_description || 'No OG description set'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </article>
      </div>
    </div>
  )
}
