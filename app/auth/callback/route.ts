import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { sendNewUserNotification, sendWelcomeEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    const signInUrl = new URL('/sign-in', requestUrl.origin)
    signInUrl.searchParams.set('error', error)
    if (errorDescription) {
      signInUrl.searchParams.set('error_description', errorDescription)
    }
    return NextResponse.redirect(signInUrl)
  }

  // Validate code parameter
  if (!code) {
    const signInUrl = new URL('/sign-in', requestUrl.origin)
    signInUrl.searchParams.set('error', 'missing_code')
    signInUrl.searchParams.set('error_description', 'No authorization code provided')
    return NextResponse.redirect(signInUrl)
  }

  try {
    // Create Supabase client
    const supabase = createSupabaseServerClient()

    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      const signInUrl = new URL('/sign-in', requestUrl.origin)
      signInUrl.searchParams.set('error', 'exchange_error')
      signInUrl.searchParams.set('error_description', exchangeError.message)
      return NextResponse.redirect(signInUrl)
    }

    // Ensure user profile exists (in case trigger didn't work)
    if (data.session?.user) {
      try {
        const { data: existingProfile } = await supabase
          .from('users')
          .select('id, created_at, email, name, avatar_url')
          .eq('id', data.session.user.id)
          .single()

        if (!existingProfile) {
          // Profile doesn't exist, create it manually
          const userData = {
            id: data.session.user.id,
            email: data.session.user.email!,
            name: data.session.user.user_metadata?.name || 
                  data.session.user.user_metadata?.full_name || 
                  data.session.user.user_metadata?.preferred_username ||
                  data.session.user.email!.split('@')[0],
            avatar_url: data.session.user.user_metadata?.avatar_url || 
                       data.session.user.user_metadata?.picture ||
                       data.session.user.user_metadata?.image,
            plan: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          const { error: insertError } = await supabase
            .from('users')
            .insert(userData)

          if (insertError) {
            console.error('Failed to create user profile:', insertError)
          } else {
            // Profile created successfully, send welcome emails
            console.log('New user profile created, sending welcome emails...')
            
            // Determine signup method from auth provider
            const signupMethod = data.session.user.app_metadata?.provider === 'google' ? 'google' : 'github'
            
            const emailUserData = {
              id: data.session.user.id,
              email: data.session.user.email!,
              name: userData.name,
              avatar_url: userData.avatar_url,
              signup_method: signupMethod as 'google' | 'github',
              created_at: userData.created_at
            }

            // Send notification to admin (don't await to avoid slowing down signup)
            sendNewUserNotification(emailUserData).then(result => {
              if (result.success) {
                console.log('Admin notification sent successfully')
              } else {
                console.error('Failed to send admin notification:', result.error)
              }
            }).catch(error => {
              console.error('Error sending admin notification:', error)
            })

            // Send welcome email to user (don't await to avoid slowing down signup)
            sendWelcomeEmail(emailUserData).then(result => {
              if (result.success) {
                console.log('Welcome email sent successfully to:', emailUserData.email)
              } else {
                console.error('Failed to send welcome email:', result.error)
              }
            }).catch(error => {
              console.error('Error sending welcome email:', error)
            })
          }
        } else {
          // Profile exists, check if this is a very recent signup (within last 5 minutes)
          // This handles the case where the database trigger created the profile
          const profileCreatedAt = new Date(existingProfile.created_at)
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
          
          if (profileCreatedAt > fiveMinutesAgo) {
            // This is likely a new user, send welcome emails
            console.log('Existing profile found for recent signup, sending welcome emails...')
            
            // Determine signup method from auth provider
            const signupMethod = data.session.user.app_metadata?.provider === 'google' ? 'google' : 'github'
            
            const emailUserData = {
              id: data.session.user.id,
              email: existingProfile.email || data.session.user.email!,
              name: existingProfile.name,
              avatar_url: existingProfile.avatar_url,
              signup_method: signupMethod as 'google' | 'github',
              created_at: existingProfile.created_at
            }

            // Send notification to admin (don't await to avoid slowing down signup)
            sendNewUserNotification(emailUserData).then(result => {
              if (result.success) {
                console.log('Admin notification sent successfully')
              } else {
                console.error('Failed to send admin notification:', result.error)
              }
            }).catch(error => {
              console.error('Error sending admin notification:', error)
            })

            // Send welcome email to user (don't await to avoid slowing down signup)
            sendWelcomeEmail(emailUserData).then(result => {
              if (result.success) {
                console.log('Welcome email sent successfully to:', emailUserData.email)
              } else {
                console.error('Failed to send welcome email:', result.error)
              }
            }).catch(error => {
              console.error('Error sending welcome email:', error)
            })
          }
        }
      } catch (profileError) {
        console.error('Error checking/creating user profile:', profileError)
      }
    }

    // Determine redirect URL
    const getRedirectUrl = (origin: string) => {
      if (origin && origin.startsWith('https://')) {
        return `${origin}/dashboard`
      }
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return `${origin}/dashboard`
      }
      return 'https://www.devtoolskithub.com/dashboard'
    }

    const redirectUrl = getRedirectUrl(requestUrl.origin)

    // Create response with redirect
    const response = NextResponse.redirect(redirectUrl)
    
    // Set session cookies if available
    if (data.session) {
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: data.session.expires_in
      })
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      })
    }

    return response

  } catch (error) {
    const signInUrl = new URL('/sign-in', requestUrl.origin)
    signInUrl.searchParams.set('error', 'callback_error')
    signInUrl.searchParams.set('error_description', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.redirect(signInUrl)
  }
} 