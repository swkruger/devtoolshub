import { getToolById } from "@/lib/tools"
import { authServer } from "@/lib/auth"
import { FileJson, Crown, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { JsonEditor } from "./components/json-editor"

export default async function JsonFormatterPage() {
  const tool = getToolById('json-formatter')
  const user = await authServer.getUserProfile()
  const isPremiumUser = user?.plan === 'premium'
  
  if (!tool) {
    return <div>Tool not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Tool Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <FileJson className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {tool.name}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
              {tool.description}
            </p>
          </div>
        </div>

      </div>

      {/* Main Editor Area */}
      <JsonEditor isPremiumUser={isPremiumUser} />

      {/* Feature Overview - Only show for free users */}
      {!isPremiumUser && (
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Upgrade to Premium
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Unlock advanced features and enhanced functionality
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  Free Features
                </CardTitle>
                <CardDescription>
                  Available to all users at no cost
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {tool.features.free.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Sort object keys alphabetically
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Repair malformed JSON
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Load sample data
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Premium Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <Crown className="w-5 h-5" />
                  Premium Features
                </CardTitle>
                <CardDescription>
                  Enhanced functionality for premium users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {tool.features.premium?.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    Convert JSON to XML/CSV/YAML
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    Interactive JSON tree view
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    Save/retrieve snippets online
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
} 