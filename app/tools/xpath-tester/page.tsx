import { Metadata } from 'next'
import { xpathTesterConfig } from './tool.config'
import XPathTesterClient from './components/xpath-tester-client'
import { authServer } from '@/lib/auth'
import { ToolPageHeader } from '@/components/shared/tool-page-header'
import { PremiumOverview } from '@/components/shared/premium-overview'

export const metadata: Metadata = {
  title: `${xpathTesterConfig.name} - DevToolsHub`,
  description: xpathTesterConfig.description,
  keywords: xpathTesterConfig.tags.join(', '),
  openGraph: {
    title: `${xpathTesterConfig.name} - DevToolsHub`,
    description: xpathTesterConfig.description,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${xpathTesterConfig.name} - DevToolsHub`,
    description: xpathTesterConfig.description,
  },
}

export default async function XPathTesterPage() {
  // Get user's premium status
  let isPremiumUser = false
  let userId: string | undefined = undefined
  
  try {
    const user = await authServer.getUser()
    if (user) {
      userId = user.id
      isPremiumUser = await authServer.isPremiumUser(user.id)
    }
  } catch (error) {
    // User not authenticated or error occurred
    console.log('User not authenticated or error occurred:', error)
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <ToolPageHeader icon={xpathTesterConfig.icon} title={xpathTesterConfig.name} description={xpathTesterConfig.description} />

      {/* Main Tool Interface */}
      <XPathTesterClient isPremiumUser={isPremiumUser} userId={userId} />

      {!isPremiumUser && (
        <PremiumOverview 
          features={xpathTesterConfig.features.premium ?? []}
          title="Premium Features"
          subtitle="Unlock advanced XPath/CSS testing capabilities"
        />
      )}
    </div>
  )
} 