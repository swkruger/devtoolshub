import { getToolById } from "@/lib/tools"
import { authServer } from "@/lib/auth"
import { FileJson, Crown, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { JsonFormatterClient } from "./components/json-formatter-client"
import { ToolPageHeader } from "@/components/shared/tool-page-header"
import { PremiumOverview } from "@/components/shared/premium-overview"

export default async function JsonFormatterPage() {
  const tool = getToolById('json-formatter')
  const user = await authServer.getUserProfile()
  const isPremiumUser = user?.plan === 'premium'
  
  if (!tool) {
    return <div>Tool not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <ToolPageHeader icon={tool.icon} title={tool.name} description={tool.description} />

      {/* Main Editor Area */}
      <JsonFormatterClient isPremiumUser={isPremiumUser} userId={user?.id} />

      {!isPremiumUser && (
        <PremiumOverview 
          features={tool.features.premium ?? []}
          title="Premium Features"
          subtitle="Enhance your JSON workflow with powerful premium tools"
        />
      )}
    </div>
  )
} 