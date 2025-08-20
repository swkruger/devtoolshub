import { authServer } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAllTools } from '@/lib/tools'
import type { Metadata } from 'next'
import { listFeaturedBlogs, listPopularBlogs } from '@/lib/services/blogs'
import { HomePageClient } from '@/components/shared/home-page-client'

export const metadata: Metadata = {
  title: 'DevToolsHub – Essential Developer Tools',
  description:
    'All-in-one developer toolkit: JSON formatter, regex tester, JWT decoder/encoder, Base64 utilities, UUID generator, timestamp converter, XPath/CSS selector tester, image compressor, world clock, and more.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  // Check if user is already authenticated (only during request time, not build time)
  try {
    const user = await authServer.getUser()
    if (user) {
      redirect('/dashboard')
    }
  } catch (error) {
    // During build time, authServer.getUser() will fail because there's no request context
    // This is expected and we can safely ignore it for the landing page
    console.log('No request context available (likely during build time)')
  }

  const tools = getAllTools()
  const availableCount = tools.length

  // Fetch blog data
  let featuredBlogs: any[] = []
  let popularBlogs: any[] = []
  
  try {
    [featuredBlogs, popularBlogs] = await Promise.all([
      listFeaturedBlogs(1), // Get just the main featured blog
      listPopularBlogs(3),  // Get 3 popular blogs
    ])
  } catch (error) {
    console.log('Could not fetch blog data:', error)
  }

  return (
    <HomePageClient 
      featuredBlogs={featuredBlogs}
      popularBlogs={popularBlogs}
      availableCount={availableCount}
    />
  )
} 