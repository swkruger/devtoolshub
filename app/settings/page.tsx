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

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase environment variables are not configured.')
    }

    console.log('Settings page: Initializing Supabase client.')
    const supabase = createSupabaseServerClient()
    
    console.log('Settings page: Starting authentication check')
    
    // Check authentication - middleware already handles redirects for unauthenticated users
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Settings page auth error:', authError.message || authError)
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
