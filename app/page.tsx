import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { authServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllTools, getCategoryDisplayName } from "@/lib/tools"
import { Mail, Github, Star, Zap, Shield, Code2 } from "lucide-react"

export default async function HomePage() {
  // Check if user is authenticated and redirect to dashboard
  const user = await authServer.getUser()
  
  if (user) {
    redirect('/dashboard')
  }

  const tools = getAllTools()
  const featuredTools = tools.slice(0, 6) // Show first 6 tools

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Development Notice Banner */}
      <div className="bg-blue-50 dark:bg-blue-950/50 border-b border-blue-200 dark:border-blue-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" aria-hidden="true"></div>
              <span className="font-medium text-blue-700 dark:text-blue-300">
                🚧 DevToolsHub is in active development
              </span>
            </div>
            <span className="hidden sm:inline text-blue-600 dark:text-blue-400" aria-hidden="true">•</span>
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span className="text-blue-600 dark:text-blue-400">
                Send feedback to{" "}
                <a 
                  href="mailto:devtoolshub8@gmail.com" 
                  className="font-medium underline hover:no-underline focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm"
                  aria-label="Send feedback email to DevToolsHub team"
                >
                  devtoolshub8@gmail.com
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl" role="img" aria-label="Tools">🔧</span>
            <span className="font-bold text-xl">DevToolsHub</span>
          </div>
          <nav className="flex items-center gap-3" role="navigation" aria-label="Main navigation">
            <Button variant="ghost" size="sm" asChild>
              <a 
                href="https://github.com/devtoolshub" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Visit DevToolsHub on GitHub (opens in new tab)"
              >
                <Github className="w-4 h-4 mr-2" aria-hidden="true" />
                GitHub
              </a>
            </Button>
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16" aria-labelledby="hero-title">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="secondary" className="text-xs font-medium">
              <Star className="w-3 h-3 mr-1" aria-hidden="true" />
              Beta Release
            </Badge>
          </div>
          <h1 id="hero-title" className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            DevToolsHub
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your all-in-one developer toolkit. Format JSON, test regex patterns, decode JWTs, and much more—all in one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/sign-in">
                <Zap className="w-4 h-4" aria-hidden="true" />
                Get Started Free
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="gap-2" asChild>
              <Link href="/dashboard">
                <Code2 className="w-4 h-4" aria-hidden="true" />
                Explore Tools
              </Link>
            </Button>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-16" aria-labelledby="features-title">
          <h2 id="features-title" className="sr-only">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center" aria-hidden="true">
                    <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Essential Dev Tools</CardTitle>
                </div>
                <CardDescription>
                  JSON formatter, regex tester, JWT decoder, UUID generator, and more. All the tools you need for daily development work.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center" aria-hidden="true">
                    <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>Lightning Fast</CardTitle>
                </div>
                <CardDescription>
                  Built with Next.js 14 and modern web technologies for instant responses and smooth user experience.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center" aria-hidden="true">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>Secure & Private</CardTitle>
                </div>
                <CardDescription>
                  Your data is processed securely. Premium features include advanced functionality and team collaboration.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Featured Tools */}
        <section className="mb-16" aria-labelledby="tools-title">
          <div className="text-center mb-8">
            <h2 id="tools-title" className="text-2xl sm:text-3xl font-bold mb-2">Available Tools</h2>
            <p className="text-muted-foreground">
              Powerful utilities to streamline your development workflow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Available developer tools">
            {featuredTools.map((tool) => (
              <Card key={tool.id} className="group hover:shadow-lg transition-shadow" role="listitem">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl" 
                      aria-hidden="true"
                    >
                      {tool.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <CardTitle className="text-lg truncate">{tool.name}</CardTitle>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {getCategoryDisplayName(tool.category)}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {tool.shortDescription}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Free Features */}
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                        ✓ Free Features:
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1" role="list">
                        {tool.features.free.slice(0, 2).map((feature, idx) => (
                          <li key={idx} role="listitem">• {feature}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Premium Features Preview */}
                    {tool.features.premium && tool.features.premium.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
                          ⭐ Premium Features:
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1" role="list">
                          {tool.features.premium.slice(0, 2).map((feature, idx) => (
                            <li key={idx} role="listitem">• {feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full group-hover:bg-primary/90 transition-colors" 
                      size="sm"
                      asChild
                    >
                      <Link href="/sign-in" aria-label={`Try ${tool.name} tool`}>
                        Try {tool.name}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/dashboard" aria-label={`View all ${tools.length} available tools`}>
                View All {tools.length} Tools
              </Link>
            </Button>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center" aria-labelledby="cta-title">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle id="cta-title" className="text-xl sm:text-2xl">Ready to streamline your workflow?</CardTitle>
              <CardDescription className="text-base">
                Join thousands of developers using DevToolsHub to boost their productivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" asChild>
                  <Link href="/sign-in">
                    Get Started Free
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a 
                    href="mailto:devtoolshub8@gmail.com"
                    aria-label="Contact DevToolsHub team via email"
                  >
                    Contact Us
                  </a>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Free forever • No credit card required • Premium features available
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
} 