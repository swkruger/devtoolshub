import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getToolById } from "@/lib/tools"

interface ToolPageProps {
  params: {
    'tool-name': string
  }
}

export default function ToolPage({ params }: ToolPageProps) {
  const toolName = params['tool-name']
  const toolConfig = getToolById(toolName)

  if (!toolConfig) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-4xl">{toolConfig.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold">{toolConfig.name}</h1>
            <p className="text-muted-foreground">{toolConfig.description}</p>
          </div>
        </div>
        
        {toolConfig.isPremium && (
          <div className="mb-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-primary font-semibold">⭐ Premium Tool</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                This tool requires a premium subscription to access.
              </p>
            </div>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tool Interface</CardTitle>
          <CardDescription>
            Tool-specific interface will be implemented here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] flex items-center justify-center bg-muted/20 rounded-lg">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {toolConfig.name} interface will be implemented here
              </p>
              <p className="text-sm text-muted-foreground">
                This is the modular tool page for: <code className="bg-muted px-2 py-1 rounded">{toolName}</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export async function generateStaticParams() {
  const { getAllTools } = await import('@/lib/tools')
  return getAllTools().map((tool) => ({
    'tool-name': tool.id,
  }))
} 