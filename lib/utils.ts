import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function absoluteUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}

// Environment variable validation
export function validateEnvironmentVariables() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  const missingVars = requiredVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars)
    return false
  }

  // Validate Supabase URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && !supabaseUrl.startsWith('https://') && !supabaseUrl.includes('.supabase.co')) {
    console.error('Invalid Supabase URL format:', supabaseUrl)
    return false
  }

  console.log('Environment variables validated successfully')
  return true
}

// Session debugging utility
export function debugSessionInfo(session: any, context: string) {
  if (typeof window === 'undefined') {
    console.log(`[${context}] Server-side session info:`, {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
    })
  }
}

// Comprehensive environment validation for production
export function validateProductionEnvironment() {
  const issues: string[] = []

  // Required Supabase variables
  const requiredSupabaseVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]

  requiredSupabaseVars.forEach(varName => {
    if (!process.env[varName]) {
      issues.push(`Missing required environment variable: ${varName}`)
    }
  })

  // Validate Supabase URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl) {
    try {
      const url = new URL(supabaseUrl)
      if (!url.hostname.includes('.supabase.co')) {
        issues.push('NEXT_PUBLIC_SUPABASE_URL does not appear to be a valid Supabase URL')
      }
    } catch {
      issues.push('NEXT_PUBLIC_SUPABASE_URL is not a valid URL')
    }
  }

  // Check for production-specific configurations
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.VERCEL_URL && !process.env.NEXT_PUBLIC_APP_URL) {
      issues.push('Missing VERCEL_URL or NEXT_PUBLIC_APP_URL for production')
    }
  }

  // Optional but recommended variables
  const recommendedVars = [
    'RESEND_API_KEY',
    'FROM_EMAIL',
    'ADMIN_EMAIL'
  ]

  recommendedVars.forEach(varName => {
    if (!process.env[varName]) {
      console.warn(`Recommended environment variable not set: ${varName}`)
    }
  })

  if (issues.length > 0) {
    console.error('🚨 Environment validation failed:')
    issues.forEach(issue => console.error(`  - ${issue}`))
    return false
  }

  console.log('✅ Environment validation passed')
  return true
}

/**
 * Detects if the current request is from a search engine crawler
 * @param userAgent - The User-Agent header string
 * @returns boolean indicating if it's a crawler
 */
export function isSearchEngineCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false
  
  const crawlerPatterns = [
    // Google
    /googlebot/i,
    /google-bot/i,
    /adsbot-google/i,
    /apis-google/i,
    /mediapartners-google/i,
    
    // Bing
    /bingbot/i,
    /msnbot/i,
    
    // Yahoo
    /yahoo.*slurp/i,
    /yahooseeker/i,
    
    // DuckDuckGo
    /duckduckbot/i,
    
    // Facebook
    /facebookexternalhit/i,
    /facebookcatalog/i,
    
    // Twitter
    /twitterbot/i,
    
    // LinkedIn
    /linkedinbot/i,
    
    // Pinterest
    /pinterest/i,
    
    // Yandex
    /yandex/i,
    
    // Baidu
    /baiduspider/i,
    
    // Common crawler patterns
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    
    // SEO tools
    /ahrefs/i,
    /semrush/i,
    /moz/i,
    /screaming frog/i,
    
    // Social media crawlers
    /whatsapp/i,
    /telegram/i,
    /discord/i,
    /slack/i,
  ]
  
  return crawlerPatterns.some(pattern => pattern.test(userAgent))
}

/**
 * Gets the User-Agent from request headers
 * @param headers - Request headers object
 * @returns User-Agent string or null
 */
export function getUserAgent(headers: Headers | Record<string, string>): string | null {
  if (headers instanceof Headers) {
    return headers.get('user-agent')
  }
  return headers['user-agent'] || headers['User-Agent'] || null
} 