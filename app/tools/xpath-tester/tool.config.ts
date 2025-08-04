import { Code } from "lucide-react"

export const xpathTesterConfig = {
  id: 'xpath-tester',
  name: 'XPath/CSS Selector Tester',
  description: 'Test XPath and CSS selectors against HTML with real-time highlighting, file upload, and advanced features. The best selector testing tool for developers.',
  shortDescription: 'Test XPath and CSS selectors against HTML',
  icon: Code,
  emoji: '🧪',
  isPremium: false,
  category: 'web' as const,
  tags: ['xpath', 'css', 'selector', 'html', 'xml', 'web-scraping', 'dom'],
  path: '/tools/xpath-tester',
  features: {
    free: [
      'XPath selector testing with real-time validation',
      'CSS selector testing with comprehensive browser support',
      'HTML input area with syntax highlighting',
      'Real-time match highlighting and result display',
      'Copy matches to clipboard functionality',
      'Sample HTML and selector examples',
      'Match count and details display',
      'Element hierarchy and attributes display',
      'Help panel with examples, shortcuts, tips',
      'Basic selector validation'
    ],
    premium: [
      'Upload HTML files with drag & drop support',
      'Test selectors against live URLs',
      'XPath 2.0/3.0 advanced functions',
      'CSS pseudo-selectors and combinators',
      'Selector validation and optimization',
      'Performance metrics and timing',
      'Bulk testing multiple selectors',
      'Export results as CSV/JSON',
      'Save and manage custom selectors',
      'Categorized selector examples',
      'Import/export selector collections',
      'Advanced match analytics',
      'Premium keyboard shortcuts',
      'File validation and error handling'
    ]
  }
} 