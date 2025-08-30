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

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient()

  // Check authentication with better error handling
  let user, authError

  try {
    const authResult = await supabase.auth.getUser()
    user = authResult.data.user
    authError = authResult.error

    console.log('Settings page auth check:', {
      hasUser: !!user,
      userId: user?.id,
      error: authError?.message,
      errorCode: authError?.status
    })
  } catch (error) {
    console.error('Error during auth check in settings:', error)
    authError = error as any
  }

  if (authError || !user) {
    console.log('Settings page: No authenticated user, redirecting to sign-in')
    redirect('/sign-in')
  }

  // Get user profile and subscription data
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user preferences
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Determine if user is a backer
  const isBackerUser = profile?.plan === 'backer'

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <SettingsLayout 
        user={user}
        profile={profile}
        preferences={preferences}
        isBackerUser={isBackerUser}
      />
    </div>
  )
}
