import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAllTools } from "@/lib/tools"
import { listFeaturedBlogs, listPopularBlogs } from "@/lib/services/blogs"
import { BlogCard } from "@/components/blog/blog-card"
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'
import ToolsBrowser from "./ToolsBrowser"
import { getChangelog } from "@/lib/changelog"
import { authServer } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Dashboard – DevToolsHub',
  description: 'Browse and launch DevToolsHub tools from your dashboard. JSON, RegEx, JWT, Base64, UUID, timestamps, XPath/CSS, images, and more.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/dashboard' },
}
import Link from "next/link"

const tools = getAllTools()

export default async function DashboardPage() {
  // Get the current user and their profile
  const user = await authServer.getUser()
  const supabase = createSupabaseServerClient()
  const { data: profile } = await supabase
    .from('users')
    .select('id, email, name, avatar_url, plan, stripe_customer_id')
    .eq('id', user?.id)
    .single()
  
  const isPremiumUser = profile?.plan === 'premium'
  
  const [featuredBlogs, popularBlogs] = await Promise.all([
    listFeaturedBlogs(6),
    listPopularBlogs(6),
  ])
  const changelog = getChangelog()
  const latest = changelog[0]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Developer Tools</h1>
        <p className="text-muted-foreground">
          Choose from our collection of developer utilities
        </p>
      </div>

      <ToolsBrowser
        initialTools={tools.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          emoji: t.emoji,
          isPremium: t.isPremium,
          category: t.category,
          tags: t.tags,
          path: t.path,
          shortDescription: t.shortDescription,
        }))}
      />

      {/* What's New / Changelog */}
      {latest && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What’s New</CardTitle>
              <CardDescription>{latest.date} – {latest.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                {latest.items.slice(0, 3).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link href="/changelog">View full changelog</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {(featuredBlogs.length > 0 || popularBlogs.length > 0) && (
        <div className="mt-12 space-y-16">
          {featuredBlogs.length > 0 && (
            <>
              <section className="mb-16">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Featured Article</h2>
                  <p className="text-gray-600 dark:text-gray-300">Our top pick for you today</p>
                </div>
                <MainFeaturedBlogCard blog={featuredBlogs[0] as any} />
              </section>

              {featuredBlogs.length > 1 && (
                <section>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">More Featured Articles</h2>
                    <p className="text-gray-600 dark:text-gray-300">Handpicked content to get you started</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredBlogs.slice(1).map((blog) => (
                      <BlogCard key={blog.id} blog={blog as any} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {popularBlogs.length > 0 && (
            <section>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Popular Posts</h2>
                <p className="text-gray-600 dark:text-gray-300">Most read and shared articles</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {popularBlogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog as any} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {(featuredBlogs.length > 0 || popularBlogs.length > 0) && (
        <div className="text-center mt-8">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors"
          >
            Explore All Articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {!isPremiumUser && (
        <div className="mt-12 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>🚀 Go Premium</CardTitle>
              <CardDescription>
                Unlock advanced features and remove limitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/go-premium">
                  Upgrade Now
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 

function MainFeaturedBlogCard({ blog }: { blog: any }) {
  return (
    <article className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-200 dark:border-blue-800">
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-1/2">
          <div className="relative h-64 lg:h-96 overflow-hidden">
            {blog.image_url ? (
              <img
                src={blog.image_url}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800 dark:to-indigo-800 flex items-center justify-center">
                <span className="text-blue-400 dark:text-blue-300 text-6xl">⭐</span>
              </div>
            )}
          </div>
        </div>
        <div className="lg:w-1/2 p-8 lg:p-12">
          <div className="mb-4">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              ⭐ Featured Article
            </span>
          </div>
          <a href={`/blog/${blog.slug}`} className="block group-hover:no-underline">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-3">
              {blog.title}
            </h3>
          </a>
          <div className="text-lg text-gray-600 dark:text-gray-300 mb-6 line-clamp-4 prose dark:prose-invert max-w-none">
            {(() => {
              try {
                const md: any = blog.content_markdown
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
                const content = blog.content_html || blog.content_markdown || ''
                return content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
              }
            })()}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <time dateTime={blog.published_at || undefined}>
              {blog.published_at ? new Date(blog.published_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
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