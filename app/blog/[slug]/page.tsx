import { notFound } from 'next/navigation'
import DOMPurify from 'isomorphic-dompurify'
import { marked } from 'marked'
import { getPublishedBlogBySlug, listPopularBlogs } from '@/lib/services/blogs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Play, 
  Share2, 
  Clock, 
  Calendar,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 0

// Generate dynamic metadata for each blog post
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await getPublishedBlogBySlug(params.slug)
  
  if (!blog) {
    return {
      title: 'Blog Post Not Found - DevToolsHub',
      description: 'The requested blog post could not be found.',
    }
  }

  // Generate dynamic metadata
  const metaDescription = blog.meta_description || 
    blog.content_html.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
  
  const metaKeywords = blog.meta_keywords || 
    'DevToolsHub, developer tools, ' + blog.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ', ')

  const ogTitle = blog.og_title || blog.title
  const ogDescription = blog.og_description || metaDescription
  const ogImage = blog.og_image || blog.image_url || '/icons/icon-192x192.png'
  
  const twitterTitle = blog.twitter_title || blog.title
  const twitterDescription = blog.twitter_description || metaDescription
  const twitterImage = blog.twitter_image || blog.image_url || '/icons/icon-192x192.png'

  return {
    title: blog.title,
    description: metaDescription,
    keywords: metaKeywords,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://devtoolshub.vercel.app'}/blog/${blog.slug}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
      publishedTime: blog.published_at || undefined,
      modifiedTime: blog.updated_at,
      authors: ['DevToolsHub'],
    },
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle,
      description: twitterDescription,
      images: [twitterImage],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://devtoolshub.vercel.app'}/blog/${blog.slug}`,
    },
  }
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = await getPublishedBlogBySlug(params.slug)
  if (!blog) return notFound()

  const popular = (await listPopularBlogs(5)).filter((b) => b.id !== blog.id)

  const isMarkdown = Boolean((blog as any).content_markdown)
  const htmlFromMarkdown = isMarkdown ? marked.parse((blog as any).content_markdown || '') : ''
  const sanitized = DOMPurify.sanitize(isMarkdown ? (htmlFromMarkdown as string) : blog.content_html, { USE_PROFILES: { html: true } })

  // Calculate read time (rough estimate: 200 words per minute)
  const textForCount = isMarkdown ? (blog as any).content_markdown : blog.content_html
  const wordCount = (textForCount || '').replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
  const readTime = Math.max(1, Math.round(wordCount / 200))

  // Format date
  const publishedDate = blog.published_at ? new Date(blog.published_at) : null
  const timeAgo = publishedDate ? getTimeAgo(publishedDate) : 'Draft'

  // Generate dynamic metadata
  const metaDescription = blog.meta_description || 
    (textForCount || '').replace(/<[^>]*>/g, '').substring(0, 160) + '...'
  
  const metaKeywords = blog.meta_keywords || 
    'DevToolsHub, developer tools, ' + blog.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ', ')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.og_title || blog.title,
    description: blog.og_description || metaDescription,
    datePublished: blog.published_at || undefined,
    dateModified: blog.updated_at,
    author: {
      '@type': 'Person',
      name: 'DevToolsHub',
    },
    image: blog.og_image || blog.image_url,
    keywords: metaKeywords,
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back to Blog Link */}
        <div className="mb-8">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>

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
                  <AvatarImage src="/icons/icon-48x48.png" alt="DevToolsHub" />
                  <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    DH
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    DevToolsHub
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 px-3 text-sm border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    Follow
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{readTime} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{timeAgo}</span>
                </div>
              </div>
            </div>

            {/* Engagement Icons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                  <Heart className="h-5 w-5" />
                  <span className="text-sm">1</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm">Comment</span>
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  <Bookmark className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  <Play className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {blog.image_url && (
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={blog.image_url}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Blog Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: sanitized }} 
              className="text-gray-800 dark:text-gray-200 leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Tags:</span>
            {blog.is_featured && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Featured
              </Badge>
            )}
            {blog.is_popular && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                Popular
              </Badge>
            )}
          </div>
        </article>

        {/* Sidebar */}
        <aside className="mt-16">
          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Popular Posts
              </h3>
              <div className="space-y-4">
                {popular.map((post) => (
                  <Link 
                    key={post.id} 
                    href={`/blog/${post.slug}`}
                    className="block group"
                  >
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors">
                      {post.image_url && (
                        <div className="flex-shrink-0 w-16 h-12 rounded overflow-hidden bg-gray-200 dark:bg-gray-600">
                          <img
                            src={post.image_url}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {post.published_at ? getTimeAgo(new Date(post.published_at)) : 'Draft'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  )
}

// Helper function to get time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) === 1 ? '' : 's'} ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) === 1 ? '' : 's'} ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} month${Math.floor(diffInSeconds / 2592000) === 1 ? '' : 's'} ago`
  return `${Math.floor(diffInSeconds / 31536000)} year${Math.floor(diffInSeconds / 31536000) === 1 ? '' : 's'} ago`
}

