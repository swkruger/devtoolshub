"use client"

import { useEffect, useCallback } from "react"

interface KeyboardShortcutHandlers {
  onTestPattern: () => void
  onLoadSample: () => void
  onCopyMatches: () => void
  onClearAll: () => void
  onShowHelp: () => void
  onEscape: () => void
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when user is typing in input fields
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as any)?.contentEditable === 'true'
    ) {
      // Only allow F1 (help) and Escape in input fields
      if (event.key === 'F1') {
        event.preventDefault()
        handlers.onShowHelp()
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        handlers.onEscape()
        return
      }
      return
    }

    const { ctrlKey, shiftKey, key } = event
    
    // Handle keyboard shortcuts
    if (key === 'F1') {
      event.preventDefault()
      handlers.onShowHelp()
      return
    }

    if (key === 'Escape') {
      event.preventDefault()
      handlers.onEscape()
      return
    }

    // Ctrl + Enter - Test Pattern
    if (ctrlKey && key === 'Enter') {
      event.preventDefault()
      handlers.onTestPattern()
      return
    }

    // Ctrl + L - Load Sample
    if (ctrlKey && key === 'l') {
      event.preventDefault()
      handlers.onLoadSample()
      return
    }

    // Ctrl + C - Copy Matches (when not in an input)
    if (ctrlKey && key === 'c' && !event.target) {
      event.preventDefault()
      handlers.onCopyMatches()
      return
    }

    // Ctrl + R - Clear All
    if (ctrlKey && key === 'r') {
      event.preventDefault()
      handlers.onClearAll()
      return
    }

  }, [handlers])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Hook for showing toast messages about shortcuts
export function useShortcutToast() {
  const showToast = useCallback((shortcut: string, action: string) => {
    // You can implement a toast notification here
    console.log(`Keyboard shortcut: ${shortcut} - ${action}`)
  }, [])

  return { showToast }
} 