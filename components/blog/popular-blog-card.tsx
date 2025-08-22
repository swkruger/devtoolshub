import Link from 'next/link'
import Image from 'next/image'
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'
import type { Blog } from '@/lib/types/blog'

interface PopularBlogCardProps {
  blog: Blog
}

export function PopularBlogCard({ blog }: PopularBlogCardProps) {
  return (
    <article className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Blog Image */}
      <div className="aspect-video overflow-hidden">
        {blog.image_url ? (
          <Image
            src={blog.image_url}
            alt={blog.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-800 dark:to-orange-800 flex items-center justify-center">
            <span className="text-amber-400 dark:text-amber-300 text-4xl">🔥</span>
          </div>
        )}
      </div>
      
      {/* Blog Content */}
      <div className="p-6">
        <div className="mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
            🔥 Popular
          </span>
        </div>
        
        <Link href={`/blog/${blog.slug}`} className="block group-hover:no-underline">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
            {blog.title}
          </h3>
        </Link>
        
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {(() => {
            try {
              const md: any = (blog as any).content_markdown
              const html = md ? (marked.parse(md) as string) : (blog.content_html || '')
              const safe = DOMPurify.sanitize(html, { 
                USE_PROFILES: { html: true },
                ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
                ALLOWED_ATTR: []
              })
              return (
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: safe }}
                />
              )
            } catch (error) {
              // Fallback to plain text if markdown parsing fails
              const content = blog.content_html || (blog as any).content_markdown || ''
              return content.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
            }
          })()}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <time dateTime={blog.published_at || undefined}>
            {blog.published_at ? new Date(blog.published_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }) : 'Draft'}
          </time>
          <Link 
            href={`/blog/${blog.slug}`}
            className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
          >
            Read →
          </Link>
        </div>
      </div>
    </article>
  )
}
