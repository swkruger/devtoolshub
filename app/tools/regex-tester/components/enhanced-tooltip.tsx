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
  showPremiumBadge?: boolean
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
  position = 'bottom',
  showPremiumBadge = false
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

  useEffect(() => {
    return () => {
      if (showDelay) clearTimeout(showDelay)
      if (hideDelay) clearTimeout(hideDelay)
    }
  }, [showDelay, hideDelay])

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  }

  return (
    <div 
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${positionClasses[position]} left-1/2 transform -translate-x-1/2`}
          style={{ minWidth: '320px', maxWidth: '400px' }}
        >
          <Card className="shadow-lg border-2 bg-white dark:bg-gray-900">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    {title}
                    {(isPremium || showPremiumBadge) && !isBackerUser && (
                      <Crown className="h-3 w-3 text-amber-500" />
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {description}
                  </CardDescription>
                </div>
                {shortcut && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    <Keyboard className="h-3 w-3" />
                    {shortcut}
                  </div>
                )}
              </div>
            </CardHeader>
            
            {(examples.length > 0 || tips.length > 0) && (
              <CardContent className="pt-0 space-y-3">
                {examples.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Examples
                    </h4>
                    <ul className="space-y-1">
                      {examples.map((example, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-primary font-mono">•</span>
                          <span className="flex-1">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {tips.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <HelpCircle className="h-3 w-3" />
                      Tips
                    </h4>
                    <ul className="space-y-1">
                      {tips.map((tip, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-amber-500 font-mono">💡</span>
                          <span className="flex-1">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

// Predefined tooltip configurations for common regex tester actions
export const tooltipConfigs = {
  testPattern: {
    title: "Test Regex Pattern",
    description: "Execute the regex pattern against your test text",
    shortcut: "Ctrl+Enter",
    examples: [
      "Test email validation patterns",
      "Validate phone number formats",
      "Extract specific text patterns"
    ],
    tips: [
      "Use flags to modify pattern behavior",
      "Empty pattern will clear results",
      "Real-time testing for instant feedback"
    ]
  },
  loadSample: {
    title: "Load Sample Pattern",
    description: "Load a pre-built regex pattern with test data",
    shortcut: "Ctrl+L",
    examples: [
      "Email validation pattern",
      "URL extraction pattern",
      "Phone number patterns"
    ],
    tips: [
      "Great starting point for learning",
      "Modify samples to fit your needs",
      "Study pattern structure"
    ]
  },
  copyMatches: {
    title: "Copy Matches",
    description: "Copy all matches to clipboard",
    shortcut: "Ctrl+C",
    examples: [
      "Copy extracted email addresses",
      "Export matched phone numbers",
      "Save pattern results"
    ],
    tips: [
      "Includes capture groups if present",
      "Format: one match per line",
      "Perfect for data extraction"
    ]
  },
  languageSelect: {
    title: "Regex Language",
    description: "Choose the programming language regex engine",
    examples: [
      "JavaScript (default, free)",
      "Python (premium)",
      "Java (premium)",
      "Go (premium)"
    ],
    tips: [
      "Each language has different features",
      "Some patterns work differently",
      "Premium languages include limitations"
    ]
  }
} 