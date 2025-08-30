import { Metadata } from 'next'
import { authServer } from '@/lib/auth'
import { toolConfig } from './tool.config'
import WorldClockClient from './components/world-clock-client'
import { ToolPageHeader } from '@/components/shared/tool-page-header'
import { PremiumOverview } from '@/components/shared/premium-overview'

export const metadata: Metadata = {
  title: `${toolConfig.name} - DevToolsHub`,
  description: toolConfig.description,
  keywords: toolConfig.tags.join(', '),
  openGraph: {
    title: `${toolConfig.name} - DevToolsHub`,
    description: toolConfig.description,
    type: 'website',
  },
}

export default async function WorldClockPage() {
  // Require authentication and get user profile
  const user = await authServer.requireAuth()
  const isBackerUser = user.plan === 'backer'

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <ToolPageHeader icon={toolConfig.icon} title={toolConfig.name} description={toolConfig.description} />

      {/* Main tool interface */}
      <WorldClockClient 
        isBackerUser={isBackerUser} 
        userId={user.id}
      />
      
      {/* Backer feature overview for free users only */}
      {!isBackerUser && (
        <PremiumOverview 
          features={toolConfig.features.backer ?? []}
          title="Backer Features"
          subtitle="Get unlimited cities, weather data, and advanced meeting planning tools"
        />
      )}
    </div>
  )
}