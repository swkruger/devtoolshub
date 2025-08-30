import { authServer } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import GoBackerClient from './GoBackerClient'

// Force dynamic rendering to avoid build-time database calls
export const dynamic = 'force-dynamic'

export default async function GoBackerPage() {
  // Get the current user
  const user = await authServer.getUser()
  
  if (!user) {
    redirect('/sign-in?redirectTo=/go-backer')
  }

  // Get user profile to check current plan
  const supabase = createSupabaseServerClient()
  const { data: profile } = await supabase
    .from('users')
    .select('id, email, name, avatar_url, plan, stripe_customer_id')
    .eq('id', user.id)
    .single()

  // Determine if user is a backer
  const isBackerUser = profile?.plan === 'backer'

  // If user is already a backer, redirect to dashboard
  if (isBackerUser) {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Become a Backer</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Support the project and unlock unlimited saved items, advanced features & algorithms, and early access to new tools
        </p>
      </div>

      <GoBackerClient user={user} profile={profile} isBackerUser={isBackerUser} />
    </div>
  )
}
