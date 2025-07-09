import { AppLayout } from "@/components/shared/app-layout"
import { authServer } from "@/lib/auth"

export default async function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get user profile for the layout
  const user = await authServer.getUserProfile()
  
  return (
    <AppLayout user={user}>
      {children}
    </AppLayout>
  )
} 