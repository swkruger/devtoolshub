"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Keyboard, Info, HelpCircle } from "lucide-react"

interface EnhancedTooltipProps {
  title: string
  description: string
  shortcut?: string
  isPremium?: boolean
  isBackerUser?: boolean
  examples?: string[]
  tips?: string[]
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function EnhancedTooltip({
  title,
  description,
  shortcut,
  isPremium = false,
  isBackerUser = false,
  examples = [],
  tips = [],
  children,
  position = 'bottom'
}: EnhancedTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showDelay, setShowDelay] = useState<NodeJS.Timeout | null>(null)
  const [hideDelay, setHideDelay] = useState<NodeJS.Timeout | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const showTooltip = () => {
    if (hideDelay) {
      clearTimeout(hideDelay)
      setHideDelay(null)
    }
    if (!showDelay) {
      const delay = setTimeout(() => {
        setIsVisible(true)
      }, 300)
      setShowDelay(delay)
    }
  }

  const hideTooltip = () => {
    if (showDelay) {
      clearTimeout(showDelay)
      setShowDelay(null)
    }
    if (!hideDelay) {
      const delay = setTimeout(() => {
        setIsVisible(false)
      }, 100)
      setHideDelay(delay)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsVisible(false)
    }
  }

  useEffect(() => {
    return () => {
      if (showDelay) clearTimeout(showDelay)
      if (hideDelay) clearTimeout(hideDelay)
    }
  }, [showDelay, hideDelay])

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2'
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2'
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2'
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2'
      default:
        return 'top-full left-1/2 -translate-x-1/2 mt-2'
    }
  }

  return (
    <div 
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onKeyDown={handleKeyDown}
    >
      {children}
      
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`absolute z-50 w-80 ${getPositionClasses()}`}
          role="tooltip"
          aria-describedby="tooltip-description"
        >
          <Card className="shadow-lg border-2 animate-in fade-in-0 zoom-in-95 duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  {isPremium && <Crown className="w-3 h-3 text-amber-500" />}
                  {title}
                </CardTitle>
                {shortcut && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Keyboard className="w-3 h-3" />
                    <kbd className="px-1 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                      {shortcut}
                    </kbd>
                  </div>
                )}
              </div>
              <CardDescription id="tooltip-description" className="text-xs">
                {description}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0 space-y-3">
              {/* Backer Status */}
              {isPremium && (
                <div className={`p-2 rounded-lg text-xs ${
                  isBackerUser
                    ? 'bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                    : 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-3 h-3" />
                    <span className="font-medium">
                      {isBackerUser ? 'Backer Feature' : 'Backer Required'}
                    </span>
                  </div>
                  <p>
                    {isBackerUser 
                      ? 'You have access to this backer feature.' 
                      : 'Become a backer to unlock this feature.'}
                  </p>
                </div>
              )}

              {/* Examples */}
              {examples.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3 h-3 text-blue-500" />
                    <span className="text-xs font-medium">Examples</span>
                  </div>
                  <ul className="space-y-1">
                    {examples.map((example, index) => (
                      <li key={index} className="text-xs text-gray-600 dark:text-gray-400 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tips */}
              {tips.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="w-3 h-3 text-green-500" />
                    <span className="text-xs font-medium">Tips</span>
                  </div>
                  <ul className="space-y-1">
                    {tips.map((tip, index) => (
                      <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <div className="w-1 h-1 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Accessibility note */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Press <kbd className="px-1 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">Esc</kbd> to close this tooltip
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Predefined tooltip configurations for common features
export const tooltipConfigs = {
  format: {
    title: 'Format JSON',
    description: 'Beautify and properly indent your JSON with consistent formatting',
    shortcut: 'Ctrl+F',
    examples: [
      'Adds proper indentation and spacing',
      'Organizes nested objects clearly',
      'Makes JSON human-readable'
    ],
    tips: [
      'Use 2-space indentation by default',
      'Preserves data types and structure',
      'Works with any valid JSON input'
    ]
  },
  compact: {
    title: 'Compact JSON',
    description: 'Minify JSON by removing all unnecessary whitespace',
    shortcut: 'Ctrl+M',
    examples: [
      'Removes all spaces and line breaks',
      'Reduces file size significantly',
      'Ideal for production environments'
    ],
    tips: [
      'Great for API responses',
      'Reduces bandwidth usage',
      'Maintains JSON validity'
    ]
  },
  sort: {
    title: 'Sort Keys',
    description: 'Alphabetically sort object keys for better organization',
    shortcut: 'Ctrl+Shift+S',
    examples: [
      'Sorts keys in ascending order',
      'Maintains nested structure',
      'Improves readability'
    ],
    tips: [
      'Helps with version control diffs',
      'Makes object comparison easier',
      'Preserves array order'
    ]
  },
  repair: {
    title: 'Repair JSON',
    description: 'Automatically fix common JSON syntax errors',
    shortcut: 'Ctrl+R',
    examples: [
      'Fixes trailing commas',
      'Converts single to double quotes',
      'Adds missing quotes to keys'
    ],
    tips: [
      'Handles JavaScript object notation',
      'Removes comments from JSON',
      'Fixes most common mistakes'
    ]
  },
  upload: {
    title: 'Upload File',
    description: 'Upload JSON files from your computer',
    shortcut: 'Ctrl+O',
    isPremium: true,
    examples: [
      'Drag and drop files',
      'Supports files up to 5MB',
      'Validates on upload'
    ],
    tips: [
      'Supports .json, .txt files',
      'Shows progress for large files',
      'Automatic validation after upload'
    ]
  },
  download: {
    title: 'Download File',
    description: 'Save your JSON as a file to your computer',
    shortcut: 'Ctrl+D',
    isPremium: true,
    examples: [
      'Downloads with .json extension',
      'Preserves formatting',
      'Customizable filename'
    ],
    tips: [
      'Automatically formats before download',
      'Includes timestamp in filename',
      'Works with any browser'
    ]
  },
  treeView: {
    title: 'Tree View',
    description: 'Interactive collapsible tree visualization of JSON structure',
    shortcut: 'Ctrl+T',
    isPremium: true,
    examples: [
      'Expandable/collapsible nodes',
      'Visual hierarchy display',
      'Quick navigation through structure'
    ],
    tips: [
      'Great for exploring complex JSON',
      'Click to expand/collapse sections',
      'Shows data types and values'
    ]
  },
  snippets: {
    title: 'Save Snippet',
    description: 'Save JSON snippets to your account for later use',
    shortcut: 'Ctrl+S',
    isPremium: true,
    examples: [
      'Personal snippet library',
      'Organized by categories',
      'Quick access to common patterns'
    ],
    tips: [
      'Add descriptive names',
      'Use categories for organization',
      'Sync across devices'
    ]
  },
  convert: {
    title: 'Format Conversion',
    description: 'Convert JSON to other formats like XML, CSV, YAML',
    isPremium: true,
    examples: [
      'JSON to XML with proper structure',
      'JSON to CSV with flattened keys',
      'JSON to YAML with indentation'
    ],
    tips: [
      'Preserves data structure',
      'Handles nested objects',
      'Bidirectional conversion'
    ]
  }
} 