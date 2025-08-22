import { authServer } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import GoPremiumClient from './GoPremiumClient'

// Force dynamic rendering to avoid build-time database calls
export const dynamic = 'force-dynamic'

export default async function GoPremiumPage() {
  // Get the current user
  const user = await authServer.getUser()
  
  if (!user) {
    redirect('/sign-in?redirectTo=/go-premium')
  }

  // Get user profile to check current plan
  const supabase = createSupabaseServerClient()
  const { data: profile } = await supabase
    .from('users')
    .select('id, email, name, avatar_url, plan, stripe_customer_id')
    .eq('id', user.id)
    .single()

  // Determine if user is premium
  const isPremiumUser = profile?.plan === 'premium'

  // If user is already premium, redirect to dashboard
  if (isPremiumUser) {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Premium Subscription</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Unlock unlimited saved items, advanced features & algorithms, and early access to new tools
        </p>
      </div>

      <GoPremiumClient user={user} profile={profile} isPremiumUser={isPremiumUser} />
    </div>
  )
}
