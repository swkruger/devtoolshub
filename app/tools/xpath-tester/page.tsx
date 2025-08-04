import { Metadata } from 'next'
import { xpathTesterConfig } from './tool.config'
import XPathTesterClient from './components/xpath-tester-client'
import { authServer } from '@/lib/auth'

export const metadata: Metadata = {
  title: `${xpathTesterConfig.name} - DevToolsHub`,
  description: xpathTesterConfig.description,
  keywords: xpathTesterConfig.tags.join(', '),
  openGraph: {
    title: `${xpathTesterConfig.name} - DevToolsHub`,
    description: xpathTesterConfig.description,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${xpathTesterConfig.name} - DevToolsHub`,
    description: xpathTesterConfig.description,
  },
}

export default async function XPathTesterPage() {
  // Get user's premium status
  let isPremiumUser = false
  let userId: string | undefined = undefined
  
  try {
    const user = await authServer.getUser()
    if (user) {
      userId = user.id
      isPremiumUser = await authServer.isPremiumUser(user.id)
    }
  } catch (error) {
    // User not authenticated or error occurred
    console.log('User not authenticated or error occurred:', error)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Tool Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">{xpathTesterConfig.emoji}</div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {xpathTesterConfig.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {xpathTesterConfig.description}
            </p>
          </div>
        </div>
      </div>

      {/* Premium Features Overview - Only show for free users */}
      {!isPremiumUser && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🚀 Premium Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Free Features</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {xpathTesterConfig.features.free.slice(0, 5).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-yellow-500">👑</span>
                Premium Features
              </h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {xpathTesterConfig.features.premium?.slice(0, 5).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-yellow-500">👑</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Tool Interface */}
      <XPathTesterClient isPremiumUser={isPremiumUser} userId={userId} />
    </div>
  )
} 