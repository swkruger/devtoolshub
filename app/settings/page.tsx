import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { Metadata } from 'next'
import SettingsLayout from '@/components/settings/SettingsLayout'

export const metadata: Metadata = {
  title: 'Settings - DevToolsHub',
  description: 'Manage your profile, subscription, security settings, and account preferences.',
  openGraph: {
    title: 'Settings - DevToolsHub',
    description: 'Manage your profile, subscription, security settings, and account preferences.',
  },
}

// Fallback component for when there are issues
function SettingsFallback({ errorDetails }: { errorDetails?: string }) {
  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a href="/dashboard" className="text-blue-600 hover:text-blue-800">
              ← Back to Dashboard
            </a>
          </div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-yellow-800">Settings Temporarily Unavailable</h2>
          <p className="text-yellow-700 mt-2">
            We&apos;re experiencing some technical difficulties with the settings page. Please try again later or contact support if the issue persists.
            {errorDetails && <span className="block mt-2 text-sm text-yellow-600">Error: {errorDetails}</span>}
          </p>
          {errorDetails?.includes('Auth session missing') && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-700">
                <strong>Authentication Issue Detected:</strong> This appears to be a session management problem. 
                Please try refreshing the page or signing out and back in.
              </p>
              <div className="mt-3 space-x-2">
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Refresh Page
                </button>
                <a 
                  href="/sign-in" 
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 inline-block"
                >
                  Sign In Again
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default async function SettingsPage() {
  let user = null
  let profile = null
  let preferences = null
  let isPremiumUser = false
  let errorDetails = ''

  try {
    console.log('Settings page: Starting execution.')
    console.log(`Settings page: NEXT_PUBLIC_SUPABASE_URL is ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'NOT SET'}`)
    console.log(`Settings page: NEXT_PUBLIC_SUPABASE_ANON_KEY is ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'NOT SET'}`)
    console.log(`Settings page: NEXT_PUBLIC_APP_URL is ${process.env.NEXT_PUBLIC_APP_URL ? 'set' : 'NOT SET'}`)

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase environment variables are not configured.')
    }

    console.log('Settings page: Initializing Supabase client.')
    const supabase = createSupabaseServerClient()
    
    console.log('Settings page: Starting authentication check')
    
    // Try to get session first to debug session issues
    console.log('Settings page: Checking for existing session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Settings page session error:', sessionError.message || sessionError)
    } else if (session) {
      console.log('Settings page: Found existing session for user:', session.user?.email)
    } else {
      console.log('Settings page: No existing session found')
    }
    
    // Try to get user with retry logic for session issues
    let authUser = null
    let authError = null
    
    // First attempt
    console.log('Settings page: Attempting to get user...')
    const { data: { user: user1 }, error: error1 } = await supabase.auth.getUser()
    
    console.log('Settings page: First auth attempt result:', {
      hasUser: !!user1,
      userEmail: user1?.email,
      error: error1?.message || 'No error'
    })
    
    if (error1 && error1.message?.includes('Auth session missing')) {
      console.log('Settings page: First auth attempt failed with session missing, trying again...')
      
      // Wait a moment and try again
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log('Settings page: Second auth attempt...')
      const { data: { user: user2 }, error: error2 } = await supabase.auth.getUser()
      
      console.log('Settings page: Second auth attempt result:', {
        hasUser: !!user2,
        userEmail: user2?.email,
        error: error2?.message || 'No error'
      })
      
      if (error2) {
        authError = error2
      } else {
        authUser = user2
      }
    } else if (error1) {
      authError = error1
    } else {
      authUser = user1
    }
    
    if (authError) {
      console.error('Settings page auth error:', authError.message || authError)
      
      // Handle specific auth session missing error
      if (authError.message?.includes('Auth session missing')) {
        console.log('Settings page: Auth session missing after retry - this may be a temporary issue')
        throw new Error('Authentication session is missing. Please refresh the page or sign in again.')
      }
      
      throw new Error(`Authentication error: ${authError.message}`)
    }
    
    if (!authUser) {
      console.error('Settings page: No user found - this should not happen as middleware handles this')
      throw new Error('User not authenticated - middleware should have redirected')
    }

    user = authUser
    console.log('Settings page: User authenticated, fetching profile data')

    // Get user profile and subscription data
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Settings page profile error:', profileError.message || profileError)
      // Continue with null profile rather than failing completely
    } else {
      profile = profileData
      console.log('Settings page: Profile data fetched successfully')
    }

    console.log('Settings page: Fetching user preferences')

    // Get user preferences
    const { data: preferencesData, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (preferencesError && preferencesError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      console.error('Settings page preferences error:', preferencesError.message || preferencesError)
      // Continue with null preferences rather than failing completely
    } else {
      preferences = preferencesData
      console.log('Settings page: Preferences data fetched successfully')
    }

    console.log('Settings page: All data fetched successfully, determining premium status')

    // Determine if user is premium
    isPremiumUser = profile?.plan === 'premium'

    console.log('Settings page: Rendering SettingsLayout component')

    return (
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <SettingsLayout 
          user={user}
          profile={profile}
          preferences={preferences}
          isPremiumUser={isPremiumUser}
        />
      </div>
    )
  } catch (error: any) {
    console.error('Settings page caught an unexpected error:', error.message || error)
    errorDetails = error.message || 'Unknown error occurred'
    return <SettingsFallback errorDetails={errorDetails} />
  }
}
