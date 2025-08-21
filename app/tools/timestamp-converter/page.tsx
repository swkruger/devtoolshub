import { Metadata } from "next"
import { Clock } from "lucide-react"

import { authServer } from "@/lib/auth"
import { toolsConfig } from "@/lib/tools"
import { TimestampConverterClient } from "./components/timestamp-converter-client"
import { ToolPageHeader } from "@/components/shared/tool-page-header"
import { PremiumOverview } from "@/components/shared/premium-overview"

const tool = toolsConfig['timestamp-converter']

export const metadata: Metadata = {
  title: `${tool.name} - DevToolsHub`,
  description: tool.description,
  keywords: [
    'timestamp converter',
    'unix timestamp',
    'epoch converter',
    'date converter',
    'timezone converter',
    'timestamp to date',
    'epoch time',
    'unix time converter',
    'timestamp format',
    'date format converter',
    'timestamp tools',
    'developer tools'
  ],
  openGraph: {
    title: `${tool.name} - DevToolsHub`,
    description: tool.description,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `${tool.name} - DevToolsHub`,
    description: tool.description,
  },
}

export default async function TimestampConverterPage() {
  const userProfile = await authServer.getUserProfile()
  const isPremiumUser = userProfile?.plan === 'premium'
  const userId = userProfile?.id || null

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <ToolPageHeader icon={tool.icon} title={tool.name} description={tool.description} />

      {/* Main tool component */}
      <TimestampConverterClient 
        isPremiumUser={isPremiumUser}
        userId={userId}
      />

      {!isPremiumUser && (
        <PremiumOverview 
          features={tool.features.premium ?? []}
          title="Premium Features"
          subtitle="Get access to advanced timestamp conversion capabilities"
        />
      )}
    </div>
  )
}