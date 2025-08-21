import { Metadata } from 'next'
import { getToolById } from '@/lib/tools'
import { authServer } from '@/lib/auth'
import { Search, Crown, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ToolPageHeader } from "@/components/shared/tool-page-header"
import { PremiumOverview } from "@/components/shared/premium-overview"
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
      <ToolPageHeader icon={tool.icon} title={tool.name} description={tool.description} />

      {/* Main Editor Area */}
      <RegexTesterClient 
        user={user}
        isPremiumUser={isPremiumUser}
      />

      {!isPremiumUser && (
        <PremiumOverview 
          features={tool.features.premium ?? []}
          title="Premium Features"
          subtitle="Enhance your regex workflow with powerful premium tools"
        />
      )}
    </div>
  )
} 