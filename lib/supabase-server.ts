import { createServerClient } from '@supabase/ssr'

// Environment variables (these need to be set in .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Server component Supabase client (for use in Server Components)
export const createSupabaseServerClient = () => {
  // Check if we're in a static generation context (build time)
  // This is a more precise check for build vs runtime
  const isStaticGeneration = process.env.NEXT_PHASE === 'phase-production-build' || 
                            process.env.NODE_ENV === 'production' && !global.navigator
  
  if (isStaticGeneration) {
    // During build time, return a minimal client without cookies
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get() {
          return undefined
        },
        set() {
          // No-op during build
        },
        remove() {
          // No-op during build
        },
      },
    })
  }

  // Try to import cookies, but handle gracefully if not available
  try {
    const { cookies } = require('next/headers')
    
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          try {
            const cookieStore = cookies()
            const cookie = cookieStore.get(name)
            return cookie?.value
          } catch (error) {
            console.warn(`Failed to get cookie ${name}:`, error)
            return undefined
          }
        },
        set(name: string, value: string, options: any) {
          try {
            const cookieStore = cookies()
            cookieStore.set(name, value, options)
          } catch (error) {
            console.warn(`Failed to set cookie ${name}:`, error)
            // Silently fail if cookies can't be set
          }
        },
        remove(name: string, options: any) {
          try {
            const cookieStore = cookies()
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            console.warn(`Failed to remove cookie ${name}:`, error)
            // Silently fail if cookies can't be removed
          }
        },
      },
    })
  } catch (error) {
    console.warn('Failed to import next/headers, using fallback client:', error)
    // Fallback client without cookies if next/headers is not available
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get() { return undefined },
        set() { /* no-op */ },
        remove() { /* no-op */ },
      },
    })
  }
} 