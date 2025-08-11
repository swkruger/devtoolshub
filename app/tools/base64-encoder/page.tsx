import { Metadata } from "next"
import { RotateCcw } from "lucide-react"

import { authServer } from "@/lib/auth"
import { toolsConfig } from "@/lib/tools"
import { Base64EncoderClient } from "./components/base64-encoder-client"
import { ToolPageHeader } from "@/components/shared/tool-page-header"
import { PremiumOverview } from "@/components/shared/premium-overview"

const tool = toolsConfig['base64-encoder']

export const metadata: Metadata = {
  title: `${tool.name} - DevToolsHub`,
  description: tool.description,
  keywords: tool.tags.join(', '),
}

export default async function Base64EncoderPage() {
  const userProfile = await authServer.getUserProfile()
  const isPremiumUser = userProfile?.plan === 'premium'
  const userId = userProfile?.id || null

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <ToolPageHeader icon={tool.icon} title={tool.name} description={tool.description} />

      <Base64EncoderClient isPremiumUser={isPremiumUser} userId={userId} />

      {!isPremiumUser && (
        <PremiumOverview 
          features={tool.features.premium ?? []}
          title="Premium Features"
          subtitle="Unlock batch processing, history, and advanced encoding options"
        />
      )}
    </div>
  )
}