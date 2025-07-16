import { Metadata } from 'next'
import { getToolById } from '@/lib/tools'
import { authServer } from '@/lib/auth'
import { Search, Crown, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RegexTesterClient } from './components/regex-tester-client'

export const metadata: Metadata = {
  title: 'Regex Tester | DevToolsHub',
  description: 'Test regular expressions with live pattern matching, multi-language support, and advanced debugging features. The best regex testing tool for developers.',
  keywords: 'regex, regular expression, pattern matching, javascript, python, java, test, validator',
}

export default async function RegexTesterPage() {
  const tool = getToolById('regex-tester')
  const user = await authServer.getUserProfile()
  const isPremiumUser = user?.plan === 'premium'
  
  if (!tool) {
    return <div>Tool not found</div>
  }
  
  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      {/* Compact Tool Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20">
          <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {tool.name}
          </h1>
        </div>
      </div>

      {/* Main Editor Area */}
      <RegexTesterClient 
        user={user}
        isPremiumUser={isPremiumUser}
      />

      {/* Feature Overview - Only show for free users */}
      {!isPremiumUser && (
        <div className="mt-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full mb-3">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Unlock Premium Features
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Enhance your regex workflow with powerful premium tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free Features */}
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400 text-base">
                  <CheckCircle className="w-4 h-4" />
                  What You Get Now
                </CardTitle>
                <CardDescription className="text-xs">
                  Your current free plan includes
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1.5 text-xs">
                  {tool.features.free.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                    Copy matches to clipboard
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                    Load common patterns
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                    Comprehensive help & examples
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Premium Features */}
            <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-base">
                  <Crown className="w-4 h-4" />
                  Premium Upgrade
                </CardTitle>
                <CardDescription className="text-xs">
                  Unlock these powerful features
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <ul className="space-y-1.5 text-xs">
                  {tool.features.premium?.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                  <li className="flex items-center gap-2">
                    <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    Live pattern testing as you type
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    Advanced match analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    Bulk testing & file uploads
                  </li>
                </ul>
                
                <div className="pt-2 border-t border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-amber-600 dark:text-amber-400">Starting at</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-amber-700 dark:text-amber-400">$9</span>
                      <span className="text-xs text-amber-600 dark:text-amber-500">/month</span>
                    </div>
                  </div>
                  <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium text-xs py-2 px-4 rounded-md transition-all duration-200 hover:shadow-md">
                    Upgrade to Premium
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
} 