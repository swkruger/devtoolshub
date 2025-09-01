import { Metadata } from 'next'
import { toolsConfig } from '@/lib/tools'
import PWAAssetsClient from './components/pwa-assets-client'
import { getMetadataApplicationName } from '@/lib/app-config'
import { authServer } from '@/lib/auth'
import { ToolPageHeader } from '@/components/shared/tool-page-header'
import { PremiumOverview } from '@/components/shared/premium-overview'

const tool = toolsConfig['pwa-assets']

export const metadata: Metadata = {
  title: `${tool.name} - ${getMetadataApplicationName()}`,
  description: tool.description,
  keywords: tool.tags.join(', '),
  openGraph: {
    title: `${tool.name} - ${getMetadataApplicationName()}`,
    description: tool.description,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${tool.name} - ${getMetadataApplicationName()}`,
    description: tool.description,
  },
}

export default async function PwaAssetsPage() {
  const userProfile = await authServer.getUserProfile()
  const isBackerUser = userProfile?.plan === 'backer'
  const userId = userProfile?.id || null

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <ToolPageHeader icon={tool.icon} title={tool.name} description={tool.description} />

      <PWAAssetsClient isBackerUser={!!isBackerUser} userId={userId} />

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


