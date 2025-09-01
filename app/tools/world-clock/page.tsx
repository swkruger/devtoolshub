import { Metadata } from 'next'
import { getToolById } from '@/lib/tools'
import WorldClockClient from './components/world-clock-client'
import { getMetadataApplicationName } from '@/lib/app-config'
import { authServer } from '@/lib/auth'
import { ToolPageHeader } from '@/components/shared/tool-page-header'
import { PremiumOverview } from '@/components/shared/premium-overview'

export const metadata: Metadata = {
  title: `World Clock & Time Zones - ${getMetadataApplicationName()}`,
  description: 'Compare time zones across cities worldwide with meeting planner, weather data, and business hours visualization',
  openGraph: {
    title: `World Clock & Time Zones - ${getMetadataApplicationName()}`,
    description: 'Compare time zones across cities worldwide with meeting planner, weather data, and business hours visualization',
  },
}

export default async function WorldClockPage() {
  const tool = getToolById('world-clock')
  const user = await authServer.getUserProfile()
  const isBackerUser = user?.plan === 'backer'
  
  if (!tool) {
    return <div>Tool not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <ToolPageHeader icon={tool.icon} title={tool.name} description={tool.description} />

      {/* Main tool interface */}
      <WorldClockClient 
        isBackerUser={isBackerUser} 
        userId={user?.id || ''}
      />
      
      {/* Backer feature overview for free users only */}
      {!isBackerUser && (
        <PremiumOverview 
          features={tool.features.backer ?? []}
          title="Backer Features"
          subtitle="Get unlimited cities, weather data, and advanced meeting planning tools"
        />
      )}
    </div>
  )
}