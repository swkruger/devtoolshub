import { Metadata } from 'next'
import { getToolById } from '@/lib/tools'
import XPathTesterClient from './components/xpath-tester-client'
import { getMetadataApplicationName } from '@/lib/app-config'
import { authServer } from '@/lib/auth'
import { ToolPageHeader } from '@/components/shared/tool-page-header'
import { PremiumOverview } from '@/components/shared/premium-overview'

export const metadata: Metadata = {
  title: `XPath & CSS Selector Tester - ${getMetadataApplicationName()}`,
  description: 'Test XPath expressions and CSS selectors against HTML documents with real-time validation and debugging',
  openGraph: {
    title: `XPath & CSS Selector Tester - ${getMetadataApplicationName()}`,
    description: 'Test XPath expressions and CSS selectors against HTML documents with real-time validation and debugging',
  },
  twitter: {
    title: `XPath & CSS Selector Tester - ${getMetadataApplicationName()}`,
    description: 'Test XPath expressions and CSS selectors against HTML documents with real-time validation and debugging',
  },
}

export default async function XPathTesterPage() {
  const tool = getToolById('xpath-tester')
  const user = await authServer.getUserProfile()
  const isBackerUser = user?.plan === 'backer'
  
  if (!tool) {
    return <div>Tool not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <ToolPageHeader icon={tool.icon} title={tool.name} description={tool.description} />

      {/* Main Tool Interface */}
      <XPathTesterClient isBackerUser={isBackerUser} userId={user?.id || ''} />

      {!isBackerUser && (
        <PremiumOverview 
          features={tool.features.backer ?? []}
          title="Backer Features"
          subtitle="Unlock advanced XPath/CSS testing capabilities"
        />
      )}
    </div>
  )
} 