import { Metadata } from "next"
import { RotateCcw } from "lucide-react"

import { authServer } from "@/lib/auth"
import { toolsConfig } from "@/lib/tools"
import { Base64EncoderClient } from "./components/base64-encoder-client"

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
      {/* Compact header matching established pattern */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/20">
          <RotateCcw className="w-4 h-4 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {tool.name}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {tool.description}
          </p>
        </div>
      </div>

      {/* Main client component */}
      <Base64EncoderClient isPremiumUser={isPremiumUser} userId={userId} />
    </div>
  )
}