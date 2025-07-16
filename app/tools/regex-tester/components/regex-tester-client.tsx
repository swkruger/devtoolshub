"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { HelpCircle, TestTube } from "lucide-react"
import { RegexEditor } from "./regex-editor"
import { HelpPanel } from "./help-panel"
import { EnhancedTooltip } from "./enhanced-tooltip"
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts"

interface RegexTesterClientProps {
  user: any
  isPremiumUser: boolean
}

export function RegexTesterClient({ user, isPremiumUser }: RegexTesterClientProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  // Listen for help panel events from RegexEditor
  useEffect(() => {
    const handleHelpEvent = (event: CustomEvent) => {
      if (event.detail.action === 'open') {
        setIsHelpOpen(true)
      }
    }

    window.addEventListener('regex-tester-help', handleHelpEvent as EventListener)
    return () => {
      window.removeEventListener('regex-tester-help', handleHelpEvent as EventListener)
    }
  }, [])

  // Set up keyboard shortcuts for help panel and delegating actions to RegexEditor
  useKeyboardShortcuts({
    onTestPattern: () => {
      window.dispatchEvent(new CustomEvent('regex-editor-action', { detail: { action: 'test' } }))
    },
    onLoadSample: () => {
      window.dispatchEvent(new CustomEvent('regex-editor-action', { detail: { action: 'loadSample' } }))
    },
    onCopyMatches: () => {
      window.dispatchEvent(new CustomEvent('regex-editor-action', { detail: { action: 'copyMatches' } }))
    },
    onClearAll: () => {
      window.dispatchEvent(new CustomEvent('regex-editor-action', { detail: { action: 'clearAll' } }))
    },
    onShowHelp: () => {
      setIsHelpOpen(true)
    },
    onEscape: () => {
      if (isHelpOpen) {
        setIsHelpOpen(false)
      }
    }
  })

  return (
    <div className="relative">
      {/* Header with help button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Press <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">F1</kbd> for help and keyboard shortcuts
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Help Button */}
          <EnhancedTooltip
            title="Help & Documentation"
            description="Access comprehensive help, regex patterns, and keyboard shortcuts"
            shortcut="F1"
            examples={[
              'Regex syntax reference',
              'Common pattern examples',
              'Multi-language support guide'
            ]}
            tips={[
              'Available from anywhere using F1',
              'Includes keyboard shortcuts',
              'Language-specific features'
            ]}
          >
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsHelpOpen(true)}
              className="flex items-center gap-2"
              aria-label="Open help panel"
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </Button>
          </EnhancedTooltip>
        </div>
      </div>

      {/* Main Editor */}
      <RegexEditor 
        isPremiumUser={isPremiumUser} 
        userId={user?.id}
      />

      {/* Help Panel */}
      <HelpPanel 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        isPremiumUser={isPremiumUser}
      />

      {/* Accessibility improvements */}
      <div className="sr-only" aria-live="polite" id="regex-tester-announcements">
        {/* Screen reader announcements will be inserted here */}
      </div>
    </div>
  )
} 