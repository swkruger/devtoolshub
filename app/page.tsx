import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Navigation Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🔧</span>
            <span className="font-bold text-xl">DevToolsHub</span>
          </div>
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            DevToolsHub
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your all-in-one developer toolkit. JSON formatting, regex testing, and much more.
          </p>
          <Button size="lg" className="mr-4" asChild>
            <Link href="/sign-in">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/dashboard">View Tools</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>🔧 Essential Tools</CardTitle>
              <CardDescription>
                JSON formatter, regex tester, JWT decoder, and more essential developer utilities.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🚀 Fast & Reliable</CardTitle>
              <CardDescription>
                Built with Next.js 14 for lightning-fast performance and modern user experience.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💡 Premium Features</CardTitle>
              <CardDescription>
                Unlock advanced features like batch processing, file uploads, and team collaboration.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground">
            Sign in to access your personalized developer toolkit
          </p>
        </div>
      </div>
    </div>
  )
} 