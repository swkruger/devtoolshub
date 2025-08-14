import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { Blog } from '@/lib/types/blog'

interface BlogCardProps {
  blog: Blog
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <article className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="md:w-1/3">
          <div className="relative h-48 md:h-full overflow-hidden">
            {blog.image_url ? (
              <img
                src={blog.image_url}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500 text-4xl">📝</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Content Section */}
        <div className="md:w-2/3 p-6">
          <div className="flex items-center gap-2 mb-3">
            {blog.is_featured && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Featured
              </span>
            )}
            {blog.is_popular && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                Popular
              </span>
            )}
          </div>
          
          <Link href={`/blog/${blog.slug}`} className="block group-hover:no-underline">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {blog.title}
            </h3>
          </Link>
          
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {blog.content_html.replace(/<[^>]*>/g, '').substring(0, 120)}...
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <time dateTime={blog.published_at || undefined}>
              {blog.published_at ? new Date(blog.published_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              }) : 'Draft'}
            </time>
            <span className="flex items-center gap-1">
              <span>👁️</span>
              <span>Read</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

