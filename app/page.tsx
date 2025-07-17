import Link from 'next/link'
import { authServer } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  // Check if user is already authenticated
  const user = await authServer.getUser()
  if (user) {
    redirect('/dashboard')
  }

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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">DevToolsHub</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link 
                href="https://github.com/yourusername/devtools-hub" 
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
            From JSON formatting to regex testing, we&apos;ve got everything you need to code faster and better.
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Professional Developer Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for modern web development, API testing, and data manipulation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* JSON Formatter */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-blue-600 text-xl">📄</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">JSON Formatter</h3>
                  <p className="text-sm text-gray-500">Free</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Format, validate, and beautify JSON data with syntax highlighting and error detection.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Syntax highlighting
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Error validation
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Tree view
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Minify/Beautify
                </div>
              </div>
            </div>

            {/* Regex Tester */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-green-600 text-xl">🔍</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Regex Tester</h3>
                  <p className="text-sm text-gray-500">Free</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Test and debug regular expressions with real-time matching and detailed explanations.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Real-time testing
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Pattern explanation
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Multiple engines
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Visual regex builder
                </div>
              </div>
            </div>

            {/* JWT Decoder */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-purple-600 text-xl">🔐</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">JWT Decoder</h3>
                  <p className="text-sm text-gray-500">Free</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Decode and inspect JWT tokens with detailed header and payload analysis.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Token validation
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Header inspection
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Payload analysis
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Signature verification
                </div>
              </div>
            </div>

            {/* Base64 Encoder/Decoder */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-orange-600 text-xl">🔢</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Base64 Tools</h3>
                  <p className="text-sm text-gray-500">Free</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Encode and decode Base64 strings with support for various character encodings.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Encode/Decode
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  File support
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  URL safe mode
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Multiple encodings
                </div>
              </div>
            </div>

            {/* Image Compressor */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-pink-600 text-xl">🖼️</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Image Compressor</h3>
                  <p className="text-sm text-gray-500">Free</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Compress images while maintaining quality for faster web performance.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Multiple formats
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Quality control
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Batch processing
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Size optimization
                </div>
              </div>
            </div>

            {/* UUID Generator */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-indigo-600 text-xl">🆔</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">UUID Generator</h3>
                  <p className="text-sm text-gray-500">Free</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Generate UUIDs in various formats with customization options.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Multiple versions
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Custom formats
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Bulk generation
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Copy to clipboard
                </div>
              </div>
            </div>

            {/* Timestamp Converter */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-yellow-600 text-xl">⏰</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Timestamp Converter</h3>
                  <p className="text-sm text-gray-500">Free</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Convert between timestamps, dates, and various time formats.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Unix timestamps
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  ISO 8601 format
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Multiple timezones
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Relative time
                </div>
              </div>
            </div>

            {/* Markdown Previewer */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-teal-600 text-xl">📝</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Markdown Previewer</h3>
                  <p className="text-sm text-gray-500">Free</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Write and preview Markdown with real-time rendering and syntax highlighting.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Live preview
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Syntax highlighting
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Export options
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Custom themes
                </div>
              </div>
            </div>
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
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <span className="text-xl font-bold">DevToolsHub</span>
              </div>
              <p className="text-gray-400">
                Essential developer tools for modern web development.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Tools</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/tools/json-formatter" className="hover:text-white transition-colors">JSON Formatter</Link></li>
                <li><Link href="/tools/regex-tester" className="hover:text-white transition-colors">Regex Tester</Link></li>
                <li><Link href="/tools/jwt-decoder" className="hover:text-white transition-colors">JWT Decoder</Link></li>
                <li><Link href="/tools/base64" className="hover:text-white transition-colors">Base64 Tools</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="https://github.com/yourusername/devtools-hub" className="hover:text-white transition-colors">GitHub</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">API Reference</Link></li>
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
            <p>&copy; 2024 DevToolsHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 