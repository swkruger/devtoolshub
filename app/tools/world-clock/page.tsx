import { Metadata } from 'next'
import { Globe } from 'lucide-react'
import { authServer } from '@/lib/auth'
import { toolConfig } from './tool.config'
import WorldClockClient from './components/world-clock-client'

export const metadata: Metadata = {
  title: `${toolConfig.name} - DevToolsHub`,
  description: toolConfig.description,
  keywords: toolConfig.tags.join(', '),
  openGraph: {
    title: `${toolConfig.name} - DevToolsHub`,
    description: toolConfig.description,
    type: 'website',
  },
}

export default async function WorldClockPage() {
  // Require authentication and get user profile
  const user = await authServer.requireAuth()
  const isPremiumUser = user.plan === 'premium'

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      {/* Compact header layout - consistent with other tools */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20">
          <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {toolConfig.name}
          </h1>
        </div>
      </div>

      {/* Main tool interface */}
      <WorldClockClient 
        isPremiumUser={isPremiumUser} 
        userId={user.id}
      />
      
      {/* Premium feature overview for free users only */}
      {!isPremiumUser && (
        <div className="mt-8 border-t pt-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              🌟 Unlock Premium Features
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Get unlimited cities, weather data, and advanced meeting planning tools
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {toolConfig.features.premium?.map((feature, index) => (
              <div 
                key={index}
                className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md">
              ✨ Upgrade to Premium
            </button>
          </div>
        </div>
      )}
    </div>
  )
}