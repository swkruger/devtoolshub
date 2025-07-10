"use client"

import { useEffect, useCallback } from "react"

interface KeyboardShortcutHandlers {
  onFormat: () => void
  onCompact: () => void
  onSort: () => void
  onRepair: () => void
  onCopy: () => void
  onUpload?: () => void
  onDownload?: () => void
  onSaveSnippet?: () => void
  onToggleTreeView?: () => void
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

    if (ctrlKey) {
      switch (key.toLowerCase()) {
        case 'f':
          event.preventDefault()
          handlers.onFormat()
          break
        case 'm':
          event.preventDefault()
          handlers.onCompact()
          break
        case 'r':
          event.preventDefault()
          handlers.onRepair()
          break
        case 'c':
          // Only handle copy if it's not in an input field
          if (!window.getSelection()?.toString()) {
            event.preventDefault()
            handlers.onCopy()
          }
          break
        case 's':
          if (shiftKey) {
            event.preventDefault()
            handlers.onSort()
          } else {
            event.preventDefault()
            handlers.onSaveSnippet?.()
          }
          break
        case 'o':
          event.preventDefault()
          handlers.onUpload?.()
          break
        case 'd':
          event.preventDefault()
          handlers.onDownload?.()
          break
        case 't':
          event.preventDefault()
          handlers.onToggleTreeView?.()
          break
        default:
          break
      }
    }
  }, [handlers])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}

// Helper hook for showing keyboard shortcut toast notifications
export function useShortcutToast() {
  const showShortcutToast = useCallback((action: string, shortcut: string) => {
    // Create a temporary toast notification
    const toast = document.createElement('div')
    toast.className = 'fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-300'
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-sm">${action}</span>
        <kbd class="px-2 py-1 text-xs font-mono bg-gray-700 border border-gray-600 rounded">${shortcut}</kbd>
      </div>
    `
    
    document.body.appendChild(toast)
    
    // Remove after 2 seconds
    setTimeout(() => {
      toast.classList.add('animate-out', 'fade-out-0', 'slide-out-to-bottom-2')
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }, 2000)
  }, [])

  return showShortcutToast
}

// Predefined keyboard shortcuts for documentation
export const keyboardShortcuts = [
  {
    key: 'Ctrl + F',
    action: 'Format JSON',
    description: 'Beautify and indent JSON with proper formatting'
  },
  {
    key: 'Ctrl + M',
    action: 'Compact JSON',
    description: 'Minify JSON by removing whitespace'
  },
  {
    key: 'Ctrl + R',
    action: 'Repair JSON',
    description: 'Automatically fix common JSON errors'
  },
  {
    key: 'Ctrl + L',
    action: 'Load Sample',
    description: 'Load sample JSON data to test with'
  },
  {
    key: 'Alt + C',
    action: 'Copy Content',
    description: 'Copy JSON content to clipboard'
  },
  {
    key: 'Ctrl + Shift + S',
    action: 'Sort Keys A-Z',
    description: 'Sort object keys alphabetically (ascending)'
  },
  {
    key: 'Ctrl + Shift + A',
    action: 'Sort Keys Z-A',
    description: 'Sort object keys alphabetically (descending)'
  },
  {
    key: 'Alt + S',
    action: 'Save Snippet',
    description: 'Save current JSON as a snippet (Premium)',
    premium: true
  },
  {
    key: 'Alt + L',
    action: 'Load Snippet',
    description: 'Load a saved JSON snippet (Premium)',
    premium: true
  },
  {
    key: 'Ctrl + O',
    action: 'Upload File',
    description: 'Upload JSON file from disk'
  },
  {
    key: 'Alt + D',
    action: 'Download File',
    description: 'Download JSON as file (Premium)',
    premium: true
  },
  {
    key: 'Alt + T',
    action: 'Toggle Tree View',
    description: 'Show/hide tree visualization (Premium)',
    premium: true
  },
  {
    key: 'F1',
    action: 'Show Help',
    description: 'Open help panel with examples and tips'
  },
  {
    key: 'Esc',
    action: 'Close Dialogs',
    description: 'Close help panel or other open dialogs'
  }
] as const 