"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { HelpCircle, TestTube } from "lucide-react"
import { JsonEditor } from "./json-editor"
import { HelpPanel } from "./help-panel"
import { EnhancedTooltip, tooltipConfigs } from "./enhanced-tooltip"
import { useKeyboardShortcuts, useShortcutToast } from "../hooks/use-keyboard-shortcuts"
import Link from "next/link"

interface JsonFormatterClientProps {
  isBackerUser: boolean
  userId?: string
}

export function JsonFormatterClient({ isBackerUser, userId }: JsonFormatterClientProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  // Listen for help panel events from JsonEditor
  useEffect(() => {
    const handleHelpEvent = (event: CustomEvent) => {
      if (event.detail.action === 'open') {
        setIsHelpOpen(true)
      }
    }

    window.addEventListener('json-formatter-help', handleHelpEvent as EventListener)
    return () => {
      window.removeEventListener('json-formatter-help', handleHelpEvent as EventListener)
    }
  }, [])

  // Set up keyboard shortcuts for help panel only (JsonEditor handles the rest)
  useKeyboardShortcuts({
    onFormat: () => {}, // Handled by JsonEditor
    onCompact: () => {}, // Handled by JsonEditor  
    onSort: () => {}, // Handled by JsonEditor
    onRepair: () => {}, // Handled by JsonEditor
    onCopy: () => {}, // Handled by JsonEditor
    onUpload: () => {}, // Handled by JsonEditor
    onDownload: () => {}, // Handled by JsonEditor
    onSaveSnippet: () => {}, // Handled by JsonEditor
    onToggleTreeView: () => {}, // Handled by JsonEditor
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
          {/* Test Suite Link */}
          <Link href="/tools/json-formatter/test">
            <EnhancedTooltip
              title="Test Suite"
              description="Run comprehensive tests to validate JSON formatter functionality"
              examples={[
                'Test various JSON structures',
                'Validate format conversions',
                'Check responsive design'
              ]}
              tips={[
                'Use for debugging issues',
                'Verify feature compatibility',
                'Test performance with large files'
              ]}
            >
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Test Suite
              </Button>
            </EnhancedTooltip>
          </Link>

          {/* Help Button */}
          <EnhancedTooltip
            title="Help & Documentation"
            description="Access comprehensive help, examples, and keyboard shortcuts"
            shortcut="F1"
            examples={[
              'JSON structure examples',
              'Format conversion guides',
              'Keyboard shortcuts reference'
            ]}
            tips={[
              'Available from anywhere using F1',
              'Includes accessibility features',
              'Context-sensitive help'
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
      <JsonEditor 
        isBackerUser={isBackerUser} 
        userId={userId}
      />

      {/* Help Panel */}
      <HelpPanel 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        isBackerUser={isBackerUser}
      />

      {/* Accessibility improvements */}
      <div className="sr-only" aria-live="polite" id="json-formatter-announcements">
        {/* Screen reader announcements will be inserted here */}
      </div>
    </div>
  )
} 