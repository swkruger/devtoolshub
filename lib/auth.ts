import { createSupabaseClient, type User } from './supabase'
import { createSupabaseServerClient } from './supabase-server'
import { redirect } from 'next/navigation'
import { sendNewUserNotification, sendWelcomeEmail } from '@/lib/email'

// Client-side auth functions
export const authClient = {
  // Sign in with OAuth provider
  async signInWithOAuth(provider: 'google' | 'github') {
    const supabase = createSupabaseClient()
    
    const redirectTo = `${window.location.origin}/auth/callback`
    console.log('Starting OAuth sign-in with:', { provider, redirectTo })
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    })

    console.log('OAuth sign-in result:', { data, error })

    if (error) {
      throw new Error(`Failed to sign in with ${provider}: ${error.message}`)
    }

    return data
  },

  // Sign out
  async signOut() {
    console.log('Starting sign out process...')
    const supabase = createSupabaseClient()
    
    const { error } = await supabase.auth.signOut()
    
    console.log('Sign out result:', { error: error?.message || 'No error' })
    
    if (error) {
      throw new Error(`Failed to sign out: ${error.message}`)
    }
    
    console.log('Sign out completed successfully')
  },

  // Get current session
  async getSession() {
    const supabase = createSupabaseClient()
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw new Error(`Failed to get session: ${error.message}`)
    }

    return session
  },

  // Get current user
  async getUser() {
    const supabase = createSupabaseClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      throw new Error(`Failed to get user: ${error.message}`)
    }

    return user
  },

  // Get user profile from our users table
  async getUserProfile(userId: string): Promise<User | null> {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found
        return null
      }
      throw new Error(`Failed to get user profile: ${error.message}`)
    }

    return data
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<User>) {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`)
    }

    return data
  },

  // Sync user profile from auth user data (called after OAuth)
  async syncUserProfile() {
    const supabase = createSupabaseClient()
    
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        console.error('Failed to get auth user for profile sync:', authError)
        return null
      }

      console.log('🔄 Syncing profile for:', authUser.email)
      console.log('📊 User metadata:', {
        name: authUser.user_metadata?.name,
        full_name: authUser.user_metadata?.full_name,
        avatar_url: authUser.user_metadata?.avatar_url,
        picture: authUser.user_metadata?.picture
      })

      // Check if this is a new user (profile doesn't exist yet)
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id, created_at')
        .eq('id', authUser.id)
        .single()

      const isNewUser = !existingProfile

      // Extract user data from auth user
      const userData = {
        email: authUser.email!,
        name: authUser.user_metadata?.name || 
              authUser.user_metadata?.full_name || 
              authUser.user_metadata?.preferred_username ||
              authUser.email!.split('@')[0],
        avatar_url: authUser.user_metadata?.avatar_url || 
                   authUser.user_metadata?.picture ||
                   authUser.user_metadata?.image,
        updated_at: new Date().toISOString()
      }

      console.log('💾 Updating profile with:', {
        name: userData.name,
        avatar_url: userData.avatar_url,
        isNewUser
      })

      // Update user profile (RLS allows this since we have proper session)
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', authUser.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Profile sync failed:', error.message)
        return null
      }

      console.log('✅ Profile synced successfully!')
      console.log('👤 Updated profile:', {
        name: data.name,
        avatar_url: data.avatar_url
      })

      // Send email notifications for new users
      if (isNewUser && data) {
        console.log('🎉 New user detected, sending notifications...')
        
        // Determine signup method from auth provider
        const signupMethod = authUser.app_metadata?.provider === 'google' ? 'google' : 'github'
        
        const newUserData = {
          id: data.id,
          email: data.email,
          name: data.name,
          avatar_url: data.avatar_url,
          plan: data.plan || 'free',
          created_at: data.created_at || new Date().toISOString(),
          signup_method: signupMethod as 'google' | 'github'
        }

        // Send notification to admin (don't await to avoid slowing down signup)
        sendNewUserNotification(newUserData).catch(error => {
          console.error('Failed to send new user notification:', error)
        })

        // Send welcome email to user (optional, also don't await)
        sendWelcomeEmail(newUserData).catch(error => {
          console.error('Failed to send welcome email:', error)
        })
      }

      return data

    } catch (error) {
      console.error('🚨 Error during profile sync:', error)
      return null
    }
  }
}

// Server-side auth functions
export const authServer = {
  // Get current user from server components
  async getUser() {
    const supabase = createSupabaseServerClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return null
    }

    return user
  },

  // Get user profile from server components
  async getUserProfile(userId?: string): Promise<User | null> {
    const supabase = createSupabaseServerClient()
    
    // If no userId provided, get current user first
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      userId = user.id
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      return null
    }

    return data
  },

  // Require authentication (for server components)
  async requireAuth(): Promise<User> {
    const user = await this.getUser()
    
    if (!user) {
      redirect('/sign-in')
    }
    
    const profile = await this.getUserProfile(user.id)
    
    if (!profile) {
      redirect('/sign-in')
    }

    return profile
  },

  // Check if user has premium plan
  async isPremiumUser(userId?: string): Promise<boolean> {
    const profile = await this.getUserProfile(userId)
    return profile?.plan === 'premium'
  },

  // Check if user is admin (users.is_admin)
  async isAdmin(userId?: string): Promise<boolean> {
    const supabase = createSupabaseServerClient()
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false
      userId = user.id
    }
    const { data } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single()
    return Boolean(data?.is_admin)
  }
}

// Utility functions
export const authUtils = {
  // Generate user initials from name or email
  getInitials(name?: string, email?: string): string {
    if (name) {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    
    if (email) {
      return email[0].toUpperCase()
    }
    
    return 'U'
  },

  // Format user display name
  getDisplayName(user: User): string {
    return user.name || user.email.split('@')[0]
  }
} 