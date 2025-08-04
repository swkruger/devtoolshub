import Link from 'next/link'
import { authServer } from '@/lib/auth'
import { redirect } from 'next/navigation'

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
            6 powerful tools available now, with more coming soon. Everything you need to code faster and better.
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
            {/* JSON Formatter - AVAILABLE */}
            <Link href="/tools/json-formatter" className="group">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-blue-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-xl">📄</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">JSON Formatter</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600 font-medium">✅ Available</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Format, validate, and beautify JSON data with syntax highlighting, tree view, and advanced features.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Real-time syntax highlighting
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Error validation & repair
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Interactive tree view
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Format conversion (XML, CSV, YAML)
                  </div>
                </div>
              </div>
            </Link>

            {/* Regex Tester - AVAILABLE */}
            <Link href="/tools/regex-tester" className="group">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-green-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-green-600 text-xl">🔍</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Regex Tester</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600 font-medium">✅ Available</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Test regular expressions with real-time matching, multi-language support, and pattern visualization.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Live pattern matching & highlighting
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Multi-language engines (JS, Python, Java, Go)
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Pattern explanation & visualization
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    100+ pattern library
                  </div>
                </div>
              </div>
            </Link>

            {/* JWT Decoder - AVAILABLE */}
            <Link href="/tools/jwt-decoder" className="group">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-purple-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-purple-600 text-xl">🔐</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">JWT Decoder/Encoder</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600 font-medium">✅ Available</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Decode, encode, and verify JWT tokens with comprehensive header and payload analysis.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Token decode/encode with validation
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Signature verification & creation
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Claims inspection & explanation
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Bulk processing & management
                  </div>
                </div>
              </div>
            </Link>

            {/* Image Compressor - AVAILABLE */}
            <Link href="/tools/image-compressor" className="group">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-pink-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-pink-600 text-xl">📸</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Image Compressor</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600 font-medium">✅ Available</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Compress and optimize images with advanced algorithms, format conversion, and batch processing.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Advanced compression algorithms
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Format conversion (WebP, AVIF, JPEG, PNG)
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Batch processing & bulk download
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Real-time preview & statistics
                  </div>
                </div>
              </div>
            </Link>

            {/* UUID Generator - AVAILABLE */}
            <Link href="/tools/uuid-generator" className="group">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-indigo-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-indigo-600 text-xl">🧬</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">UUID Generator</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600 font-medium">✅ Available</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Generate unique identifiers in multiple versions and formats with advanced customization options.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    UUID v1, v3, v4, v5 generation
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Multiple formats (standard, compact, base64)
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Bulk generation & export
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Namespace management & history
                  </div>
                </div>
              </div>
            </Link>

            {/* XPath/CSS Selector Tester - AVAILABLE */}
            <Link href="/tools/xpath-tester" className="group">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-teal-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-teal-600 text-xl">🧪</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">XPath/CSS Selector Tester</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600 font-medium">✅ Available</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Test XPath and CSS selectors against HTML with real-time highlighting and comprehensive features.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Real-time selector testing & highlighting
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Complete element highlighting
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    File upload & URL testing
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Export results & selector management
                  </div>
                </div>
              </div>
            </Link>

            {/* Timestamp Converter - COMING SOON */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 opacity-75">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-yellow-600 text-xl">⏰</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Timestamp Converter</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-orange-600 font-medium">🚧 Coming Soon</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Convert between timestamps, dates, and various time formats with timezone support.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">○</span>
                  Unix timestamp conversion
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">○</span>
                  ISO 8601 & custom formats
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">○</span>
                  Multiple timezone support
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">○</span>
                  Relative time calculations
                </div>
              </div>
            </div>

            {/* Base64 Encoder/Decoder - COMING SOON */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 opacity-75">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-orange-600 text-xl">🔄</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Base64 Encoder/Decoder</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-orange-600 font-medium">🚧 Coming Soon</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Encode and decode Base64 strings and files with support for various character encodings.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">○</span>
                  Text & file encoding/decoding
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">○</span>
                  URL-safe Base64 encoding
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">○</span>
                  Batch processing support
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">○</span>
                  Multiple encoding formats
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
              <h3 className="text-lg font-semibold mb-4">Available Tools</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/tools/json-formatter" className="hover:text-white transition-colors">JSON Formatter</Link></li>
                <li><Link href="/tools/regex-tester" className="hover:text-white transition-colors">Regex Tester</Link></li>
                <li><Link href="/tools/jwt-decoder" className="hover:text-white transition-colors">JWT Decoder</Link></li>
                <li><Link href="/tools/image-compressor" className="hover:text-white transition-colors">Image Compressor</Link></li>
                <li><Link href="/tools/uuid-generator" className="hover:text-white transition-colors">UUID Generator</Link></li>
                <li><Link href="/tools/xpath-tester" className="hover:text-white transition-colors">XPath/CSS Tester</Link></li>
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