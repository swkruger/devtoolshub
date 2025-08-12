import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAllTools } from "@/lib/tools"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard – DevToolsHub',
  description: 'Browse and launch DevToolsHub tools from your dashboard. JSON, RegEx, JWT, Base64, UUID, timestamps, XPath/CSS, images, and more.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/dashboard' },
}
import Link from "next/link"

const tools = getAllTools()

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Developer Tools</h1>
        <p className="text-muted-foreground">
          Choose from our collection of developer utilities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Card key={tool.id} className={`tool-card ${tool.isPremium ? 'tool-card-premium' : ''}`}>
            {tool.isPremium && (
              <div className="premium-badge">
                Premium
              </div>
            )}
            <CardHeader>
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{tool.emoji}</span>
                <div>
                  <CardTitle className="text-lg">{tool.name}</CardTitle>
                  <CardDescription>{tool.shortDescription}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {tool.isPremium ? (
                <Button 
                  className="w-full" 
                  variant="default"
                  disabled
                >
                  Upgrade to Access
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  variant="outline"
                  asChild
                >
                  <Link href={tool.path}>Open Tool</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>🚀 Go Premium</CardTitle>
            <CardDescription>
              Unlock advanced features and remove limitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 