import { Metadata } from "next"
import { Clock } from "lucide-react"

import { authServer } from "@/lib/auth"
import { toolsConfig } from "@/lib/tools"
import { TimestampConverterClient } from "./components/timestamp-converter-client"

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
      {/* Compact header matching established pattern */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20">
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {tool.name}
          </h1>
        </div>
      </div>

      {/* Premium features overview for free users only */}
      {!isPremiumUser && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            🚀 Unlock Premium Features
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            Get access to advanced timestamp conversion capabilities:
          </p>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-amber-500">👑</span>
                <span>Batch timestamp conversion</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-500">👑</span>
                <span>Custom date format patterns</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-500">👑</span>
                <span>Timezone comparison view</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-amber-500">👑</span>
                <span>Timestamp arithmetic</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-500">👑</span>
                <span>CSV/JSON export capabilities</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-500">👑</span>
                <span>Historical timezone data</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main tool component */}
      <TimestampConverterClient 
        isPremiumUser={isPremiumUser}
        userId={userId}
      />
    </div>
  )
}