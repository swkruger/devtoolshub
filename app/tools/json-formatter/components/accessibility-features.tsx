"use client"

import { useEffect, useRef } from "react"

interface AccessibilityFeaturesProps {
  jsonContent: string
  validationError?: string
  lastAction?: string
  isLoading?: boolean
  isPremiumUser?: boolean
}

export function AccessibilityFeatures({ 
  jsonContent, 
  validationError, 
  lastAction, 
  isLoading,
  isPremiumUser 
}: AccessibilityFeaturesProps) {
  const announcementRef = useRef<HTMLDivElement>(null)

  // Announce validation errors to screen readers
  useEffect(() => {
    if (validationError && announcementRef.current) {
      announcementRef.current.textContent = `JSON validation error: ${validationError}`
    }
  }, [validationError])

  // Announce successful actions to screen readers
  useEffect(() => {
    if (lastAction && announcementRef.current) {
      announcementRef.current.textContent = `Action completed: ${lastAction}`
    }
  }, [lastAction])

  // Announce loading states
  useEffect(() => {
    if (isLoading && announcementRef.current) {
      announcementRef.current.textContent = "Processing JSON, please wait..."
    }
  }, [isLoading])

  return (
    <>
      {/* Screen reader announcements */}
      <div 
        ref={announcementRef}
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
        role="status"
      />
      
      {/* JSON content summary for screen readers */}
      <div className="sr-only" aria-live="polite">
        {jsonContent && (
          <div>
            JSON content loaded. Length: {jsonContent.length} characters.
            {validationError ? ' Contains validation errors.' : ' Valid JSON.'}
          </div>
        )}
      </div>

      {/* Premium features announcement */}
      {!isPremiumUser && (
        <div className="sr-only">
          Note: Some features require a premium subscription. Premium features are marked with crown icons.
        </div>
      )}

      {/* Keyboard shortcuts reminder */}
      <div className="sr-only">
        Keyboard shortcuts available: Press F1 for help, Ctrl+F to format, Ctrl+M to compact, Ctrl+R to repair JSON.
      </div>
    </>
  )
}

// ARIA label helpers for consistent accessibility
export const ariaLabels = {
  editor: "JSON editor - Type or paste your JSON content here",
  formatButton: "Format JSON - Beautify and indent JSON content",
  compactButton: "Compact JSON - Remove whitespace and minimize size",
  sortButton: "Sort keys - Alphabetically sort object keys",
  repairButton: "Repair JSON - Fix common JSON syntax errors",
  copyButton: "Copy to clipboard - Copy JSON content to clipboard",
  uploadButton: "Upload file - Upload JSON file from computer",
  downloadButton: "Download file - Save JSON content as file",
  treeToggle: "Toggle tree view - Show or hide JSON structure tree",
  helpButton: "Open help panel - Show examples, tips, and keyboard shortcuts",
  closeButton: "Close dialog - Close the current dialog or panel",
  loadSample: "Load sample JSON - Load example JSON data into editor",
  clearContent: "Clear editor - Remove all content from the editor",
  validationStatus: "JSON validation status",
  premiumFeature: "Premium feature - Requires premium subscription",
  snippetSave: "Save snippet - Save current JSON as a reusable snippet",
  snippetLoad: "Load snippet - Load a previously saved JSON snippet",
  convertFormat: "Convert format - Convert JSON to other formats like XML or CSV"
}

// Focus management utilities
export const focusManagement = {
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    return () => container.removeEventListener('keydown', handleTabKey)
  },

  focusFirst: (container: HTMLElement) => {
    const firstFocusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement
    firstFocusable?.focus()
  },

  restoreFocus: (previousElement: HTMLElement) => {
    previousElement?.focus()
  }
}

// High contrast and color accessibility
export const colorAccessibility = {
  getContrastClass: (isDark: boolean) => ({
    text: isDark ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-700',
    background: isDark ? 'bg-gray-900' : 'bg-white',
    border: isDark ? 'border-gray-600' : 'border-gray-300',
    errorText: isDark ? 'text-red-300' : 'text-red-700',
    successText: isDark ? 'text-green-300' : 'text-green-700',
    warningText: isDark ? 'text-yellow-300' : 'text-yellow-700',
    focusRing: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
  }),

  getSemanticColors: (type: 'error' | 'success' | 'warning' | 'info') => ({
    error: 'text-red-600 dark:text-red-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400'
  })[type]
} 