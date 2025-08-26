"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getAllTools } from '@/lib/tools'
import { BookOpen, ArrowRight } from 'lucide-react'
import { BlogPreviewRenderer, FeaturedBlogPreviewRenderer } from '@/components/blog/blog-content-renderer'
import { authClient } from '@/lib/auth'
import { PricingSection } from './pricing-section'
import { marked } from 'marked'

// Configure marked for consistent output
marked.setOptions({
  gfm: true,
  breaks: true
})

interface HomePageClientProps {
  featuredBlogs: any[]
  popularBlogs: any[]
  availableCount: number
}

export function HomePageClient({ featuredBlogs, popularBlogs, availableCount }: HomePageClientProps) {
  const router = useRouter()

  useEffect(() => {
    // Check if user just signed out and needs to be forced to re-authenticate
    // Only redirect if the user is actually authenticated (has a session)
    const checkAuthAndRedirect = async () => {
      try {
        const session = await authClient.getSession()
        const forceReauth = localStorage.getItem('force_reauth')
        
        // Only redirect if user has a session AND the force_reauth flag is set
        if (session?.user && forceReauth === 'true') {
          // Clear the flag and redirect to sign-in with force_reauth parameter
          localStorage.removeItem('force_reauth')
          router.push('/sign-in?force_reauth=true')
        } else if (forceReauth === 'true') {
          // If flag is set but no session, just clear the flag (user already signed out)
          localStorage.removeItem('force_reauth')
        }
      } catch (error) {
        // If auth check fails, just clear the flag to be safe
        const forceReauth = localStorage.getItem('force_reauth')
        if (forceReauth === 'true') {
          localStorage.removeItem('force_reauth')
        }
      }
    }

    checkAuthAndRedirect()
  }, [router])

  const tools = getAllTools()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Image
                src="/icons/icon-192x192.png"
                alt="DevToolsHub icon"
                className="w-10 h-10 rounded-lg object-contain bg-white"
                width={40}
                height={40}
              />
              <h1 className="text-2xl font-bold text-gray-900">DevToolsHub</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link 
                href="/blog" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Blog
              </Link>
              <Link 
                href="#pricing" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </Link>
              <Link 
                href="https://github.com/swkruger/devtoolshub" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </Link>
              <Link 
                href="/sign-in" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

             {/* Hero Section */}
       <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
         <div className="max-w-7xl mx-auto">
           <div className="text-center mb-16">
             <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
               Essential Developer Tools
               <span className="block text-blue-600">All in One Place</span>
             </h1>
             <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
               Streamline your development workflow with our comprehensive suite of essential tools. 
               {availableCount} powerful tools available now, with more coming soon. Everything you need to code faster and better.
             </p>
             <div className="flex justify-center">
               <Link 
                 href="/sign-in" 
                 className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
               >
                 Start Building Now
               </Link>
             </div>
           </div>
         </div>
       </section>

      {/* Tools Showcase */}
      <section id="tools" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 id="tools" className="text-4xl font-bold text-gray-900 mb-4">
              Professional Developer Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for modern web development, API testing, and data manipulation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map(tool => (
              <div key={tool.id} className="relative">
                <Link href={tool.path} className="group block">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-blue-300">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <tool.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{tool.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-green-600 font-medium">✅ Available</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{tool.shortDescription}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      {tool.tags.slice(0,4).map(tag => (
                        <span key={tag} className="px-2 py-1 rounded bg-gray-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                </Link>
                <Link
                  href={`/docs/${tool.id}`}
                  aria-label={`Open ${tool.name} docs`}
                  className="absolute top-3 right-3 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Open docs"
                >
                  <BookOpen className="w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
          
          
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection id="pricing" />

      {/* Featured Blog Section */}
      {featuredBlogs.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Featured Article
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Latest insights and updates from DevToolsHub
              </p>
            </div>
            
                         <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
               {/* Featured Blog Image */}
               <div className="order-1 lg:order-1">
                                   <div className="aspect-video rounded-l-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                   {featuredBlogs[0].image_url ? (
                     <Image
                       src={featuredBlogs[0].image_url}
                       alt={featuredBlogs[0].title}
                       width={800}
                       height={400}
                       className="w-full h-full object-cover"
                     />
                   ) : (
                     <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800 dark:to-indigo-800 flex items-center justify-center">
                       <span className="text-blue-400 dark:text-blue-300 text-6xl">⭐</span>
                     </div>
                   )}
                 </div>
               </div>
               
               {/* Featured Blog Content */}
               <div className="order-2 lg:order-2">
                                   <div className="bg-white dark:bg-gray-800 rounded-r-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                   <div className="mb-4">
                     <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                       ⭐ Featured Article
                     </span>
                   </div>
                   
                   <Link href={`/blog/${featuredBlogs[0].slug}`} className="block group">
                     <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-3">
                       {featuredBlogs[0].title}
                     </h3>
                   </Link>
                   
                   <div className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                     <FeaturedBlogPreviewRenderer
                       content={featuredBlogs[0].content_html || featuredBlogs[0].content_markdown || ''}
                       isMarkdown={Boolean(featuredBlogs[0].content_markdown)}
                     />
                   </div>
                   
                   <div className="flex items-center justify-between">
                     <time className="text-sm text-gray-500 dark:text-gray-400">
                       {featuredBlogs[0].published_at ? new Date(featuredBlogs[0].published_at).toLocaleDateString('en-US', { 
                         month: 'long', 
                         day: 'numeric',
                         year: 'numeric'
                       }) : 'Draft'}
                     </time>
                     <Link 
                       href={`/blog/${featuredBlogs[0].slug}`}
                       className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                     >
                       Read Article
                       <ArrowRight className="h-4 w-4" />
                     </Link>
                   </div>
                 </div>
               </div>
             </div>
            
            <div className="text-center mt-8">
              <Link 
                href="/blog" 
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                View All Articles
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Popular Blogs Section */}
      {popularBlogs.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Popular Articles
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Most read and shared content from our blog
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularBlogs.map((blog) => (
                <article key={blog.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
                  {/* Blog Image */}
                  <div className="aspect-video overflow-hidden">
                    {blog.image_url ? (
                      <Image
                        src={blog.image_url}
                        alt={blog.title}
                        width={800}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                      <BlogPreviewRenderer
                        content={blog.content_html || (blog as any).content_markdown || ''}
                        isMarkdown={Boolean((blog as any).content_markdown)}
                      />
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
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link 
                href="/blog" 
                className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors"
              >
                Explore All Articles
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Supercharge Your Development?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of developers who trust DevToolsHub for their daily development needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/sign-in" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Get Started
            </Link>            
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="DevToolsHub icon"
                  className="w-8 h-8 rounded-lg object-contain bg-white"
                  width={32}
                  height={32}
                />
                <span className="text-xl font-bold">DevToolsHub</span>
              </div>
              <p className="text-gray-400">
                Essential developer tools for modern web development.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Available Tools</h3>
              <ul className="space-y-2 text-gray-400">
                {tools.map(tool => (
                  <li key={tool.id}><Link href={tool.path} className="hover:text-white transition-colors">{tool.name}</Link></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="https://github.com/swkruger/devtoolshub" className="hover:text-white transition-colors">GitHub</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/feedback" className="hover:text-white transition-colors">Feedback</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 DevToolsHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
