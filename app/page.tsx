import Link from 'next/link'
import { authServer } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAllTools } from '@/lib/tools'
import { BookOpen } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DevToolsHub – Essential Developer Tools',
  description:
    'All-in-one developer toolkit: JSON formatter, regex tester, JWT decoder/encoder, Base64 utilities, UUID generator, timestamp converter, XPath/CSS selector tester, image compressor, world clock, and more.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  // Check if user is already authenticated (only during request time, not build time)
  try {
    const user = await authServer.getUser()
    if (user) {
      redirect('/dashboard')
    }
  } catch (error) {
    // During build time, authServer.getUser() will fail because there's no request context
    // This is expected and we can safely ignore it for the landing page
    console.log('No request context available (likely during build time)')
  }

  const tools = getAllTools()
  const availableCount = tools.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Development Banner */}
      <div className="bg-blue-600 text-white py-3 px-4 text-center">
        <p className="text-sm font-medium">
          🚧 DevToolsHub is currently in development. 
          Contact us at{' '}
          <a 
            href="mailto:contactme@devtoolskithub.com" 
            className="underline hover:text-blue-200 transition-colors"
          >
            contactme@devtoolskithub.com
          </a>
          {' '}for feedback and support.
        </p>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img
                src="/icons/icon-192x192.png"
                alt="DevToolsHub icon"
                className="w-10 h-10 rounded-lg object-contain bg-white"
                width={40}
                height={40}
              />
              <h1 className="text-2xl font-bold text-gray-900">DevToolsHub</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link 
                href="/blog" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Blog
              </Link>
              <Link 
                href="https://github.com/swkruger/devtoolshub" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </Link>
              <Link 
                href="/sign-in" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Essential Developer Tools
            <span className="block text-blue-600">All in One Place</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your development workflow with our comprehensive suite of essential tools. 
            {availableCount} powerful tools available now, with more coming soon. Everything you need to code faster and better.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/sign-in" 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Building Now
            </Link>
            <Link 
              href="#tools" 
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 transition-colors"
            >
              Explore Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Tools Showcase */}
      <section id="tools" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 id="tools" className="text-4xl font-bold text-gray-900 mb-4">
              Professional Developer Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for modern web development, API testing, and data manipulation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map(tool => (
              <div key={tool.id} className="relative">
                <Link href={tool.path} className="group block">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-blue-300">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <tool.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{tool.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-green-600 font-medium">✅ Available</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{tool.shortDescription}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      {tool.tags.slice(0,4).map(tag => (
                        <span key={tag} className="px-2 py-1 rounded bg-gray-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                </Link>
                <Link
                  href={`/docs/${tool.id}`}
                  aria-label={`Open ${tool.name} docs`}
                  className="absolute top-3 right-3 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Open docs"
                >
                  <BookOpen className="w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Supercharge Your Development?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of developers who trust DevToolsHub for their daily development needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/sign-in" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Get Started Free
            </Link>
            <Link 
              href="mailto:contactme@devtoolskithub.com" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="/icons/icon-192x192.png"
                  alt="DevToolsHub icon"
                  className="w-8 h-8 rounded-lg object-contain bg-white"
                  width={32}
                  height={32}
                />
                <span className="text-xl font-bold">DevToolsHub</span>
              </div>
              <p className="text-gray-400">
                Essential developer tools for modern web development.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Available Tools</h3>
              <ul className="space-y-2 text-gray-400">
                {tools.map(tool => (
                  <li key={tool.id}><Link href={tool.path} className="hover:text-white transition-colors">{tool.name}</Link></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="https://github.com/swkruger/devtoolshub" className="hover:text-white transition-colors">GitHub</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="mailto:contactme@devtoolskithub.com" className="hover:text-white transition-colors">
                    contactme@devtoolskithub.com
                  </a>
                </li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/feedback" className="hover:text-white transition-colors">Feedback</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 DevToolsHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 