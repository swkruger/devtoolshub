import { AppLayout } from "@/components/shared/app-layout"
import { authServer } from "@/lib/auth"
import { ProfileSyncWrapper } from "@/components/auth/profile-sync-wrapper"

// Force dynamic rendering to prevent caching of user data
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get user profile for the layout
  const user = await authServer.getUserProfile()
  
  console.log('Dashboard layout - user profile:', {
    id: user?.id,
    email: user?.email,
    name: user?.name,
    avatar_url: user?.avatar_url,
    plan: user?.plan
  })
  
  return (
    <ProfileSyncWrapper>
      <AppLayout user={user}>
        {children}
      </AppLayout>
    </ProfileSyncWrapper>
  )
} 