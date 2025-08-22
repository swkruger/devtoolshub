import { createServerClient } from '@supabase/ssr'

// Environment variables (these need to be set in .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Server component Supabase client (for use in Server Components)
export const createSupabaseServerClient = () => {
  // Simplified approach for better production reliability
  // Always try to use cookies in server environment, but gracefully handle failures

  // Check if we're in a server environment (not browser)
  const isServer = typeof window === 'undefined'

  if (!isServer) {
    // Client-side usage - this shouldn't happen in server components
    console.warn('createSupabaseServerClient called on client side')
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get() { return undefined },
        set() { /* no-op */ },
        remove() { /* no-op */ },
      },
    })
  }

  // Server-side - always try to use cookies
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
          }
        },
        remove(name: string, options: any) {
          try {
            const cookieStore = cookies()
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            console.warn(`Failed to remove cookie ${name}:`, error)
          }
        },
      },
    })
  } catch (error) {
    console.error('Failed to import next/headers:', error)
    // Fallback client without cookies
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get() { return undefined },
        set() { /* no-op */ },
        remove() { /* no-op */ },
      },
    })
  }
} 