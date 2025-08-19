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
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
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
}
