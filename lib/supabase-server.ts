import { createServerClient } from '@supabase/ssr'

// Environment variables (these need to be set in .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Server component Supabase client (for use in Server Components)
export const createSupabaseServerClient = () => {
  // Import cookies only in server components
  const { cookies } = require('next/headers')
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookies().get(name)?.value
      },
    },
  })
} 