import { createBrowserClient } from '@supabase/ssr'

// Environment variables (these need to be set in .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Only check in runtime, not during build
if (typeof window !== 'undefined' && supabaseUrl.includes('placeholder')) {
  console.warn('Missing Supabase environment variables. Please configure your .env.local file.')
}

// Client component Supabase client (for use in Client Components)
export const createSupabaseClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
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