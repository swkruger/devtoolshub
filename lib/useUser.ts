'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { createSupabaseClient } from './supabase'

// Define a type for the extended user profile
interface UserProfile extends User {
  plan?: 'free' | 'backer';
  name?: string;
  avatar_url?: string;
  stripe_customer_id?: string;
  // Add other profile fields as needed
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createSupabaseClient()

    const fetchUserAndProfile = async () => {
      try {
        console.log('useUser - Starting to fetch user data...')
        
        // First, get the current session and user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('useUser - Session:', session, 'Session error:', sessionError)
        
        if (sessionError) {
          console.error('useUser - Session error:', sessionError)
          setUser(null)
          setLoading(false)
          return
        }

        if (!session?.user) {
          console.log('useUser - No session or user found')
          setUser(null)
          setLoading(false)
          return
        }

        console.log('useUser - Found authenticated user:', session.user.id)
        
        // Set the basic user data first
        setUser(session.user as UserProfile)
        
        // Then fetch the profile data
        try {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('id, email, name, avatar_url, plan, stripe_customer_id')
            .eq('id', session.user.id)
            .single()

          console.log('useUser - Profile data:', profile, 'Profile error:', profileError)

          if (profileError) {
            console.error('useUser - Error fetching profile:', profileError)
            
            // If profile doesn't exist, try to create it
            if (profileError.code === 'PGRST116') {
              console.log('useUser - Profile not found, attempting to create...')
              try {
                const userData = {
                  id: session.user.id,
                  email: session.user.email!,
                  name: session.user.user_metadata?.name || 
                        session.user.user_metadata?.full_name || 
                        session.user.user_metadata?.preferred_username ||
                        session.user.email!.split('@')[0],
                  avatar_url: session.user.user_metadata?.avatar_url || 
                             session.user.user_metadata?.picture ||
                             session.user.user_metadata?.image,
                  plan: 'free'
                }

                const { data: newProfile, error: createError } = await supabase
                  .from('users')
                  .insert(userData)
                  .select()
                  .single()

                if (createError) {
                  console.error('useUser - Failed to create profile:', createError)
                } else if (newProfile) {
                  console.log('useUser - Created new profile:', newProfile)
                  const combinedUser = { ...session.user, ...newProfile } as UserProfile
                  setUser(combinedUser)
                }
              } catch (createError) {
                console.error('useUser - Profile creation exception:', createError)
              }
            }
            
            // Keep the basic user data if profile fetch fails
          } else if (profile) {
            // Update user with profile data
            const combinedUser = { ...session.user, ...profile } as UserProfile
            console.log('useUser - Combined user data:', combinedUser)
            setUser(combinedUser)
          }
        } catch (profileError) {
          console.error('useUser - Profile fetch exception:', profileError)
        }
      } catch (error) {
        console.error('useUser - Error in fetchUserAndProfile:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndProfile()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useUser - Auth state change:', event, session?.user?.id)
        
        if (event === 'SIGNED_OUT') {
          console.log('useUser - User signed out')
          setUser(null)
          setLoading(false)
          return
        }
        
        if (session?.user) {
          console.log('useUser - User authenticated, fetching profile...')
          
          // Set basic user data first
          setUser(session.user as UserProfile)
          
          // Fetch profile data
          try {
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('id, email, name, avatar_url, plan, stripe_customer_id')
              .eq('id', session.user.id)
              .single()

            console.log('useUser - Auth change profile data:', profile, 'Profile error:', profileError)

            if (!profileError && profile) {
              const combinedUser = { ...session.user, ...profile } as UserProfile
              console.log('useUser - Auth change combined user data:', combinedUser)
              setUser(combinedUser)
            }
          } catch (profileError) {
            console.error('useUser - Auth change profile fetch exception:', profileError)
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const isBackerUser = user?.plan === 'backer'
  
  return { user, loading, isBackerUser }
}
