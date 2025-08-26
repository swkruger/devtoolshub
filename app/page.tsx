import { authServer } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAllTools } from '@/lib/tools'
import type { Metadata } from 'next'
import { listFeaturedBlogs, listPopularBlogs } from '@/lib/services/blogs'
import { HomePageClient } from '@/components/shared/home-page-client'
import { headers } from 'next/headers'
import { isSearchEngineCrawler, getUserAgent } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'DevToolsHub – Essential Developer Tools',
  description:
    'All-in-one developer toolkit: JSON formatter, regex tester, JWT decoder/encoder, Base64 utilities, UUID generator, timestamp converter, XPath/CSS selector tester, image compressor, world clock, and more.',
  robots: { 
    index: true, 
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: { canonical: '/' },
  openGraph: {
    title: 'DevToolsHub – Essential Developer Tools',
    description: 'All-in-one developer toolkit: JSON formatter, regex tester, JWT decoder/encoder, Base64 utilities, UUID generator, timestamp converter, XPath/CSS selector tester, image compressor, world clock, and more.',
    url: '/',
    siteName: 'DevToolsHub',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DevToolsHub - Developer Tools Collection',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevToolsHub – Essential Developer Tools',
    description: 'All-in-one developer toolkit: JSON formatter, regex tester, JWT decoder/encoder, Base64 utilities, UUID generator, timestamp converter, XPath/CSS selector tester, image compressor, world clock, and more.',
    images: ['/og-image.png'],
  },
}

export default async function HomePage() {
  // Check if this is a search engine crawler
  const headersList = headers()
  const userAgent = getUserAgent(headersList)
  const isCrawler = isSearchEngineCrawler(userAgent)

  // Check if user is already authenticated (only during request time, not build time)
  // BUT allow crawlers to access the home page content regardless of auth status
  let user = null
  try {
    user = await authServer.getUser()
  } catch (error) {
    // During build time or when cookies can't be set, authServer.getUser() will fail
    // This is expected and we can safely ignore it for the landing page
    console.log('Auth check failed (likely during build time or cookie restrictions):', error)
  }

  // Only redirect authenticated users who are NOT crawlers
  if (user && !isCrawler) {
    redirect('/dashboard')
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