import { createBrowserClient } from '@supabase/ssr'

// Environment variables (these need to be set in .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Debug environment variables (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('Supabase client config:', {
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    anonKeyLength: supabaseAnonKey?.length
  })
}

// Only check in runtime, not during build
if (typeof window !== 'undefined' && (!supabaseUrl || supabaseUrl.includes('placeholder'))) {
  console.warn('Missing Supabase environment variables. Please configure your .env.local file.')
}

// Client component Supabase client (for use in Client Components)
export const createSupabaseClient = () => {
  const client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  
  // Debug client creation
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('Created Supabase browser client')
  }
  
  return client
}

// Types for database tables
export type User = {
  id: string
  email: string
  name: string
  avatar_url?: string
  plan: 'free' | 'premium'
  created_at: string
  updated_at: string
}

export type Profile = User // Alias for backward compatibility 