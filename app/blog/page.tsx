import Link from 'next/link'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BlogList } from '@/components/blog/blog-list'
import { listFeaturedBlogs, listPopularBlogs, listPublishedBlogs } from '@/lib/services/blogs'
import { ArrowLeft } from 'lucide-react'
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

// Configure marked for consistent output
marked.setOptions({
  gfm: true,
  breaks: true
})

const PAGE_SIZE = 12

export const revalidate = 0

export default async function BlogIndexPage({ searchParams }: { searchParams?: { q?: string; page?: string } }) {
  const q = searchParams?.q?.toString() || ''
  const page = Math.max(1, Number(searchParams?.page || '1'))
  const offset = (page - 1) * PAGE_SIZE

  const [featured, popular, all] = await Promise.all([
    listFeaturedBlogs(6),
    listPopularBlogs(6),
    listPublishedBlogs({ search: q, limit: PAGE_SIZE, offset }),
  ])

  const totalPages = Math.max(1, Math.ceil(all.total / PAGE_SIZE))
  const mainFeatured = featured[0] // Get the first featured blog for the hero section

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back to Main App Link */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to DevToolsHub
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            DevToolsHub Blog
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Product updates, best practices, and tips for using DevToolsHub. Stay ahead with the latest insights and tutorials.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <form className="max-w-md mx-auto" action="/blog" method="get">
            <div className="relative">
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search articles..."
                aria-label="Search articles"
                className="w-full pl-4 pr-12 py-3 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-full focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800"
              />
              <Button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-4 py-2"
              >
                Search
              </Button>
            </div>
          </form>
        </div>

        {!q && (
          <>
            {/* Main Featured Blog - Full Width */}
            {mainFeatured && (
              <section className="mb-16">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Featured Article</h2>
                  <p className="text-gray-600 dark:text-gray-300">Our top pick for you today</p>
                </div>
                <MainFeaturedBlogCard blog={mainFeatured} />
              </section>
            )}

            <div className="space-y-16 mb-16">
              {/* Other Featured Articles */}
              {featured.length > 1 && (
                <section>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">More Featured Articles</h2>
                    <p className="text-gray-600 dark:text-gray-300">Handpicked content to get you started</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featured.slice(1).map((blog) => (
                      <FeaturedBlogCard key={blog.id} blog={blog} />
                    ))}
                  </div>
                </section>
              )}

              {/* Popular Section */}
              {popular.length > 0 && (
                <section>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Popular Posts</h2>
                    <p className="text-gray-600 dark:text-gray-300">Most read and shared articles</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {popular.map((blog) => (
                      <PopularBlogCard key={blog.id} blog={blog} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        )}

        {/* All Posts Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {q ? `Search Results for "${q}"` : 'All Articles'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {q ? `${all.total} articles found` : `${all.total} articles total`}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {all.items.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>

          {all.items.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📝</div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No articles found</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {q ? `No articles match "${q}". Try a different search term.` : 'No articles published yet.'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              {page > 1 && (
                <Link 
                  href={`/blog?q=${encodeURIComponent(q)}&page=${page - 1}`} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  ← Previous
                </Link>
              )}
              <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link 
                  href={`/blog?q=${encodeURIComponent(q)}&page=${page + 1}`} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

// Main Featured Blog Card - Full Width
function MainFeaturedBlogCard({ blog }: { blog: any }) {
  return (
    <article className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-200 dark:border-blue-800">
      <div className="flex flex-col lg:flex-row">
        {/* Image Section - Larger on desktop */}
        <div className="lg:w-1/2">
          <div className="relative h-64 lg:h-96 overflow-hidden">
            {blog.image_url ? (
              <Image
                src={blog.image_url}
                alt={blog.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800 dark:to-indigo-800 flex items-center justify-center">
                <span className="text-blue-400 dark:text-blue-300 text-6xl">⭐</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Content Section */}
        <div className="lg:w-1/2 p-8 lg:p-12">
          <div className="mb-4">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              ⭐ Featured Article
            </span>
          </div>
          
          <Link href={`/blog/${blog.slug}`} className="block group-hover:no-underline">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-3">
              {blog.title}
            </h3>
          </Link>
          
          <div className="text-lg text-gray-600 dark:text-gray-300 mb-6 line-clamp-4 prose dark:prose-invert max-w-none">
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
                    dangerouslySetInnerHTML={{ __html: safe }}
                  />
                )
              } catch (error) {
                // Fallback to plain text if markdown parsing fails
                const content = blog.content_html || (blog as any).content_markdown || ''
                return content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
              }
            })()}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <time dateTime={blog.published_at || undefined}>
              {blog.published_at ? new Date(blog.published_at).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              }) : 'Draft'}
            </time>
            <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
              <span>Read Article</span>
              <span>→</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

// Enhanced Blog Card Components - Using Landing Page Style
function BlogCard({ blog }: { blog: any }) {
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
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500 text-4xl">📝</span>
          </div>
        )}
      </div>
      
      {/* Blog Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          {blog.is_featured && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              ⭐ Featured
            </span>
          )}
          {blog.is_popular && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
              🔥 Popular
            </span>
          )}
        </div>
        
        <Link href={`/blog/${blog.slug}`} className="block group-hover:no-underline">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {blog.title}
          </h3>
        </Link>
        
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 prose dark:prose-invert max-w-none">
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
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Read →
          </Link>
        </div>
      </div>
    </article>
  )
}

function FeaturedBlogCard({ blog }: { blog: any }) {
  return (
    <article className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-blue-200 dark:border-blue-800">
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="md:w-1/3">
          <div className="relative h-48 md:h-full overflow-hidden">
            {blog.image_url ? (
              <Image
                src={blog.image_url}
                alt={blog.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800 dark:to-indigo-800 flex items-center justify-center">
                <span className="text-blue-400 dark:text-blue-300 text-4xl">⭐</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Content Section */}
        <div className="md:w-2/3 p-6">
          <div className="mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              ⭐ Featured
            </span>
          </div>
          
          <Link href={`/blog/${blog.slug}`} className="block group-hover:no-underline">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {blog.title}
            </h3>
          </Link>
          
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 prose dark:prose-invert max-w-none">
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
                    dangerouslySetInnerHTML={{ __html: safe }}
                  />
                )
              } catch (error) {
                // Fallback to plain text if markdown parsing fails
                const content = blog.content_html || (blog as any).content_markdown || ''
                return content.replace(/<[^>]*>/g, '').substring(0, 120) + '...'
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
            <span className="flex items-center gap-1">
              <span>🔥</span>
              <span>Featured</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

function PopularBlogCard({ blog }: { blog: any }) {
  return (
    <article className="group bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-amber-200 dark:border-amber-800">
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
        
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 prose dark:prose-invert max-w-none">
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

