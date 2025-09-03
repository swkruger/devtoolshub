import { authServer } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAllTools } from '@/lib/tools'
import type { Metadata } from 'next'
import { listFeaturedBlogs, listPopularBlogs } from '@/lib/services/blogs'
import { HomePageClient } from '@/components/shared/home-page-client'
import { headers } from 'next/headers'
import { isSearchEngineCrawler, getUserAgent } from '@/lib/utils'
import { getMetadataApplicationName } from '@/lib/app-config'

export const metadata: Metadata = {
  title: `${getMetadataApplicationName()} – Essential Developer Tools`,
  description:
    'All-in-one developer toolkit with 11 powerful tools: JSON formatter, regex tester, JWT decoder/encoder, Base64 encoder/decoder, UUID generator, timestamp converter, XPath/CSS selector tester, image compressor, world clock, password generator, and PWA assets generator. All tools are free forever, no ads. Support the project to unlock advanced features.',
  keywords: [
    'dev tools',
    'devtools',
    'dev tools hub',
    'dev tools kit',
    'dev tools free',
    'developer tools',
    'web development tools',
    'JSON formatter',
    'regex tester',
    'JWT decoder',
    'JWT encoder',
    'Base64 encoder',
    'Base64 decoder',
    'UUID generator',
    'timestamp converter',
    'XPath tester',
    'CSS selector tester',
    'image compressor',
    'world clock',
    'timezone converter',
    'password generator',
    'PWA assets generator',
    'manifest.json generator',
    'online tools',
    'web utilities',
    'developer utilities',
    'coding tools',
    'programming tools',
    'web scraping tools',
    'security tools',
    'image optimization',
    'time conversion',
    'data encoding',
    'web development',
    'frontend tools',
    'backend tools',
    'API testing',
    'HTML testing',
    'CSS testing',
    'JavaScript tools',
    'free developer tools',
    'online JSON formatter',
    'online regex tester',
    'online JWT decoder',
    'online image compressor',
    'online UUID generator',
    'online timestamp converter',
    'online XPath tester',
    'online password generator',
    'online PWA generator'
  ].join(', '),
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
      title: `${getMetadataApplicationName()} – Essential Developer Tools`,
      description: 'All-in-one developer toolkit with 11 powerful tools: JSON formatter, regex tester, JWT decoder/encoder, Base64 encoder/decoder, UUID generator, timestamp converter, XPath/CSS selector tester, image compressor, world clock, password generator, and PWA assets generator. All tools are free forever, no ads. Support the project to unlock advanced features.',
    url: '/',
    siteName: getMetadataApplicationName(),
    type: 'website',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: `${getMetadataApplicationName()} - Developer Tools Collection`,
      }
    ],
  },
      twitter: {
      card: 'summary_large_image',
      title: `${getMetadataApplicationName()} – Essential Developer Tools`,
      description: 'All-in-one developer toolkit with 11 powerful tools: JSON formatter, regex tester, JWT decoder/encoder, Base64 encoder/decoder, UUID generator, timestamp converter, XPath/CSS selector tester, image compressor, world clock, password generator, and PWA assets generator. All tools are free forever, no ads. Support the project to unlock advanced features.',
    images: ['/icons/icon-512x512.png'],
  },
}

export default async function HomePage() {
  // Check if this is a search engine crawler
  const headersList = headers()
  const userAgent = getUserAgent(headersList)
  const isCrawler = isSearchEngineCrawler(userAgent)

  // For crawlers, always serve the home page content regardless of auth status
  if (isCrawler) {
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

  // For non-crawlers, check authentication and redirect if needed
  let user = null
  try {
    user = await authServer.getUser()
  } catch (error) {
    // During build time or when cookies can't be set, authServer.getUser() will fail
    // This is expected and we can safely ignore it for the landing page
    console.log('Auth check failed (likely during build time or cookie restrictions):', error)
  }

  // Redirect authenticated users to dashboard
  if (user) {
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