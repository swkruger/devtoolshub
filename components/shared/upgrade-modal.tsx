"use client"

import { useState } from "react"
import { Crown, X, Check, Sparkles, Zap, Shield, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature?: string
  context?: 'json-formatter' | 'general'
}

const PREMIUM_BENEFITS = {
  'json-formatter': [
    { icon: Zap, title: "File Upload/Download", description: "Upload JSON files up to 5MB and download formatted results" },
    { icon: Sparkles, title: "Format Conversion", description: "Convert JSON to XML, CSV, YAML, and JavaScript objects" },
    { icon: Shield, title: "Tree Visualization", description: "Interactive tree view with collapsible nodes" },
    { icon: Clock, title: "Snippet Management", description: "Save and organize unlimited JSON snippets online" }
  ],
  'general': [
    { icon: Zap, title: "Advanced Features", description: "Access all premium tools and functionality" },
    { icon: Sparkles, title: "Enhanced Performance", description: "Faster processing and larger file support" },
    { icon: Shield, title: "Priority Support", description: "Get help when you need it most" },
    { icon: Clock, title: "Data Sync", description: "Save your work across all devices" }
  ]
}

export function UpgradeModal({ isOpen, onClose, feature, context = 'general' }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  if (!isOpen) return null

  const benefits = PREMIUM_BENEFITS[context]
  
  const handleUpgrade = async () => {
    setIsLoading(true)
    // TODO: Implement actual upgrade flow
    setTimeout(() => {
      setIsLoading(false)
      onClose()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto relative animate-in fade-in-0 zoom-in-95 duration-300">
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
        
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl font-bold">
            {feature ? `Unlock ${feature}` : 'Upgrade to Premium'}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {feature 
              ? `${feature} is a premium feature. Upgrade now to access it along with all other premium tools.`
              : 'Get access to all premium features and enhance your development workflow.'
            }
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Benefits List */}
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                  <benefit.icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">{benefit.title}</h4>
                  <p className="text-xs text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pricing */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">$9</span>
                <span className="text-sm text-amber-600 dark:text-amber-500">/month</span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                Cancel anytime • 30-day money-back guarantee
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </>
              )}
            </Button>
            
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-muted-foreground"
            >
              Maybe later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 