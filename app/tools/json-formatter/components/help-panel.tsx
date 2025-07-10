"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  HelpCircle, 
  X, 
  Keyboard, 
  BookOpen, 
  Lightbulb, 
  Code, 
  FileText,
  Crown,
  Upload,
  Download,
  RefreshCw,
  Copy,
  TreePine,
  Save,
  Wrench
} from "lucide-react"

interface HelpPanelProps {
  isOpen: boolean
  onClose: () => void
  isPremiumUser: boolean
}

export function HelpPanel({ isOpen, onClose, isPremiumUser }: HelpPanelProps) {
  const [activeTab, setActiveTab] = useState<'examples' | 'shortcuts' | 'tips' | 'accessibility'>('examples')

  if (!isOpen) return null

  const keyboardShortcuts = [
    { key: 'Ctrl + F', action: 'Format JSON', description: 'Beautify and indent JSON with proper formatting' },
    { key: 'Ctrl + M', action: 'Compact JSON', description: 'Minify JSON by removing whitespace' },
    { key: 'Ctrl + R', action: 'Repair JSON', description: 'Automatically fix common JSON errors' },
    { key: 'Ctrl + L', action: 'Load Sample', description: 'Load sample JSON data to test with' },
    { key: 'Alt + C', action: 'Copy Content', description: 'Copy JSON content to clipboard' },
    { key: 'Ctrl + Shift + S', action: 'Sort Keys A-Z', description: 'Sort object keys alphabetically (ascending)' },
    { key: 'Ctrl + Shift + A', action: 'Sort Keys Z-A', description: 'Sort object keys alphabetically (descending)' },
    { key: 'Alt + S', action: 'Save Snippet', description: 'Save current JSON as a snippet (Premium)', premium: true },
    { key: 'Alt + L', action: 'Load Snippet', description: 'Load a saved JSON snippet (Premium)', premium: true },
    { key: 'Ctrl + O', action: 'Upload File', description: 'Upload JSON file from disk' },
    { key: 'Alt + D', action: 'Download File', description: 'Download JSON as file (Premium)', premium: true },
    { key: 'Alt + T', action: 'Tree View', description: 'Toggle tree visualization (Premium)', premium: true },
    { key: 'F1', action: 'Show Help', description: 'Open this help panel' },
    { key: 'Esc', action: 'Close Dialogs', description: 'Close help panel or other dialogs' }
  ]

  const jsonExamples = {
    basic: {
      title: 'Basic JSON Structure',
      description: 'Simple object with different data types',
      code: `{
  "name": "John Doe",
  "age": 30,
  "isActive": true,
  "email": "john@example.com",
  "skills": ["JavaScript", "React", "Node.js"],
  "address": null
}`
    },
    nested: {
      title: 'Nested Objects',
      description: 'Complex structure with nested objects and arrays',
      code: `{
  "user": {
    "id": 12345,
    "profile": {
      "name": "Jane Smith",
      "avatar": "https://example.com/avatar.jpg",
      "preferences": {
        "theme": "dark",
        "notifications": {
          "email": true,
          "push": false,
          "sms": true
        }
      }
    },
    "posts": [
      {
        "id": 1,
        "title": "My First Post",
        "tags": ["tech", "javascript"],
        "publishedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}`
    },
    api: {
      title: 'API Response Example',
      description: 'Typical REST API response structure',
      code: `{
  "status": "success",
  "data": {
    "users": [
      {
        "id": 1,
        "username": "alice_dev",
        "email": "alice@dev.com",
        "roles": ["developer", "admin"],
        "lastLogin": "2024-12-28T14:30:00Z",
        "metadata": {
          "loginCount": 42,
          "preferences": {
            "language": "en",
            "timezone": "UTC"
          }
        }
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "hasMore": true
  },
  "timestamp": "2024-12-28T15:45:30Z"
}`
    }
  }

  const tips = [
    {
      icon: <Lightbulb className="w-5 h-5 text-yellow-500" />,
      title: 'Validation Tips',
      items: [
        'Use double quotes for strings, not single quotes',
        'Remove trailing commas after the last array/object item',
        'Escape special characters in strings (\\n, \\t, \\", \\\\)',
        'Use null instead of undefined for missing values'
      ]
    },
    {
      icon: <Wrench className="w-5 h-5 text-blue-500" />,
      title: 'Repair Function',
      items: [
        'Automatically fixes trailing commas',
        'Converts single quotes to double quotes',
        'Adds quotes to unquoted property names',
        'Removes JavaScript comments from JSON'
      ]
    },
    {
      icon: <Code className="w-5 h-5 text-green-500" />,
      title: 'Performance Tips',
      items: [
        'Large files (50KB+) may be slower to validate',
        'Use compact format for smaller file sizes',
        'Sort keys for better diff comparison',
        'Premium users can handle files up to 5MB'
      ]
    },
    {
      icon: <Crown className="w-5 h-5 text-amber-500" />,
      title: 'Premium Features',
      items: [
        'Upload and download JSON files',
        'Convert JSON to XML, CSV, YAML formats',
        'Interactive tree view for complex structures',
        'Save and manage JSON snippets online'
      ]
    }
  ]

  const accessibilityFeatures = [
    {
      feature: 'Keyboard Navigation',
      description: 'All buttons and controls can be accessed using keyboard shortcuts',
      implementation: 'Tab navigation, Enter/Space activation, Escape to close dialogs'
    },
    {
      feature: 'Screen Reader Support',
      description: 'ARIA labels and descriptions for all interactive elements',
      implementation: 'aria-label, aria-describedby, role attributes'
    },
    {
      feature: 'Error Announcements',
      description: 'JSON validation errors are announced to screen readers',
      implementation: 'aria-live regions for dynamic content updates'
    },
    {
      feature: 'Focus Management',
      description: 'Logical focus order and visible focus indicators',
      implementation: 'Focus trapping in modals, clear focus outlines'
    },
    {
      feature: 'High Contrast Support',
      description: 'Works well with high contrast themes and dark mode',
      implementation: 'Semantic colors, sufficient contrast ratios'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <CardTitle>JSON Formatter Help</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              aria-label="Close help panel"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4">
            <Button
              variant={activeTab === 'examples' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('examples')}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Examples
            </Button>
            <Button
              variant={activeTab === 'shortcuts' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('shortcuts')}
              className="flex items-center gap-2"
            >
              <Keyboard className="w-4 h-4" />
              Shortcuts
            </Button>
            <Button
              variant={activeTab === 'tips' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('tips')}
              className="flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              Tips
            </Button>
            <Button
              variant={activeTab === 'accessibility' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('accessibility')}
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Accessibility
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Examples Tab */}
          {activeTab === 'examples' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">JSON Examples & Usage</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Learn from these practical JSON examples. Click any example to load it in the editor.
                </p>
              </div>

              {Object.entries(jsonExamples).map(([key, example]) => (
                <Card key={key} className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{example.title}</CardTitle>
                    <CardDescription>{example.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{example.code}</code>
                    </pre>
                    <Button 
                      size="sm" 
                      className="mt-3"
                      onClick={() => {
                        // This would trigger loading the example in the main editor
                        // Implementation would depend on how the parent component handles it
                        console.log('Load example:', key)
                      }}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Load Example
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Keyboard Shortcuts Tab */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Speed up your workflow with these keyboard shortcuts. Updated to avoid conflicts with browser defaults.
                </p>
              </div>

              <div className="grid gap-3">
                {keyboardShortcuts.map((shortcut, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      shortcut.premium && !isPremiumUser 
                        ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20' 
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <kbd className="px-2 py-1 text-xs font-mono bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded">
                        {shortcut.key}
                      </kbd>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{shortcut.action}</span>
                          {shortcut.premium && (
                            <Crown className="w-3 h-3 text-amber-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {shortcut.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!isPremiumUser && (
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-amber-800 dark:text-amber-200">Premium Shortcuts</span>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Some shortcuts require a premium subscription for access to advanced features.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tips Tab */}
          {activeTab === 'tips' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Tips & Best Practices</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Master JSON editing with these helpful tips and best practices.
                </p>
              </div>

              {tips.map((section, index) => (
                <Card key={index} className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      {section.icon}
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Accessibility Tab */}
          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Accessibility Features</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  This tool is designed to be accessible to all users. Here are the accessibility features implemented:
                </p>
              </div>

              <div className="space-y-4">
                {accessibilityFeatures.map((feature, index) => (
                  <Card key={index} className="border">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold text-sm mb-2">{feature.feature}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {feature.description}
                      </p>
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                        <p className="text-xs font-mono">{feature.implementation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Need Assistance?</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  If you encounter any accessibility issues or need additional accommodations, 
                  please contact our support team for assistance.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 