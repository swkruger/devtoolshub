"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip } from '@/components/ui/tooltip'
import { 
  Play, 
  Copy, 
  RotateCcw, 
  Crown,
  Clock,
  ChevronDown,
  FileText,
  RefreshCw,
  Zap,
  ZapOff
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { getRegexEngine, COMMON_PATTERNS } from '../lib/regex-engines'
import type { RegexLanguage, RegexMatch } from '../lib/regex-engines'
import { EnhancedTooltip, tooltipConfigs } from './enhanced-tooltip'

// Dynamic import for AceEditor to avoid SSR issues
const AceEditor = dynamic(
  async () => {
    const ace = await import("react-ace")
    
    // Import ace modules after react-ace is loaded
    if (typeof window !== 'undefined') {
      await import("ace-builds/src-noconflict/mode-text")
      await import("ace-builds/src-noconflict/theme-github") 
      await import("ace-builds/src-noconflict/theme-monokai")
      await import("ace-builds/src-noconflict/ext-language_tools")
    }
    
    return ace
  },
  { 
    ssr: false,
    loading: () => <div className="h-[200px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">Loading editor...</div>
  }
)

interface RegexEditorProps {
  isPremiumUser: boolean
  userId?: string
}

// Debounce utility
function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function RegexEditor({ isPremiumUser, userId }: RegexEditorProps) {
  const { toast } = useToast()
  const [pattern, setPattern] = useState('')
  const [testText, setTestText] = useState('')
  const [matches, setMatches] = useState<RegexMatch[]>([])
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState<RegexLanguage>('javascript')
  const [flags, setFlags] = useState<string[]>(['g'])
  const [isProcessing, setIsProcessing] = useState(false)
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [liveTesting, setLiveTesting] = useState(false)
  const [isLiveTesting, setIsLiveTesting] = useState(false)
  const [currentLine, setCurrentLine] = useState(0)
  
  // Refs for ace editor
  const aceEditorRef = useRef<any>(null)
  const markersRef = useRef<number[]>([])

  // Debounced values for live testing
  const debouncedPattern = useDebounce(pattern, 500)
  const debouncedTestText = useDebounce(testText, 300)

  // Detect dark mode (match JSON formatter logic exactly)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
  }, [])

  // Clear previous markers
  const clearMarkers = useCallback(() => {
    if (aceEditorRef.current && markersRef.current.length > 0) {
      const editor = aceEditorRef.current
      const session = editor.getSession()
      
      markersRef.current.forEach(markerId => {
        session.removeMarker(markerId)
      })
      markersRef.current = []
    }
  }, [])

  // Add highlight markers to ace editor
  const highlightMatches = useCallback((matchResults: RegexMatch[]) => {
    if (!aceEditorRef.current || matchResults.length === 0) return
    
    const editor = aceEditorRef.current
    const session = editor.getSession()
    const Range = (window as any).ace?.require('ace/range').Range
    
    if (!Range) return

    // Clear previous markers
    clearMarkers()

    matchResults.forEach((match, matchIndex) => {
      // Convert string indices to line/column positions
      const lines = testText.split('\n')
      let currentPos = 0
      let startLine = 0
      let startCol = 0
      let endLine = 0
      let endCol = 0

      // Find start position
      for (let i = 0; i < lines.length; i++) {
        if (currentPos + lines[i].length >= match.index) {
          startLine = i
          startCol = match.index - currentPos
          break
        }
        currentPos += lines[i].length + 1 // +1 for newline
      }

      // Find end position
      currentPos = 0
      const endIndex = match.index + match.match.length
      for (let i = 0; i < lines.length; i++) {
        if (currentPos + lines[i].length >= endIndex) {
          endLine = i
          endCol = endIndex - currentPos
          break
        }
        currentPos += lines[i].length + 1 // +1 for newline
      }

      // Check if match is on current line (cursor line)
      const isOnCurrentLine = startLine === currentLine
      
      // Add main match marker with different class for current line
      const range = new Range(startLine, startCol, endLine, endCol)
      const baseClass = isOnCurrentLine ? 'ace_regex_match_current' : 'ace_regex_match'
      const colorClass = `ace_regex_match_${matchIndex % 5}`
      const markerId = session.addMarker(range, `${baseClass} ${colorClass}`, 'text')
      markersRef.current.push(markerId)
    })

    // Add CSS styles for highlighting if not already added
    if (!document.getElementById('ace-regex-highlight-styles')) {
      const style = document.createElement('style')
      style.id = 'ace-regex-highlight-styles'
      style.textContent = `
        /* Regular match highlighting */
        .ace_regex_match_0 { background-color: rgba(255, 255, 0, 0.4); position: absolute; z-index: 10; }
        .ace_regex_match_1 { background-color: rgba(0, 255, 255, 0.4); position: absolute; z-index: 10; }
        .ace_regex_match_2 { background-color: rgba(255, 0, 255, 0.4); position: absolute; z-index: 10; }
        .ace_regex_match_3 { background-color: rgba(0, 255, 0, 0.4); position: absolute; z-index: 10; }
        .ace_regex_match_4 { background-color: rgba(255, 165, 0, 0.4); position: absolute; z-index: 10; }
        
        /* Current line match highlighting - brighter/more prominent */
        .ace_regex_match_current.ace_regex_match_0 { 
          background-color: rgba(255, 255, 0, 0.7); 
          border: 2px solid rgba(255, 255, 0, 0.9);
          box-shadow: 0 0 4px rgba(255, 255, 0, 0.5);
          position: absolute; 
          z-index: 15;
        }
        .ace_regex_match_current.ace_regex_match_1 { 
          background-color: rgba(0, 255, 255, 0.7); 
          border: 2px solid rgba(0, 255, 255, 0.9);
          box-shadow: 0 0 4px rgba(0, 255, 255, 0.5);
          position: absolute; 
          z-index: 15;
        }
        .ace_regex_match_current.ace_regex_match_2 { 
          background-color: rgba(255, 0, 255, 0.7); 
          border: 2px solid rgba(255, 0, 255, 0.9);
          box-shadow: 0 0 4px rgba(255, 0, 255, 0.5);
          position: absolute; 
          z-index: 15;
        }
        .ace_regex_match_current.ace_regex_match_3 { 
          background-color: rgba(0, 255, 0, 0.7); 
          border: 2px solid rgba(0, 255, 0, 0.9);
          box-shadow: 0 0 4px rgba(0, 255, 0, 0.5);
          position: absolute; 
          z-index: 15;
        }
        .ace_regex_match_current.ace_regex_match_4 { 
          background-color: rgba(255, 165, 0, 0.7); 
          border: 2px solid rgba(255, 165, 0, 0.9);
          box-shadow: 0 0 4px rgba(255, 165, 0, 0.5);
          position: absolute; 
          z-index: 15;
        }
        
        /* Special handling for selected lines - high contrast with stronger borders */
        .ace_selection .ace_regex_match_0,
        .ace_active-line .ace_regex_match_0 { 
          background-color: rgba(139, 0, 0, 0.8) !important; 
          border: 3px solid rgba(139, 0, 0, 1) !important;
          box-shadow: 0 0 6px rgba(139, 0, 0, 0.6) !important;
          color: white !important;
          z-index: 20 !important;
        }
        .ace_selection .ace_regex_match_1,
        .ace_active-line .ace_regex_match_1 { 
          background-color: rgba(0, 0, 139, 0.8) !important; 
          border: 3px solid rgba(0, 0, 139, 1) !important;
          box-shadow: 0 0 6px rgba(0, 0, 139, 0.6) !important;
          color: white !important;
          z-index: 20 !important;
        }
        .ace_selection .ace_regex_match_2,
        .ace_active-line .ace_regex_match_2 { 
          background-color: rgba(139, 0, 139, 0.8) !important; 
          border: 3px solid rgba(139, 0, 139, 1) !important;
          box-shadow: 0 0 6px rgba(139, 0, 139, 0.6) !important;
          color: white !important;
          z-index: 20 !important;
        }
        .ace_selection .ace_regex_match_3,
        .ace_active-line .ace_regex_match_3 { 
          background-color: rgba(0, 100, 0, 0.8) !important; 
          border: 3px solid rgba(0, 100, 0, 1) !important;
          box-shadow: 0 0 6px rgba(0, 100, 0, 0.6) !important;
          color: white !important;
          z-index: 20 !important;
        }
        .ace_selection .ace_regex_match_4,
        .ace_active-line .ace_regex_match_4 { 
          background-color: rgba(255, 140, 0, 0.8) !important; 
          border: 3px solid rgba(255, 140, 0, 1) !important;
          box-shadow: 0 0 6px rgba(255, 140, 0, 0.6) !important;
          color: white !important;
          z-index: 20 !important;
        }
        
        /* Special handling for current line + selected */
        .ace_selection .ace_regex_match_current,
        .ace_active-line .ace_regex_match_current { 
          border-width: 4px !important;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.8) !important;
          z-index: 25 !important;
        }
        
        /* Dark mode regular matches */
        .ace_dark .ace_regex_match_0 { background-color: rgba(255, 255, 0, 0.3); }
        .ace_dark .ace_regex_match_1 { background-color: rgba(0, 255, 255, 0.3); }
        .ace_dark .ace_regex_match_2 { background-color: rgba(255, 0, 255, 0.3); }
        .ace_dark .ace_regex_match_3 { background-color: rgba(0, 255, 0, 0.3); }
        .ace_dark .ace_regex_match_4 { background-color: rgba(255, 165, 0, 0.3); }
        
        /* Dark mode current line matches */
        .ace_dark .ace_regex_match_current.ace_regex_match_0 { 
          background-color: rgba(255, 255, 0, 0.5); 
          border: 2px solid rgba(255, 255, 0, 0.7);
          box-shadow: 0 0 4px rgba(255, 255, 0, 0.4);
        }
        .ace_dark .ace_regex_match_current.ace_regex_match_1 { 
          background-color: rgba(0, 255, 255, 0.5); 
          border: 2px solid rgba(0, 255, 255, 0.7);
          box-shadow: 0 0 4px rgba(0, 255, 255, 0.4);
        }
        .ace_dark .ace_regex_match_current.ace_regex_match_2 { 
          background-color: rgba(255, 0, 255, 0.5); 
          border: 2px solid rgba(255, 0, 255, 0.7);
          box-shadow: 0 0 4px rgba(255, 0, 255, 0.4);
        }
        .ace_dark .ace_regex_match_current.ace_regex_match_3 { 
          background-color: rgba(0, 255, 0, 0.5); 
          border: 2px solid rgba(0, 255, 0, 0.7);
          box-shadow: 0 0 4px rgba(0, 255, 0, 0.4);
        }
        .ace_dark .ace_regex_match_current.ace_regex_match_4 { 
          background-color: rgba(255, 165, 0, 0.5); 
          border: 2px solid rgba(255, 165, 0, 0.7);
          box-shadow: 0 0 4px rgba(255, 165, 0, 0.4);
        }
        
        /* Dark mode selected line overrides */
        .ace_dark .ace_selection .ace_regex_match_0,
        .ace_dark .ace_active-line .ace_regex_match_0 { 
          background-color: rgba(255, 100, 100, 0.9) !important; 
          border: 3px solid rgba(255, 100, 100, 1) !important;
          box-shadow: 0 0 6px rgba(255, 100, 100, 0.7) !important;
        }
        .ace_dark .ace_selection .ace_regex_match_1,
        .ace_dark .ace_active-line .ace_regex_match_1 { 
          background-color: rgba(100, 149, 237, 0.9) !important; 
          border: 3px solid rgba(100, 149, 237, 1) !important;
          box-shadow: 0 0 6px rgba(100, 149, 237, 0.7) !important;
        }
        .ace_dark .ace_selection .ace_regex_match_2,
        .ace_dark .ace_active-line .ace_regex_match_2 { 
          background-color: rgba(255, 100, 255, 0.9) !important; 
          border: 3px solid rgba(255, 100, 255, 1) !important;
          box-shadow: 0 0 6px rgba(255, 100, 255, 0.7) !important;
        }
        .ace_dark .ace_selection .ace_regex_match_3,
        .ace_dark .ace_active-line .ace_regex_match_3 { 
          background-color: rgba(144, 238, 144, 0.9) !important; 
          border: 3px solid rgba(144, 238, 144, 1) !important;
          box-shadow: 0 0 6px rgba(144, 238, 144, 0.7) !important;
        }
        .ace_dark .ace_selection .ace_regex_match_4,
        .ace_dark .ace_active-line .ace_regex_match_4 { 
          background-color: rgba(255, 165, 0, 0.9) !important; 
          border: 3px solid rgba(255, 165, 0, 1) !important;
          box-shadow: 0 0 6px rgba(255, 165, 0, 0.7) !important;
        }
      `
      document.head.appendChild(style)
    }
  }, [testText, currentLine, clearMarkers])

  // Main test function
  const testRegex = useCallback((isLive = false) => {
    if (!pattern) {
      if (!isLive) {
        toast({
          type: 'warning',
          title: 'No pattern',
          description: 'Please enter a regex pattern to test'
        })
      }
      setMatches([])
      setError(null)
      clearMarkers()
      return
    }

    if (isLive) {
      setIsLiveTesting(true)
    } else {
      setIsProcessing(true)
    }
    
    try {
      const engine = getRegexEngine(language)
      const result = engine.test(pattern, testText, flags)
      
      if (result.isValid) {
        setMatches(result.matches)
        setError(null)
        setExecutionTime(result.executionTime || null)
        
        // Highlight matches in ace editor
        highlightMatches(result.matches)
        
        if (!isLive) {
          toast({
            type: 'success',
            title: 'Pattern tested',
            description: `Found ${result.matches.length} matches in ${result.executionTime?.toFixed(2)}ms`
          })
        }
      } else {
        setMatches([])
        setError(result.error || 'Invalid regex pattern')
        setExecutionTime(null)
        clearMarkers()
        
        if (!isLive) {
          toast({
            type: 'error',
            title: 'Invalid pattern',
            description: result.error || 'Please check your regex syntax'
          })
        }
      }
    } catch (err) {
      setMatches([])
      setError('Unexpected error occurred')
      setExecutionTime(null)
      clearMarkers()
      
      if (!isLive) {
        toast({
          type: 'error',
          title: 'Error',
          description: 'An unexpected error occurred while testing the pattern'
        })
      }
    } finally {
      if (isLive) {
        setIsLiveTesting(false)
      } else {
        setIsProcessing(false)
      }
    }
  }, [pattern, testText, language, flags, toast, highlightMatches, clearMarkers])

  // Live testing effect (premium only)
  useEffect(() => {
    if (liveTesting && isPremiumUser && (debouncedPattern || debouncedTestText)) {
      testRegex(true)
    }
  }, [debouncedPattern, debouncedTestText, language, flags, liveTesting, testRegex, isPremiumUser])

  // Re-highlight when current line changes
  useEffect(() => {
    if (matches.length > 0) {
      highlightMatches(matches)
    }
  }, [currentLine, matches, highlightMatches])

  // Manual test function (non-live)
  const manualTestRegex = useCallback(() => {
    testRegex(false)
  }, [testRegex])

  const copyMatches = useCallback(() => {
    if (matches.length === 0) {
      toast({
        type: 'warning',
        title: 'No matches',
        description: 'No matches found to copy'
      })
      return
    }

    const matchStrings = matches.map(match => match.match).join('\n')
    navigator.clipboard.writeText(matchStrings).then(() => {
      toast({
        type: 'success',
        title: 'Copied to clipboard',
        description: `Copied ${matches.length} matches to clipboard`
      })
    })
  }, [matches, toast])

  const loadSample = useCallback(() => {
    const emailPattern = COMMON_PATTERNS.email
    if (emailPattern) {
      setPattern(emailPattern.pattern)
      setTestText(emailPattern.testText)
      setLanguage('javascript')
      setFlags(emailPattern.flags)
      
      toast({
        type: 'success',
        title: 'Sample loaded',
        description: 'Email validation pattern loaded'
      })
    }
  }, [toast])

  const clearAll = useCallback(() => {
    setPattern('')
    setTestText('')
    setMatches([])
    setError(null)
    setExecutionTime(null)
    setCurrentLine(0)
    clearMarkers()
    
    toast({
      type: 'success',
      title: 'Cleared',
      description: 'Pattern and test text cleared'
    })
  }, [toast, clearMarkers])

  const handleLanguageChange = (newLanguage: RegexLanguage) => {
    if (newLanguage !== 'javascript' && !isPremiumUser) {
      toast({
        type: 'warning',
        title: 'Premium Feature',
        description: 'Multi-language support requires a premium plan'
      })
      return
    }
    
    setLanguage(newLanguage)
    setError(null)
    setMatches([])
    setCurrentLine(0)
    clearMarkers()
    
    toast({
      type: 'success',
      title: 'Language changed',
      description: `Switched to ${getRegexEngine(newLanguage).getLanguageName()}`
    })
  }

  const toggleFlag = (flag: string) => {
    setFlags(prev => 
      prev.includes(flag) 
        ? prev.filter(f => f !== flag)
        : [...prev, flag]
    )
  }

  const toggleLiveTesting = () => {
    if (!isPremiumUser) {
      toast({
        type: 'warning',
        title: 'Premium Feature',
        description: 'Live pattern testing requires a premium plan. Upgrade to enable automatic testing as you type.'
      })
      return
    }
    
    setLiveTesting(prev => {
      const newValue = !prev
      if (!newValue) {
        setCurrentLine(0)
        clearMarkers()
      }
      toast({
        type: 'success',
        title: newValue ? 'Live testing enabled' : 'Live testing disabled',
        description: newValue 
          ? 'Pattern will be tested automatically as you type' 
          : 'Use Test Pattern button for manual testing'
      })
      return newValue
    })
  }

  // Get available flags for the current language
  const availableFlags = getRegexEngine(language).getSupportedFlags().map(flag => {
    const flagDescriptions: Record<string, string> = {
      'g': 'Global',
      'i': 'Ignore Case',
      'm': 'Multiline',
      's': 'Dot All',
      'u': 'Unicode',
      'y': 'Sticky',
      'x': 'Verbose',
      'a': 'ASCII'
    }
    
    return {
      flag,
      description: flagDescriptions[flag] || flag.toUpperCase()
    }
  })

  // Function to load pattern from help panel
  const loadPatternFromHelp = useCallback((patternData: any) => {
    setPattern(patternData.pattern)
    setTestText(patternData.testText)
    setFlags(patternData.flags)
    setLanguage('javascript') // Always use JavaScript for common patterns
    setError(null)
    setMatches([])
    setCurrentLine(0)
    clearMarkers()
    
    toast({
      type: 'success',
      title: 'Pattern loaded',
      description: `Loaded ${patternData.description} pattern`
    })
  }, [toast, clearMarkers])

  // Expose handlers for keyboard shortcuts and pattern loading
  useEffect(() => {
    const handleCustomEvent = (event: CustomEvent) => {
      switch (event.detail.action) {
        case 'test':
          manualTestRegex()
          break
        case 'loadSample':
          loadSample()
          break
        case 'copyMatches':
          copyMatches()
          break
        case 'clearAll':
          clearAll()
          break
      }
    }

    const handleLoadPattern = (event: CustomEvent) => {
      loadPatternFromHelp(event.detail)
    }

    window.addEventListener('regex-editor-action', handleCustomEvent as EventListener)
    window.addEventListener('regex-editor-load-pattern', handleLoadPattern as EventListener)
    
    return () => {
      window.removeEventListener('regex-editor-action', handleCustomEvent as EventListener)
      window.removeEventListener('regex-editor-load-pattern', handleLoadPattern as EventListener)
    }
  }, [manualTestRegex, loadSample, copyMatches, clearAll, loadPatternFromHelp])

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      clearMarkers()
    }
  }, [clearMarkers])

  return (
    <div className="space-y-6">
      <Card>
        {/* Action Toolbar */}
        <div className="px-4 pt-4 pb-3 border-b">
          <div className="flex flex-wrap gap-2">
            {/* Basic Operations Group */}
            <div className="flex flex-wrap gap-1">
              <Tooltip content="Test regex pattern against text input (Ctrl+Enter)">
                <Button
                  onClick={manualTestRegex}
                  disabled={isProcessing || !pattern}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Test Pattern
                </Button>
              </Tooltip>
              
              <EnhancedTooltip
                title={isPremiumUser ? (liveTesting ? "Disable live testing" : "Enable live testing") : "Live Testing (Premium)"}
                description={isPremiumUser 
                  ? (liveTesting ? "Switch to manual testing mode" : "Enable automatic testing as you type")
                  : "Automatic pattern testing while you type - Premium feature"
                }
                shortcut={isPremiumUser ? "Click to toggle" : undefined}
                showPremiumBadge={!isPremiumUser}
                examples={[
                  'Tests pattern automatically as you type',
                  'Highlights matches in real-time',
                  'Debounced for performance'
                ]}
                tips={[
                  'Live testing is more responsive',
                  'Great for experimenting with patterns',
                  'Manual testing for precise control'
                ]}
              >
                <Button
                  onClick={toggleLiveTesting}
                  disabled={!isPremiumUser}
                  size="sm"
                  variant={liveTesting && isPremiumUser ? "default" : "outline"}
                  className="flex items-center gap-2"
                >
                  {!isPremiumUser && <Crown className="w-4 h-4 mr-1" />}
                  {liveTesting && isPremiumUser ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                  {liveTesting && isPremiumUser ? 'Live' : 'Manual'}
                  {isLiveTesting && isPremiumUser && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1" />}
                </Button>
              </EnhancedTooltip>
              
              <Tooltip content="Copy all matches to clipboard (Ctrl+C)">
                <Button
                  onClick={copyMatches}
                  disabled={isProcessing || matches.length === 0}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Matches
                </Button>
              </Tooltip>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px bg-border h-8 self-center mx-1"></div>

            {/* Sample Data Group */}
            <div className="flex flex-wrap gap-1">
              <Tooltip content="Load sample regex pattern to test with (Ctrl+L)">
                <Button
                  onClick={loadSample}
                  disabled={isProcessing}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Load Sample
                </Button>
              </Tooltip>
              
              <Tooltip content="Clear all content from pattern and test text">
                <Button
                  onClick={clearAll}
                  disabled={isProcessing}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear All
                </Button>
              </Tooltip>
            </div>

            {/* Status Info */}
            <div className="flex items-center gap-4 ml-auto">
              {matches.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {matches.length} match{matches.length !== 1 ? 'es' : ''}
                  </span>
                </div>
              )}
              
              {executionTime !== null && (
                <>
                  <div className="hidden sm:block w-px bg-border h-8 self-center"></div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {executionTime.toFixed(2)}ms
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <CardHeader className="pb-4">
          {/* Remove header content but keep spacing */}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Pattern Input with Language Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Regular Expression Pattern</label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="Enter your regex pattern (e.g., \d+)"
                  className="font-mono"
                />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Language:</span>
                <div className="relative min-w-0">
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value as RegexLanguage)}
                    className="appearance-none bg-background border border-input rounded px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[120px]"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python" disabled={!isPremiumUser}>Python {!isPremiumUser ? '(Premium)' : ''}</option>
                    <option value="java" disabled={!isPremiumUser}>Java {!isPremiumUser ? '(Premium)' : ''}</option>
                    <option value="go" disabled={!isPremiumUser}>Go {!isPremiumUser ? '(Premium)' : ''}</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Flags */}
          <div>
            <label className="text-sm font-medium mb-2 block">Flags:</label>
            <div className="flex flex-wrap gap-3">
              {availableFlags.map(({ flag, description }) => (
                <label key={flag} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={flags.includes(flag)}
                    onChange={() => toggleFlag(flag)}
                    className="rounded"
                  />
                  <span className="text-sm">
                    <code className="font-mono font-bold bg-muted px-1 py-0.5 rounded text-xs">{flag}</code> {description}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Test Text Editor */}
          <div>
            <label className="text-sm font-medium mb-2 block">Test Text</label>
            <div className="border rounded-lg overflow-hidden">
              <AceEditor
                mode="text"
                theme={isDarkMode ? "monokai" : "github"}
                name="test-text-editor"
                value={testText}
                onChange={setTestText}
                onLoad={(editor) => {
                  aceEditorRef.current = editor
                }}
                onCursorChange={(selection) => {
                  const newLine = selection.cursor.row
                  const newPosition = {
                    line: newLine + 1,
                    column: selection.cursor.column + 1
                  }
                  
                  setCursorPosition(newPosition)
                  
                  // Update current line and re-highlight if line changed
                  if (newLine !== currentLine) {
                    setCurrentLine(newLine)
                  }
                }}
                editorProps={{ $blockScrolling: true }}
                width="100%"
                height="200px"
                fontSize={14}
                showPrintMargin={true}
                showGutter={true}
                highlightActiveLine={true}
                setOptions={{
                  enableBasicAutocompletion: false,
                  enableLiveAutocompletion: false,
                  enableSnippets: false,
                  showLineNumbers: true,
                  tabSize: 2,
                  wrap: true,
                  printMargin: 80
                }}
                placeholder="Enter text to test your regex against..."
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                }}
              />
            </div>
            
            {/* Status Bar */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
              <span>Size: {(new Blob([testText]).size / 1024).toFixed(1)} KB</span>
              <span>Line {cursorPosition.line}, Column {cursorPosition.column}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="text-red-800 dark:text-red-200">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Results */}
      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Match Results ({matches.length} match{matches.length !== 1 ? 'es' : ''} found)
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Language: {getRegexEngine(language).getLanguageName()}</span>
                <span>•</span>
                <span>Flags: {flags.join('') || 'none'}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {matches.map((match, index) => (
                <div key={index} className="border rounded-lg p-4 bg-muted/30">
                  {/* Main Match */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded font-mono">
                        #{index + 1}
                      </span>
                      <span className="font-mono font-medium text-lg bg-yellow-100 px-2 py-1 rounded">
                        "{match.match}"
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Position: {match.index}-{match.index + match.match.length}
                    </div>
                  </div>
                  
                  {/* Capture Groups */}
                  {match.groups.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">Capture Groups:</h5>
                      <div className="grid gap-2">
                        {match.groups.map((group, groupIndex) => (
                          <div key={groupIndex} className="flex items-center gap-2 text-sm">
                            <span className="font-mono text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              ${groupIndex + 1}
                            </span>
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                              "{group || '(empty)'}"
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Named Groups */}
                  {match.namedGroups && Object.keys(match.namedGroups).length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">Named Groups:</h5>
                      <div className="grid gap-2">
                        {Object.entries(match.namedGroups).map(([name, value]) => (
                          <div key={name} className="flex items-center gap-2 text-sm">
                            <span className="font-mono text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {name}
                            </span>
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                              "{value || '(empty)'}"
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium Features Panel */}
      {!isPremiumUser && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Premium Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Live Pattern Testing</h4>
                <p className="text-sm text-muted-foreground">
                  Automatic real-time testing as you type with match highlighting
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Multi-Language Support</h4>
                <p className="text-sm text-muted-foreground">
                  Test regex patterns across JavaScript, Python, Java, Go, PHP, and C#
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Pattern Explanations</h4>
                <p className="text-sm text-muted-foreground">
                  Get detailed breakdowns of complex regex patterns
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Regex Visualization</h4>
                <p className="text-sm text-muted-foreground">
                  See your regex as interactive flow diagrams
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Pattern Library & Saved Patterns</h4>
                <p className="text-sm text-muted-foreground">
                  Access 100+ common patterns and save your own
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Advanced Testing Features</h4>
                <p className="text-sm text-muted-foreground">
                  Replace functionality, bulk testing, and performance analytics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 