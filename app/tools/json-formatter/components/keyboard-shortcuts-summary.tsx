"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Keyboard } from "lucide-react"

interface KeyboardShortcutsSummaryProps {
  isPremiumUser: boolean
}

export function KeyboardShortcutsSummary({ isPremiumUser }: KeyboardShortcutsSummaryProps) {
  const shortcuts = [
    {
      key: 'Ctrl + F',
      action: 'Format JSON',
      description: 'Beautify and indent JSON with proper formatting',
      implemented: true,
      premium: false
    },
    {
      key: 'Ctrl + M',
      action: 'Compact JSON',
      description: 'Minify JSON by removing whitespace',
      implemented: true,
      premium: false
    },
    {
      key: 'Ctrl + R',
      action: 'Repair JSON',
      description: 'Automatically fix common JSON errors',
      implemented: true,
      premium: false
    },
    {
      key: 'Ctrl + L',
      action: 'Load Sample',
      description: 'Load sample JSON data to test with',
      implemented: true,
      premium: false
    },
    {
      key: 'Alt + C',
      action: 'Copy Content',
      description: 'Copy JSON content to clipboard',
      implemented: true,
      premium: false
    },
    {
      key: 'Ctrl + Shift + S',
      action: 'Sort Keys A-Z',
      description: 'Sort object keys alphabetically (ascending)',
      implemented: true,
      premium: false
    },
    {
      key: 'Ctrl + Shift + A',
      action: 'Sort Keys Z-A',
      description: 'Sort object keys alphabetically (descending)',
      implemented: true,
      premium: false
    },
    {
      key: 'Alt + S',
      action: 'Save Snippet',
      description: 'Save current JSON as a snippet',
      implemented: true,
      premium: true
    },
    {
      key: 'Alt + L',
      action: 'Load Snippet',
      description: 'Load a saved JSON snippet',
      implemented: true,
      premium: true
    },
    {
      key: 'Ctrl + O',
      action: 'Upload File',
      description: 'Upload JSON file from disk',
      implemented: true,
      premium: false
    },
    {
      key: 'Alt + D',
      action: 'Download File',
      description: 'Download JSON as file',
      implemented: true,
      premium: true
    },
    {
      key: 'Alt + T',
      action: 'Toggle Tree View',
      description: 'Show/hide tree visualization',
      implemented: true,
      premium: true
    },
    {
      key: 'F1',
      action: 'Show Help',
      description: 'Open help panel with examples and tips',
      implemented: true,
      premium: false
    },
    {
      key: 'Esc',
      action: 'Close Dialogs',
      description: 'Close help panel or other open dialogs',
      implemented: true,
      premium: false
    }
  ]

  const implementedShortcuts = shortcuts.filter(s => s.implemented)
  const freeShortcuts = implementedShortcuts.filter(s => !s.premium)
  const premiumShortcuts = implementedShortcuts.filter(s => s.premium)

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Keyboard className="w-5 h-5" />
          Implemented Keyboard Shortcuts
        </CardTitle>
        <CardDescription>
          All keyboard shortcuts are now fully functional - conflicts with browser defaults resolved
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Free Shortcuts */}
        <div>
          <h3 className="font-semibold text-sm mb-3 text-green-700 dark:text-green-400">
            Free Features ({freeShortcuts.length} shortcuts)
          </h3>
          <div className="space-y-2">
            {freeShortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-1 text-xs font-mono bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded">
                    {shortcut.key}
                  </kbd>
                  <div>
                    <span className="font-medium text-sm">{shortcut.action}</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{shortcut.description}</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Shortcuts */}
        <div>
          <h3 className="font-semibold text-sm mb-3 text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Premium Features ({premiumShortcuts.length} shortcuts)
          </h3>
          <div className="space-y-2">
            {premiumShortcuts.map((shortcut, index) => (
              <div key={index} className={`flex items-center justify-between p-2 rounded-lg border ${
                isPremiumUser 
                  ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' 
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 opacity-60'
              }`}>
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-1 text-xs font-mono bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded">
                    {shortcut.key}
                  </kbd>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{shortcut.action}</span>
                      <Crown className="w-3 h-3 text-amber-500" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{shortcut.description}</p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  isPremiumUser ? 'bg-amber-500' : 'bg-gray-400'
                }`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Implementation Status */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Implementation Status:
            </span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {implementedShortcuts.length}/{shortcuts.length} shortcuts active
            </span>
          </div>
          <div className="mt-2 bg-green-100 dark:bg-green-950/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${(implementedShortcuts.length / shortcuts.length) * 100}%` }}
            />
          </div>
        </div>

        {!isPremiumUser && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              <span className="font-medium">Premium shortcuts</span> will show upgrade prompts when used. 
              All keyboard shortcuts are fully functional!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 