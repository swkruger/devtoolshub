import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import SessionTracker from '@/components/SessionTracker'
import { SignInModalProvider } from '@/lib/use-sign-in-modal'
import { SignInModalWrapper } from '@/components/auth/sign-in-modal-wrapper'
import { getMetadataApplicationName } from '@/lib/app-config'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://devtoolshub.vercel.app'),
  title: {
    default: `${getMetadataApplicationName()} - Essential Developer Tools Collection`,
    template: `%s | ${getMetadataApplicationName()}`
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
  authors: [{ name: `${getMetadataApplicationName()} Team` }],
  creator: getMetadataApplicationName(),
  publisher: getMetadataApplicationName(),
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
    siteName: getMetadataApplicationName(),
    title: `${getMetadataApplicationName()} - Essential Developer Tools Collection`,
    description: 'Your all-in-one developer toolkit. Format JSON, test regex patterns, decode JWTs, and more. All tools are free forever, no ads. Support the project to unlock advanced features.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${getMetadataApplicationName()} - Developer Tools Collection`,
      }
    ],
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: `${getMetadataApplicationName()} - Essential Developer Tools Collection`,
    description: 'Your all-in-one developer toolkit. Format JSON, test regex patterns, decode JWTs, and more.',
    images: ['/twitter-image.png'],
    creator: '@devtoolshub',
    site: '@devtoolshub',
  },
  
  // App-specific
  applicationName: getMetadataApplicationName(),
  category: 'Developer Tools',
  
  // Additional meta tags
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': getMetadataApplicationName(),
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
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://devtoolshub.vercel.app'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: getMetadataApplicationName(),
    description:
      'DevToolsHub is a professional suite of web developer tools: JSON formatter, regex tester, JWT decoder/encoder, Base64 utilities, UUID generator, timestamp converter, XPath/CSS selector tester, image compressor, world clock, password/key generator, and PWA asset generator.',
    url: siteUrl,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    author: {
      '@type': 'Organization',
      name: getMetadataApplicationName(),
    },
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString(),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    featureList: [
      'JSON Formatter & Validator',
      'Regex Pattern Tester',
      'JWT Decoder/Encoder & Signature Verification',
      'Base64 Encoder/Decoder (text & files)',
      'UUID Generator (v1/v3/v4/v5)',
      'Timestamp Converter with timezones',
      'XPath & CSS Selector Tester',
      'Image Compressor & format conversion',
      'World Clock & Time Zones',
      'Password & Key‑like Generator',
      'PWA Assets & Manifest Generator',
    ],
    screenshot: `${siteUrl}/screenshot.png`,
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
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
             <body className={inter.className}>
         <SignInModalProvider>
           {children}
           <SignInModalWrapper />
           <SessionTracker />
           <Toaster position="top-right" richColors />
         </SignInModalProvider>
       </body>
    </html>
  )
} 