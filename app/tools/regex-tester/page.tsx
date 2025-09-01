import { Metadata } from 'next'
import { toolsConfig } from '@/lib/tools'
import { RegexTesterClient } from './components/regex-tester-client'
import { getMetadataApplicationName } from '@/lib/app-config'
import { authServer } from '@/lib/auth'
import { ToolPageHeader } from '@/components/shared/tool-page-header'
import { PremiumOverview } from '@/components/shared/premium-overview'

const tool = toolsConfig['regex-tester']

export const metadata: Metadata = {
  title: `Regex Tester | ${getMetadataApplicationName()}`,
  description: tool.description,
  keywords: tool.tags.join(', '),
  openGraph: {
    title: `Regex Tester | ${getMetadataApplicationName()}`,
    description: tool.description,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Regex Tester | ${getMetadataApplicationName()}`,
    description: tool.description,
  },
}

export default async function RegexTesterPage() {
  const user = await authServer.getUserProfile()
  const isBackerUser = user?.plan === 'backer'
  
  if (!tool) {
    return <div>Tool not found</div>
  }
  
  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <ToolPageHeader icon={tool.icon} title={tool.name} description={tool.description} />

      {/* Main Editor Area */}
      <RegexTesterClient 
        user={user}
        isBackerUser={isBackerUser}
      />

      {!isBackerUser && (
        <PremiumOverview 
          features={tool.features.backer ?? []}
          title="Backer Features"
          subtitle="Enhance your regex workflow with powerful backer tools"
        />
      )}
    </div>
  )
} 