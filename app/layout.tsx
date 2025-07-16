import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://devtoolshub.vercel.app'),
  title: {
    default: 'DevToolsHub - Essential Developer Tools Collection',
    template: '%s | DevToolsHub'
  },
  description: 'Your all-in-one developer toolkit. Format JSON, test regex patterns, decode JWTs, compress images, and more. Free developer tools with premium features.',
  keywords: [
    'developer tools',
    'json formatter',
    'regex tester',
    'jwt decoder',
    'base64 encoder',
    'uuid generator',
    'timestamp converter',
    'xpath tester',
    'image compressor',
    'web development',
    'programming utilities',
    'code tools',
    'dev toolkit'
  ],
  authors: [{ name: 'DevToolsHub Team' }],
  creator: 'DevToolsHub',
  publisher: 'DevToolsHub',
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
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'DevToolsHub',
    title: 'DevToolsHub - Essential Developer Tools Collection',
    description: 'Your all-in-one developer toolkit. Format JSON, test regex patterns, decode JWTs, and more. Free tools with premium features.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DevToolsHub - Developer Tools Collection',
      }
    ],
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'DevToolsHub - Essential Developer Tools Collection',
    description: 'Your all-in-one developer toolkit. Format JSON, test regex patterns, decode JWTs, and more.',
    images: ['/twitter-image.png'],
    creator: '@devtoolshub',
    site: '@devtoolshub',
  },
  
  // App-specific
  applicationName: 'DevToolsHub',
  category: 'Developer Tools',
  
  // Additional meta tags
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'DevToolsHub',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
  
  // Verification tags (add when you have them)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DevToolsHub',
    description: 'Your all-in-one developer toolkit. Format JSON, test regex patterns, decode JWTs, compress images, and more. Free developer tools with premium features.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://devtoolshub.vercel.app',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      priceValidUntil: '2025-12-31',
      availability: 'https://schema.org/InStock',
    },
    author: {
      '@type': 'Organization',
      name: 'DevToolsHub Team',
      email: 'devtoolshub8@gmail.com',
    },
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString(),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    featureList: [
      'JSON Formatter & Validator',
      'Regex Pattern Tester',
      'JWT Token Decoder',
      'Base64 Encoder/Decoder',
      'UUID Generator',
      'Timestamp Converter',
      'XPath & CSS Selector Tester',
      'Image Compressor',
    ],
    screenshot: '/screenshot.png',
    softwareVersion: '1.0.0',
    permissions: 'No special permissions required',
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_APP_URL || 'https://devtoolshub.vercel.app'} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
} 