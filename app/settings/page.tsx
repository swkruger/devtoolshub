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
function SettingsFallback() {
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
            We're experiencing some technical difficulties with the settings page. Please try again later or contact support if the issue persists.
          </p>
        </div>
      </div>
    </div>
  )
}

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient()
  
  try {
    console.log('Settings page: Starting authentication check')
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Settings page auth error:', authError)
      redirect('/sign-in')
    }
    
    if (!user) {
      console.log('Settings page: No user found, redirecting to sign-in')
      redirect('/sign-in')
    }

    console.log('Settings page: User authenticated, fetching profile data')

    // Get user profile and subscription data
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Settings page profile error:', profileError)
      // Continue with null profile rather than failing completely
    }

    console.log('Settings page: Profile data fetched, fetching preferences')

    // Get user preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (preferencesError && preferencesError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      console.error('Settings page preferences error:', preferencesError)
      // Continue with null preferences rather than failing completely
    }

    console.log('Settings page: All data fetched successfully, rendering layout')

    // Determine if user is premium
    const isPremiumUser = profile?.plan === 'premium'

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
  } catch (error) {
    console.error('Settings page error:', error)
    // If there's an error, show fallback instead of redirecting
    return <SettingsFallback />
  }
}
