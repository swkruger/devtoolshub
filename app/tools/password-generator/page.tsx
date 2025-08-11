import { Metadata } from 'next'
import { authServer } from '@/lib/auth'
import { toolsConfig } from '@/lib/tools'
import { ToolPageHeader } from '@/components/shared/tool-page-header'
import { PremiumOverview } from '@/components/shared/premium-overview'
import PasswordGeneratorClient from './password-generator.client'

const tool = toolsConfig['password-generator']

export const metadata: Metadata = {
  title: `${tool?.name ?? 'Password & Key-like Generator'} - DevToolsHub`,
  description: tool?.description,
  keywords: tool?.tags?.join(', '),
}

export default async function PasswordGeneratorPage() {
  const userProfile = await authServer.getUserProfile()
  const isPremiumUser = userProfile?.plan === 'premium'
  const userId = userProfile?.id || null

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <ToolPageHeader icon={tool.icon} title={tool.name} description={tool.description} />
      <PasswordGeneratorClient isPremiumUser={!!isPremiumUser} userId={userId} />
      {!isPremiumUser && (
        <PremiumOverview
          features={tool.features.premium ?? []}
          title="Premium Features"
          subtitle="Unlock key-like generation formats and advanced options"
        />
      )}
    </div>
  )
}


