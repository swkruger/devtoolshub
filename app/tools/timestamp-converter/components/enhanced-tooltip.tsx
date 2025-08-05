"use client"

import { useState, useRef, useEffect } from "react"
import { Crown, HelpCircle, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface EnhancedTooltipProps {
  children: React.ReactNode
  content: React.ReactNode | string
  examples?: string[]
  tips?: string[]
  showPremiumBadge?: boolean
  position?: "top" | "right" | "bottom" | "left"
  title?: string
  description?: string
}

export function EnhancedTooltip({
  children,
  content,
  examples = [],
  tips = [],
  showPremiumBadge = false,
  position = "bottom",
  title,
  description
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

  // Simple tooltip for basic content
  if (!title && !description && examples.length === 0 && tips.length === 0) {
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
            className={`absolute z-50 ${positionClasses[position]} left-1/2 transform -translate-x-1/2`}
          >
            <div className="px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg whitespace-nowrap">
              {content}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Enhanced tooltip with card layout
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
          style={{ minWidth: '280px', maxWidth: '400px' }}
        >
          <Card className="shadow-lg border-2 bg-white dark:bg-gray-900">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    {title || "Information"}
                    {showPremiumBadge && (
                      <Crown className="h-3 w-3 text-amber-500" />
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {description || content}
                  </CardDescription>
                </div>
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