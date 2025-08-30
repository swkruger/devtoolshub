import { Metadata } from 'next'
import { authServer } from '@/lib/auth'
import { toolsConfig } from '@/lib/tools'
import { ToolPageHeader } from '@/components/shared/tool-page-header'
import { PremiumOverview } from '@/components/shared/premium-overview'
import PwaAssetsClient from './components/pwa-assets-client'

const tool = toolsConfig['pwa-assets']

export const metadata: Metadata = {
  title: `${tool.name} - DevToolsHub`,
  description: tool.description,
  keywords: tool.tags.join(', '),
}

export default async function PwaAssetsPage() {
  const userProfile = await authServer.getUserProfile()
  const isBackerUser = userProfile?.plan === 'backer'
  const userId = userProfile?.id || null

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <ToolPageHeader icon={tool.icon} title={tool.name} description={tool.description} />

      <PwaAssetsClient isBackerUser={!!isBackerUser} userId={userId} />

      {!isBackerUser && (
        <PremiumOverview
          features={tool.features.backer ?? []}
          title="Backer Features"
          subtitle="Unlock full matrices, splash screens, and advanced exports"
        />
      )}
    </div>
  )
}


