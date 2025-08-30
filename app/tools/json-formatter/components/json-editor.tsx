"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import dynamic from "next/dynamic"
import { 
  Copy, 
  Download, 
  Upload, 
  RefreshCw, 
  Minimize2, 
  ArrowUpDown, 
  ArrowDownUp, 
  Wrench, 
  FileText,
  Save,
  Crown,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  ChevronDown,
  TreePine,
  Search,
  Expand,
  Shrink,
  FolderOpen,
  Star,
  StarOff,
  Trash2,
  Edit3,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Tooltip } from "@/components/ui/tooltip"
import { UpgradeModal } from "@/components/shared/upgrade-modal"
import { ErrorBoundary } from "@/components/shared/error-boundary"
import { LoadingOverlay, Spinner } from "@/components/ui/progress"
import { toast } from "sonner"
import { JsonSnippet, DEFAULT_CATEGORIES } from "@/lib/types/snippets"
import { SnippetsService } from "@/lib/services/snippets"

// Dynamic import for react-json-tree to avoid SSR issues
const JSONTree = dynamic(
  async () => {
    const { JSONTree } = await import("react-json-tree")
    return JSONTree
  }, 
  { 
    ssr: false,
    loading: () => <div className="h-[200px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">Loading tree view...</div>
  }
)

// Dynamic import for AceEditor to avoid SSR issues
const AceEditor = dynamic(
  async () => {
    const ace = await import("react-ace")
    
    // Import ace modules after react-ace is loaded
    if (typeof window !== 'undefined') {
      await import("ace-builds/src-noconflict/mode-json")
      await import("ace-builds/src-noconflict/mode-xml")
      await import("ace-builds/src-noconflict/mode-yaml")
      await import("ace-builds/src-noconflict/mode-javascript")
      await import("ace-builds/src-noconflict/theme-github") 
      await import("ace-builds/src-noconflict/theme-monokai")
      await import("ace-builds/src-noconflict/ext-language_tools")
    }
    
    return ace
  },
  { 
    ssr: false,
    loading: () => <div className="h-[400px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">Loading editor...</div>
  }
)



interface JsonEditorProps {
  isBackerUser: boolean
  userId?: string
}

interface ValidationResult {
  isValid: boolean
  error?: string
  line?: number
  column?: number
  tip?: string
  range?: {
    startRow: number
    startCol: number
    endRow: number
    endCol: number
  }
}

// Performance monitoring utility
const usePerformanceMonitor = () => {
  const performanceRef = useRef<{ [key: string]: number }>({})
  
  const startTimer = useCallback((operation: string) => {
    performanceRef.current[operation] = Date.now()
  }, [])
  
  const endTimer = useCallback((operation: string, showWarning: boolean = false) => {
    const startTime = performanceRef.current[operation]
    if (!startTime) return 0
    
    const duration = Date.now() - startTime
    delete performanceRef.current[operation]
    
    if (showWarning && duration > 2000) {
      return { duration, isVeryLarge: duration > 5000 }
    }
    
    return { duration, isVeryLarge: false }
  }, [])
  
  return { startTimer, endTimer }
}

// Debounced content hook for performance optimization
const useDebouncedContent = (initialContent: string, delay: number = 300) => {
  const [content, setContent] = useState(initialContent)
  const [debouncedContent, setDebouncedContent] = useState(initialContent)
  const [isTyping, setIsTyping] = useState(false)
  
  useEffect(() => {
    if (content !== debouncedContent) {
      setIsTyping(true)
      const timeoutId = setTimeout(() => {
        setDebouncedContent(content)
        setIsTyping(false)
      }, delay)
      
      return () => clearTimeout(timeoutId)
    }
  }, [content, debouncedContent, delay])
  
  return { content, debouncedContent, setContent, isTyping }
}

// Memory monitoring utility
const useMemoryMonitor = () => {
  const checkMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory
      const usedMB = memInfo.usedJSHeapSize / (1024 * 1024)
      const totalMB = memInfo.totalJSHeapSize / (1024 * 1024)
      const limitMB = memInfo.jsHeapSizeLimit / (1024 * 1024)
      
      return {
        used: usedMB,
        total: totalMB,
        limit: limitMB,
        percentage: (usedMB / limitMB) * 100
      }
    }
    return null
  }, [])
  
  const isMemoryHigh = useCallback(() => {
    const memInfo = checkMemoryUsage()
    return memInfo ? memInfo.percentage > 80 : false
  }, [checkMemoryUsage])
  
  return { checkMemoryUsage, isMemoryHigh }
}

export function JsonEditor({ isBackerUser, userId }: JsonEditorProps) {

  
  // Performance monitoring and optimization hooks
  const { startTimer, endTimer } = usePerformanceMonitor()
  const { checkMemoryUsage, isMemoryHigh } = useMemoryMonitor()
  const { content: jsonContent, debouncedContent: debouncedJsonContent, setContent: setJsonContent, isTyping } = useDebouncedContent('')
  
  // State variables (keeping all existing state)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true })
  const [editorRef, setEditorRef] = useState<any>(null)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [conversionMode, setConversionMode] = useState<string | null>(null)
  const [convertedContent, setConvertedContent] = useState('')
  const [showConversionPanel, setShowConversionPanel] = useState(false)
  const [showTreeView, setShowTreeView] = useState(false)
  const [treeData, setTreeData] = useState<any>(null)
  
  // Snippet management state
  const [snippets, setSnippets] = useState<JsonSnippet[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [saveDialogData, setSaveDialogData] = useState({
    name: '',
    category: 'general',
    description: ''
  })
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [snippetsService] = useState(() => new SnippetsService())
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeFeature, setUpgradeFeature] = useState<string>('')
  const [operationProgress, setOperationProgress] = useState<{ show: boolean; message: string; progress?: number }>({
    show: false,
    message: '',
    progress: undefined
  })

  // Detect theme preference
  useEffect(() => {
    // Check for dark mode class on html element
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    
    // Initial check
    checkDarkMode()
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  // Helper function to find the problematic token range
  const findErrorRange = (content: string, errorLine: number, errorCol: number) => {
    const lines = content.split('\n')
    if (errorLine > lines.length) return null
    
    const lineContent = lines[errorLine - 1] // Convert to 0-based index
    const startCol = Math.max(0, errorCol - 1) // Convert to 0-based index
    
    // For control character errors, highlight just the problematic character
    if (startCol < lineContent.length) {
      const char = lineContent[startCol]
      // Check if it's a control character
      if (char && (char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) {
        return {
          startRow: errorLine - 1,
          startCol: startCol,
          endRow: errorLine - 1,
          endCol: startCol + 1
        }
      }
    }
    
    // Find the start of the current token by looking backwards
    let tokenStart = startCol
    while (tokenStart > 0 && /[a-zA-Z0-9_$]/.test(lineContent[tokenStart - 1])) {
      tokenStart--
    }
    
    // Find the end of the current token
    let tokenEnd = startCol
    const char = lineContent[tokenStart]
    
    if (char && /[a-zA-Z_$]/.test(char)) {
      // It's a property name or identifier - extend to full word
      while (tokenEnd < lineContent.length && /[a-zA-Z0-9_$]/.test(lineContent[tokenEnd])) {
        tokenEnd++
      }
    } else if (char === '"' || char === "'") {
      // It's a quoted string, find the closing quote
      tokenEnd = tokenStart + 1
      while (tokenEnd < lineContent.length && lineContent[tokenEnd] !== char) {
        if (lineContent[tokenEnd] === '\\') tokenEnd++ // Skip escaped characters
        tokenEnd++
      }
      if (tokenEnd < lineContent.length) tokenEnd++ // Include closing quote
    } else if (char && /[0-9\-+.]/.test(char)) {
      // It's a number
      while (tokenEnd < lineContent.length && /[0-9\-+.eE]/.test(lineContent[tokenEnd])) {
        tokenEnd++
      }
    } else {
      // Single character token or whitespace - highlight just one char
      tokenEnd = Math.min(startCol + 1, lineContent.length)
    }
    
    return {
      startRow: errorLine - 1, // Convert to 0-based
      startCol: tokenStart,
      endRow: errorLine - 1,
      endCol: tokenEnd
    }
  }

  // Helper function to search for error text in content and find its position
  const findErrorTextPosition = (content: string, errorText: string) => {
    let index = content.indexOf(errorText)
    
    // If exact match not found, try partial matches for truncated error text
    if (index === -1 && errorText.length > 3) {
      // Try progressively shorter versions of the error text
      for (let i = errorText.length - 1; i > 3; i--) {
        const partialText = errorText.substring(0, i)
        index = content.indexOf(partialText)
        if (index !== -1) {
          errorText = partialText
          break
        }
      }
    }
    
    if (index === -1) return null
    
    // Convert index to line/column
    const beforeText = content.substring(0, index)
    const lines = beforeText.split('\n')
    const line = lines.length
    const column = lines[lines.length - 1].length + 1
    
    // Find the end of the problematic token for better highlighting
    let endIndex = index + errorText.length
    // Extend to include more context if it looks like an incomplete value
    if (content[endIndex] && !/[\s,\]}]/.test(content[endIndex])) {
      while (endIndex < content.length && !/[\s,\]}]/.test(content[endIndex])) {
        endIndex++
      }
    }
    
    return {
      line,
      column,
      startRow: line - 1,
      startCol: lines[lines.length - 1].length,
      endRow: line - 1,
      endCol: lines[lines.length - 1].length + (endIndex - index)
    }
  }

  // JSON validation function with detailed error messages
  const validateJson = useCallback((content: string): ValidationResult => {
    if (!content.trim()) {
      return { isValid: true }
    }

    try {
      JSON.parse(content)
      return { isValid: true }
    } catch (error) {
      const errorMessage = (error as Error).message
      let line: number | undefined
      let column: number | undefined
      let tip: string | undefined
      let range: any = undefined

      // Extract line and column from error message if available
      // Try different position patterns
      let positionMatch = errorMessage.match(/line (\d+) column (\d+)/)
      if (positionMatch) {
        line = parseInt(positionMatch[1])
        column = parseInt(positionMatch[2])
      } else {
        // Fallback to position-based calculation
        positionMatch = errorMessage.match(/at position (\d+)/)
        if (positionMatch) {
          const position = parseInt(positionMatch[1])
          const lines = content.substring(0, position).split('\n')
          line = lines.length
          column = lines[lines.length - 1].length + 1
        }
      }

      // Calculate the error range for highlighting if we have position
      if (line && column) {
        range = findErrorRange(content, line, column)
      }

      // If position still not found, try to extract error text snippet and search for it
      if (!line || !column) {
        let errorText = null;
        
        // Try multiple patterns to extract the problematic text
        // Pattern 1: ..."text"... (general snippet)
        const snippetMatch = errorMessage.match(/\.\.\.(.+?)\.\.\./);
        if (snippetMatch) {
          errorText = snippetMatch[1].trim();
          // Remove surrounding quotes if they exist
          if (errorText.startsWith('"') && errorText.endsWith('"')) {
            errorText = errorText.slice(1, -1);
          }
        }
        
        // Pattern 2: Look for incomplete strings like "email": john.doe@
        if (!errorText) {
          const incompleteMatch = errorMessage.match(/"([^"]+)":\s*([^"\s]+)/);
          if (incompleteMatch) {
            errorText = `"${incompleteMatch[1]}": ${incompleteMatch[2]}`;
          }
        }
        
        // Pattern 3: Simple quoted text extraction
        if (!errorText) {
          const quotedMatch = errorMessage.match(/"([^"]+)"/);
          if (quotedMatch) {
            errorText = quotedMatch[1];
          }
        }
        
                 if (errorText && errorText.length > 1) {
           const textPosition = findErrorTextPosition(content, errorText);
           if (textPosition) {
             line = textPosition.line;
             column = textPosition.column;
             range = {
               startRow: textPosition.startRow,
               startCol: textPosition.startCol,
               endRow: textPosition.endRow,
               endCol: textPosition.endCol
             };
           }
                  }
       }

      // Provide helpful tips for common JSON errors
      if (errorMessage.includes('Bad control character')) {
        tip = "Invalid character in string. Escape special characters like \\n, \\t, \\r, or remove control characters"
      } else if (errorMessage.includes('Unexpected token')) {
        if (errorMessage.includes("'")) {
          tip = "Use double quotes (\") instead of single quotes (') for strings"
        } else if (errorMessage.includes('Unexpected end of JSON input')) {
          tip = "JSON appears to be incomplete. Check for missing closing brackets or braces"
        } else if (errorMessage.includes(',')) {
          tip = "Remove trailing commas - JSON doesn't allow commas after the last item"
        } else {
          tip = "Check for typos, missing quotes around property names, or invalid characters"
        }
      } else if (errorMessage.includes('Unexpected end of JSON input')) {
        tip = "JSON is incomplete. Make sure all opening brackets/braces have corresponding closing ones"
      } else if (errorMessage.includes('Expected property name')) {
        tip = "Property names must be strings enclosed in double quotes"
      } else if (errorMessage.includes('Unexpected string')) {
        tip = "Check for missing commas between object properties or array elements"
      } else if (errorMessage.includes('Unterminated string')) {
        tip = "String is not properly closed. Make sure all strings end with a closing quote"
      } else if (errorMessage.includes('Invalid escape')) {
        tip = "Invalid escape sequence. Use proper escapes like \\\\, \\\", \\n, \\t, \\r, \\/"
      } else if (errorMessage.includes('Invalid character')) {
        tip = "Invalid character detected. Remove or escape special characters in strings"
      } else {
        tip = "Common fixes: use double quotes, remove trailing commas, escape special characters"
      }

      return {
        isValid: false,
        error: errorMessage,
        line,
        column,
        tip,
        range
      }
    }
  }, [])

  // Optimized validation effect - now using debounced content
  useEffect(() => {
    if (!debouncedJsonContent.trim()) {
      setValidation({ isValid: true })
      return
    }
    
    // Check if content is too large for validation
    if (debouncedJsonContent.length > 1000000) { // 1MB limit for validation
      setValidation({ 
        isValid: false, 
        error: 'Content too large for real-time validation',
        tip: 'Use Format button to validate and format large JSON files'
      })
      return
    }
    
    startTimer('validation')
    const result = validateJson(debouncedJsonContent)
    const timing = endTimer('validation', true)
    
    if (timing && typeof timing === 'object' && timing.isVeryLarge) {
      showToast('Large JSON - validation may be slow', 'warning')
    }
    
    setValidation(result)
  }, [debouncedJsonContent, validateJson, startTimer, endTimer])

  // Update editor annotations and markers when validation changes
  useEffect(() => {
    if (!editorRef) return

    const session = editorRef.getSession()
    
    // Clear previous annotations and markers
    session.clearAnnotations()
    const markers = session.getMarkers()
    Object.keys(markers).forEach(markerId => {
      if (markers[markerId].clazz === 'json-error-marker' || markers[markerId].clazz === 'json-error-gutter') {
        session.removeMarker(markerId)
      }
    })

    if (!validation.isValid && validation.range && validation.line) {
      // Add error annotation (red cross on line number) - only one
      const annotations = [{
        row: validation.range.startRow,
        column: 0, // Start at beginning of line for gutter
        text: `Line ${validation.line}, Col ${validation.column}: ${validation.error}`,
        type: 'error'
      }]
      session.setAnnotations(annotations)

      // Add error marker (highlight the problematic text)
      const Range = (window as any).ace?.acequire('ace/range').Range
      if (Range) {
        const range = new Range(
          validation.range.startRow,
          validation.range.startCol,
          validation.range.endRow,
          validation.range.endCol
        )
        session.addMarker(range, 'json-error-marker', 'text')
      }
    }
  }, [validation, editorRef])

  // Handle editor load
  const handleEditorLoad = useCallback((editor: any) => {
    setEditorRef(editor)
    
    // Disable ace editor's built-in JSON worker to prevent double error reporting
    const session = editor.getSession()
    session.setUseWorker(false)
    
    // Add custom CSS for error highlighting
    const style = document.createElement('style')
    style.textContent = `
      .json-error-marker {
        background-color: rgba(255, 0, 0, 0.2) !important;
        border-bottom: 2px solid #ff0000 !important;
        position: relative;
        z-index: 10 !important;
      }
      
      .ace_dark .json-error-marker {
        background-color: rgba(255, 100, 100, 0.15) !important;
        border-bottom: 2px solid #ff6666 !important;
      }
      
      /* Ensure error highlighting persists when text is selected */
      .ace_editor .ace_selection .json-error-marker,
      .ace_editor .ace_selected-word .json-error-marker,
      .ace_editor .ace_line .ace_selection .json-error-marker {
        background-color: rgba(255, 0, 0, 0.3) !important;
        border-bottom: 2px solid #ff0000 !important;
        box-shadow: 0 0 3px rgba(255, 0, 0, 0.4) !important;
      }
      
      .ace_dark .ace_editor .ace_selection .json-error-marker,
      .ace_dark .ace_editor .ace_selected-word .json-error-marker,
      .ace_dark .ace_editor .ace_line .ace_selection .json-error-marker {
        background-color: rgba(255, 100, 100, 0.25) !important;
        border-bottom: 2px solid #ff6666 !important;
        box-shadow: 0 0 3px rgba(255, 100, 100, 0.4) !important;
      }
      
      /* Additional specificity for active line highlighting */
      .ace_editor .ace_active-line .json-error-marker {
        background-color: rgba(255, 0, 0, 0.25) !important;
        border-bottom: 2px solid #ff0000 !important;
      }
      
      .ace_dark .ace_editor .ace_active-line .json-error-marker {
        background-color: rgba(255, 100, 100, 0.2) !important;
        border-bottom: 2px solid #ff6666 !important;
      }
    `
    if (!document.head.querySelector('#json-error-styles')) {
      style.id = 'json-error-styles'
      document.head.appendChild(style)
    }
  }, [])

  // Helper function to recursively sort object keys
  const sortObjectKeys = (obj: any, ascending: boolean = true): any => {
    if (Array.isArray(obj)) {
      return obj.map(item => sortObjectKeys(item, ascending))
    } else if (obj !== null && typeof obj === 'object') {
      const keys = Object.keys(obj).sort((a, b) => 
        ascending ? a.localeCompare(b) : b.localeCompare(a)
      )
      const sortedObj: any = {}
      keys.forEach(key => {
        sortedObj[key] = sortObjectKeys(obj[key], ascending)
      })
      return sortedObj
    }
    return obj
  }

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const options = { duration: type === 'error' ? 6000 : 4000 }
    switch (type) {
      case 'success':
        toast.success(message, options)
        break
      case 'error':
        toast.error(message, options)
        break
      case 'warning':
        toast.warning(message, options)
        break
      case 'info':
        toast.info(message, options)
        break
    }
  }

  // Show progress for long operations
  const showProgress = (message: string, progress?: number) => {
    setOperationProgress({ show: true, message, progress })
  }

  const hideProgress = () => {
    setOperationProgress({ show: false, message: '', progress: undefined })
  }

  // Show upgrade modal for premium features
  const showUpgrade = (feature: string) => {
    setUpgradeFeature(feature)
    setShowUpgradeModal(true)
  }

  // Edge case handling for large JSON
  const isLargeJson = (content: string) => content.length > 50000
  const isVeryLargeJson = (content: string) => content.length > 200000

  const handleLargeJsonWarning = (content: string) => {
    if (isVeryLargeJson(content)) {
      showToast('Very large JSON detected - some operations may be slow', 'warning')
    } else if (isLargeJson(content)) {
      showToast('Large JSON detected - consider using smaller files for better performance', 'info')
    }
  }

  // Enhanced operation wrapper with performance monitoring
  const performOperation = async (operationName: string, operation: () => void | Promise<void>) => {
    try {
      setIsLoading(true)
      
      // Check memory before operation
      if (isMemoryHigh()) {
        showToast('High memory usage detected - operation may be slow', 'warning')
      }
      
      startTimer(operationName)
      await operation()
      const timing = endTimer(operationName, true)
      
      if (timing && typeof timing === 'object') {
        if (timing.isVeryLarge) {
          showToast(`Operation completed in ${(timing.duration / 1000).toFixed(1)}s - consider using smaller files`, 'warning')
        } else if (timing.duration > 1000) {
          showToast(`Operation completed in ${(timing.duration / 1000).toFixed(1)}s`, 'info')
        }
      }
      
    } catch (error) {
      showToast(`Operation failed: ${(error as Error).message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // JSON operation functions
  const handleFormat = () => {
    if (!jsonContent.trim()) {
      showToast('Please enter some JSON content', 'error')
      return
    }

    handleLargeJsonWarning(jsonContent)
    
    performOperation('format', () => {
      const parsed = JSON.parse(jsonContent)
      const formatted = JSON.stringify(parsed, null, 2)
      setJsonContent(formatted)
      showToast('JSON formatted successfully')
    })
  }

  const handleCompact = () => {
    if (!jsonContent.trim()) {
      showToast('Please enter some JSON content', 'error')
      return
    }

    handleLargeJsonWarning(jsonContent)
    
    performOperation('compact', () => {
      const parsed = JSON.parse(jsonContent)
      const compacted = JSON.stringify(parsed)
      setJsonContent(compacted)
      showToast('JSON compacted successfully')
    })
  }

  const handleSortAsc = () => {
    if (!jsonContent.trim()) {
      showToast('Please enter some JSON content', 'error')
      return
    }

    handleLargeJsonWarning(jsonContent)
    
    performOperation('sort-asc', () => {
      const parsed = JSON.parse(jsonContent)
      const sorted = sortObjectKeys(parsed, true)
      const formatted = JSON.stringify(sorted, null, 2)
      setJsonContent(formatted)
      showToast('JSON keys sorted alphabetically (A-Z)')
    })
  }

  const handleSortDesc = () => {
    if (!jsonContent.trim()) {
      showToast('Please enter some JSON content', 'error')
      return
    }

    handleLargeJsonWarning(jsonContent)
    
    performOperation('sort-desc', () => {
      const parsed = JSON.parse(jsonContent)
      const sorted = sortObjectKeys(parsed, false)
      const formatted = JSON.stringify(sorted, null, 2)
      setJsonContent(formatted)
      showToast('JSON keys sorted alphabetically (Z-A)')
    })
  }

  const handleCopy = async () => {
    if (!jsonContent.trim()) {
      showToast('No content to copy', 'error')
      return
    }

    try {
      await navigator.clipboard.writeText(jsonContent)
      showToast('JSON copied to clipboard')
    } catch (error) {
      showToast('Failed to copy to clipboard', 'error')
    }
  }

  const handleLoadSample = () => {
    const sampleData = {
      "users": [
        {
          "id": 1,
          "name": "John Doe",
          "email": "john.doe@example.com",
          "address": {
            "street": "123 Main St",
            "city": "New York",
            "zipCode": "10001",
            "coordinates": {
              "lat": 40.7128,
              "lng": -74.0060
            }
          },
          "preferences": {
            "theme": "dark",
            "notifications": true,
            "language": "en"
          },
          "roles": ["user", "admin"],
          "isActive": true,
          "lastLogin": "2024-12-28T10:30:00Z"
        },
        {
          "id": 2,
          "name": "Jane Smith",
          "email": "jane.smith@example.com",
          "address": {
            "street": "456 Oak Ave",
            "city": "Los Angeles",
            "zipCode": "90210",
            "coordinates": {
              "lat": 34.0522,
              "lng": -118.2437
            }
          },
          "preferences": {
            "theme": "light",
            "notifications": false,
            "language": "es"
          },
          "roles": ["user"],
          "isActive": false,
          "lastLogin": "2024-12-25T14:20:00Z"
        }
      ],
      "metadata": {
        "total": 2,
        "page": 1,
        "limit": 10,
        "hasMore": false
      }
    }
    
    setJsonContent(JSON.stringify(sampleData, null, 2))
    setUploadError(null) // Clear any upload errors
    showToast('Sample JSON data loaded')
  }

  const handleClear = () => {
    setJsonContent('')
    setUploadError(null) // Clear any upload errors
    showToast('Editor cleared')
  }

  const handleRepair = () => {
    if (!jsonContent.trim()) {
      showToast('Please enter some content to repair', 'error')
      return
    }

    handleLargeJsonWarning(jsonContent)
    
    performOperation('repair', () => {
      // First, check if JSON is already valid
      try {
        JSON.parse(jsonContent)
        // If it's already valid, just format it nicely
        const parsed = JSON.parse(jsonContent)
        const formatted = JSON.stringify(parsed, null, 2)
        setJsonContent(formatted)
        setUploadError(null)
        showToast('JSON is already valid - reformatted for readability!')
        return
      } catch {
        // JSON is invalid, proceed with repair
      }

      let repairedJson = jsonContent

      // 1. Remove comments (single line and multi-line)
      repairedJson = repairedJson.replace(/\/\*[\s\S]*?\*\//g, '')
      repairedJson = repairedJson.replace(/\/\/.*$/gm, '')
      
      // 2. Remove JSONP wrapper (if present)
      repairedJson = repairedJson.replace(/^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(\s*/, '')
      repairedJson = repairedJson.replace(/\s*\)\s*;?\s*$/, '')
      
      // 3. Fix control characters ONLY inside string literals (between quotes)
      repairedJson = repairedJson.replace(/"([^"\\]*)"/g, (match, content) => {
        const fixed = content.replace(/[\x00-\x1F\x7F]/g, (char: string) => {
          switch (char) {
            case '\n': return '\\n'
            case '\r': return '\\r'
            case '\t': return '\\t'
            case '\b': return '\\b'
            case '\f': return '\\f'
            default: return '' // Remove other control characters
          }
        })
        return '"' + fixed + '"'
      })
      
      // 4. Fix smart quotes and other Unicode quotes to standard ASCII quotes
      // Replace various types of quotes with standard double quotes
      repairedJson = repairedJson.replace(/[""'']/g, '"')
      repairedJson = repairedJson.replace(/['']/g, "'")
      
      // 5. Replace single quotes with double quotes for string values
      repairedJson = repairedJson.replace(/:\s*'([^']*)'/g, ': "$1"')
      
      // 6. Fix property names with wrong quotes or add missing quotes
      repairedJson = repairedJson.replace(/([{,]\s*)([""''`]?)([a-zA-Z_$][a-zA-Z0-9_$]*)([""''`]?)\s*:/g, (match, prefix, startQuote, propName, endQuote) => {
        // Always use proper double quotes for property names
        return prefix + '"' + propName + '":'
      })
      
      // 7. Handle unquoted property names (fallback)
      repairedJson = repairedJson.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, (match, prefix, propName) => {
        // Check if the property name is already properly quoted
        if (match.includes('"' + propName + '"')) {
          return match
        }
        return prefix + '"' + propName + '":'
      })
      
      // 6. Remove trailing commas
      repairedJson = repairedJson.replace(/,(\s*[}\]])/g, '$1')
      
      // 7. Try to parse and format to validate
      try {
        const parsed = JSON.parse(repairedJson)
        const formatted = JSON.stringify(parsed, null, 2)
        setJsonContent(formatted)
        setUploadError(null) // Clear any upload errors
        showToast('JSON repaired and formatted successfully!')
      } catch {
        // If still invalid, at least return the attempted repair
        setJsonContent(repairedJson)
        showToast('JSON partially repaired, but still contains errors. Please check manually.', 'error')
      }
    })
  }
  
  // Backer feature placeholders
  // File upload functionality
  const handleFileUpload = useCallback((file: File) => {
    if (!isBackerUser) {
      showToast('File upload requires backer membership', 'error')
      return
    }

    // Validate file type - accept JSON and text files
    const validExtensions = ['.json', '.txt']
    const validTypes = ['application/json', 'text/plain', 'text/json']
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    const hasValidType = validTypes.includes(file.type)
    
    if (!hasValidExtension && !hasValidType) {
      setUploadError('Please upload a JSON or text file (.json, .txt)')
      return
    }

    // Validate file size (5MB limit for backer, 1MB for free)
    const maxSize = isBackerUser ? 5 * 1024 * 1024 : 1024 * 1024 // 5MB for backer, 1MB for free
    if (file.size > maxSize) {
      setUploadError(`File size exceeds ${isBackerUser ? '5MB' : '1MB'} limit`)
      return
    }

    setIsLoading(true)
    setUploadError(null)
    
    // Show progress for large files
    if (file.size > 1024 * 1024) {
      showProgress('Processing large file...', 0)
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        
        if (file.size > 1024 * 1024) {
          showProgress('Loading content...', 75)
        }
        
        // Always load the content - let validation system show any JSON errors
        setJsonContent(content)
        setUploadError(null) // Clear any previous upload errors
        
        // Check for large JSON and show performance warning
        handleLargeJsonWarning(content)
        
        // Switch to editor mode when uploading files so users can edit
        if (showTreeView) {
          setShowTreeView(false)
        }
        
        // Check if it's valid JSON for the success message
        try {
          JSON.parse(content)
          showToast(`Successfully loaded valid JSON from ${file.name}`, 'success')
        } catch {
          showToast(`Loaded ${file.name} - use repair button to fix JSON errors`, 'warning')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to read file content'
        setUploadError(errorMessage)
        showToast(`Failed to read file: ${errorMessage}`, 'error')
      } finally {
        setIsLoading(false)
        hideProgress()
      }
    }
    reader.onerror = () => {
      const errorMessage = 'Failed to read file'
      setUploadError(errorMessage)
      showToast(errorMessage, 'error')
      setIsLoading(false)
      hideProgress()
    }
    reader.readAsText(file)
  }, [isBackerUser, showToast])

  const handleUpload = () => {
    if (!isBackerUser) {
      showUpgrade('File Upload')
      return
    }
    
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,.txt,application/json,text/plain'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleFileUpload(file)
      }
    }
    input.click()
  }

  const handleDownload = () => {
    if (!isBackerUser) {
      showUpgrade('File Download')
      return
    }

    if (!jsonContent.trim()) {
      showToast('No content to download', 'error')
      return
    }

    try {
      // Check if JSON is valid to determine file type and message
      let isValidJson = false
      let fileExtension = '.txt'
      let mimeType = 'text/plain'
      
      try {
        JSON.parse(jsonContent)
        isValidJson = true
        fileExtension = '.json'
        mimeType = 'application/json'
      } catch {
        // Content is not valid JSON, download as text file
      }
      
      const blob = new Blob([jsonContent], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `json-editor-content-${new Date().toISOString().split('T')[0]}${fileExtension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      if (isValidJson) {
        showToast('Valid JSON file downloaded successfully', 'success')
      } else {
        showToast('Content downloaded as text file (invalid JSON)', 'success')
      }
    } catch (error) {
      showToast('Failed to download file', 'error')
    }
  }

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const validFile = files.find(file => {
      const validExtensions = ['.json', '.txt']
      const validTypes = ['application/json', 'text/plain', 'text/json']
      const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
      const hasValidType = validTypes.includes(file.type)
      return hasValidExtension || hasValidType
    })

    if (validFile) {
      handleFileUpload(validFile)
    } else {
      setUploadError('Please drop a JSON or text file (.json, .txt)')
    }
  }, [handleFileUpload])

  // Conversion functions
  const convertJson = useCallback(async (targetFormat: string) => {
    if (!isBackerUser) {
      showUpgrade('Format Conversion')
      return
    }

    if (!jsonContent.trim()) {
      showToast('No content to convert', 'error')
      return
    }

    try {
      setIsLoading(true)
      showProgress('Preparing conversion...', 0)
      
      let parsed: any
      let converted = ''
      
      // Parse JSON first
      try {
        parsed = JSON.parse(jsonContent)
      } catch (error) {
        showToast('Invalid JSON - please fix errors before converting', 'error')
        return
      }

      showProgress(`Converting to ${targetFormat.toUpperCase()}...`, 25)

      switch (targetFormat) {
        case 'xml':
          showProgress('Loading XML converter...', 50)
          const xmlJs = await import('xml-js')
          showProgress('Converting to XML...', 75)
          converted = xmlJs.json2xml(jsonContent, { compact: true, spaces: 2 })
          break
        
        case 'csv':
          const json2csv = await import('json2csv')
          // Handle arrays vs single objects
          const data = Array.isArray(parsed) ? parsed : [parsed]
          converted = json2csv.parse(data)
          break
        
        case 'yaml':
          const jsYaml = await import('js-yaml')
          converted = jsYaml.dump(parsed, { indent: 2 })
          break
        
        case 'javascript':
          // Convert to JavaScript object literal
          converted = `const data = ${JSON.stringify(parsed, null, 2)};`
          break
        
        default:
          throw new Error('Unsupported format')
      }

      setConvertedContent(converted)
      setConversionMode(targetFormat)
      setShowConversionPanel(true)
      showProgress('Finalizing conversion...', 100)
      showToast(`Successfully converted to ${targetFormat.toUpperCase()}`, 'success')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to convert to ${targetFormat}`
      showToast(`Conversion failed: ${errorMessage}`, 'error')
      console.error('Conversion error:', error)
    } finally {
      setIsLoading(false)
      hideProgress()
    }
  }, [jsonContent, isBackerUser, showToast])

  const convertToJson = useCallback(async (sourceFormat: string, content: string) => {
    if (!isBackerUser) {
      showUpgrade('Format Conversion')
      return
    }

    try {
      setIsLoading(true)
      let jsonResult: any

      switch (sourceFormat) {
        case 'xml':
          const xmlJs = await import('xml-js')
          const xmlOptions = { compact: true, spaces: 2 }
          jsonResult = xmlJs.xml2json(content, xmlOptions)
          break
        
        case 'yaml':
          const jsYaml = await import('js-yaml')
          jsonResult = jsYaml.load(content)
          break
        
        case 'javascript':
          // Extract JavaScript object - basic approach
          const jsCode = content.replace(/^const\s+\w+\s*=\s*/, '').replace(/;$/, '')
          jsonResult = eval(`(${jsCode})`)
          break
        
        default:
          throw new Error('Unsupported source format')
      }

      const formattedJson = JSON.stringify(jsonResult, null, 2)
      setJsonContent(formattedJson)
      setShowConversionPanel(false)
      showToast(`Successfully converted from ${sourceFormat.toUpperCase()} to JSON`, 'success')
    } catch (error) {
      showToast(`Failed to convert from ${sourceFormat}: ${(error as Error).message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }, [isBackerUser, showToast])

  const closeConversionPanel = () => {
    setShowConversionPanel(false)
    setConversionMode(null)
    setConvertedContent('')
  }

  const getConversionMode = (format: string) => {
    switch (format) {
      case 'xml': return 'xml'
      case 'yaml': return 'yaml'
      case 'javascript': return 'javascript'
      case 'csv': return 'text'
      default: return 'text'
    }
  }

  // Load snippets on component mount
  useEffect(() => {
    if (userId && isBackerUser) {
      loadSnippets()
    }
  }, [userId, isBackerUser])

  const loadSnippets = async () => {
    if (!userId) return
    
    try {
      const userSnippets = await snippetsService.getUserSnippets(userId)
      setSnippets(userSnippets)
    } catch (error) {
      showToast('Failed to load snippets', 'error')
    }
  }

  const handleSaveSnippet = () => {
    if (!isBackerUser) {
      showUpgrade('Snippet Management')
      return
    }
    
    if (!userId) {
      showToast('Please sign in to save snippets', 'error')
      return
    }

    if (!jsonContent.trim()) {
      showToast('No content to save', 'error')
      return
    }

    // Validate JSON before saving
    try {
      JSON.parse(jsonContent)
    } catch (error) {
      showToast('Cannot save invalid JSON - please fix errors first', 'error')
      return
    }

    setShowSaveDialog(true)
  }

  const handleSaveDialogSubmit = async () => {
    if (!saveDialogData.name.trim()) {
      showToast('Please enter a name for the snippet', 'error')
      return
    }

    // Check snippet size
    if (jsonContent.length > 100000) {
      showToast('Snippet is too large (max 100KB)', 'error')
      return
    }

    try {
      setIsLoading(true)
      showProgress('Saving snippet...', 50)
      
      await snippetsService.createSnippet(userId!, {
        name: saveDialogData.name.trim(),
        category: saveDialogData.category,
        content: jsonContent,
        description: saveDialogData.description.trim() || undefined
      })
      
      showToast('Snippet saved successfully')
      setShowSaveDialog(false)
      setSaveDialogData({ name: '', category: 'general', description: '' })
      loadSnippets() // Refresh the list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save snippet'
      showToast(`Save failed: ${errorMessage}`, 'error')
      console.error('Save snippet error:', error)
    } finally {
      setIsLoading(false)
      hideProgress()
    }
  }

  const handleLoadSnippet = (snippet: JsonSnippet) => {
    setJsonContent(snippet.content)
    setShowLoadDialog(false)
    
    // Switch to editor mode if in tree view
    if (showTreeView) {
      setShowTreeView(false)
    }
    
    showToast(`Loaded snippet: ${snippet.name}`)
  }

  const handleDeleteSnippet = async (snippetId: string) => {
    try {
      await snippetsService.deleteSnippet(snippetId)
      showToast('Snippet deleted successfully')
      loadSnippets() // Refresh the list
    } catch (error) {
      showToast('Failed to delete snippet', 'error')
    }
  }

  const handleToggleFavorite = async (snippet: JsonSnippet) => {
    try {
      await snippetsService.updateSnippet(snippet.id, {
        is_favorite: !snippet.is_favorite
      })
      loadSnippets() // Refresh the list
      showToast(snippet.is_favorite ? 'Removed from favorites' : 'Added to favorites')
    } catch (error) {
      showToast('Failed to update favorite status', 'error')
    }
  }

  const getFilteredSnippets = () => {
    if (selectedCategory === 'all') return snippets
    if (selectedCategory === 'favorites') return snippets.filter(s => s.is_favorite)
    return snippets.filter(s => s.category === selectedCategory)
  }

  const getAvailableCategories = () => {
    const usedCategories = Array.from(new Set(snippets.map(s => s.category)))
    return [...DEFAULT_CATEGORIES, ...usedCategories.filter(cat => !DEFAULT_CATEGORIES.includes(cat as any))]
  }

  // Tree view functions
  const toggleTreeView = () => {
    if (!isBackerUser) {
      showUpgrade('Tree Visualization')
      return
    }

    const newShowTreeView = !showTreeView
    setShowTreeView(newShowTreeView)
    
    if (newShowTreeView && jsonContent.trim()) {
      try {
        const parsed = JSON.parse(jsonContent)
        setTreeData(parsed)
        showToast('Switched to tree view mode')
      } catch (error) {
        setTreeData(null)
        showToast('Invalid JSON - fix errors to view tree structure', 'error')
      }
    } else if (!newShowTreeView) {
      showToast('Switched to editor mode')
    } else if (newShowTreeView && !jsonContent.trim()) {
      showToast('Add JSON content to see tree visualization', 'error')
    }
  }



  // Keyboard shortcuts implementation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as any)?.contentEditable === 'true'
      ) {
        return
      }

      const { ctrlKey, shiftKey, key } = event
      
      // Handle F1 for help (not requiring Ctrl)
      if (key === 'F1') {
        event.preventDefault()
        // Trigger help panel open event
        const helpEvent = new CustomEvent('json-formatter-help', { detail: { action: 'open' } })
        window.dispatchEvent(helpEvent)
        return
      }
      
      if (ctrlKey) {
        switch (key.toLowerCase()) {
          case 'f':
            event.preventDefault()
            handleFormat()
            break
          case 'm':
            event.preventDefault()
            handleCompact()
            break
          case 'r':
            event.preventDefault()
            handleRepair()
            break
          case 'l':
            event.preventDefault()
            handleLoadSample()
            break
          case 's':
            if (shiftKey) {
              event.preventDefault()
              handleSortAsc()
            }
            // Don't prevent default Ctrl+S (browser save) - let it work normally
            break
          case 'a':
            if (shiftKey) {
              event.preventDefault()
              handleSortDesc()
            }
            break
          case 'o':
            event.preventDefault()
            if (isBackerUser) {
              handleUpload()
            } else {
              showUpgrade('File Upload')
            }
            break
          default:
            break
        }
      }
      
      // Handle Alt key combinations to avoid browser conflicts
      if (event.altKey) {
        switch (key.toLowerCase()) {
          case 's':
            event.preventDefault()
            if (isBackerUser) {
              handleSaveSnippet()
            } else {
              showUpgrade('Save Snippet')
            }
            break
          case 'l':
            event.preventDefault()
            if (isBackerUser && snippets.length > 0) {
              setShowLoadDialog(true)
            } else if (!isBackerUser) {
              showUpgrade('Load Snippets')
            } else {
              showToast('No saved snippets found', 'info')
            }
            break
          case 'd':
            event.preventDefault()
            if (isBackerUser) {
              handleDownload()
            } else {
              showUpgrade('File Download')
            }
            break
          case 't':
            event.preventDefault()
            if (isBackerUser) {
              toggleTreeView()
            } else {
              showUpgrade('Tree View')
            }
            break
          case 'c':
            event.preventDefault()
            handleCopy()
            break
          default:
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
      }, [isBackerUser, showTreeView, snippets, handleFormat, handleCompact, handleRepair, handleCopy, handleSortAsc, handleSaveSnippet, handleUpload, handleDownload, toggleTreeView, showUpgrade, showToast])

  // Optimized tree data update - using debounced content and performance monitoring
  useEffect(() => {
    if (!showTreeView || !debouncedJsonContent.trim()) {
      setTreeData(null)
      return
    }
    
    // Skip tree view for very large JSON to prevent performance issues
    if (debouncedJsonContent.length > 500000) { // 500KB limit for tree view
      setTreeData(null)
      showToast('JSON too large for tree view - use smaller files for tree visualization', 'warning')
      return
    }
    
    try {
      startTimer('tree-parsing')
      const parsed = JSON.parse(debouncedJsonContent)
      const timing = endTimer('tree-parsing', true)
      
      if (timing && typeof timing === 'object' && timing.isVeryLarge) {
        showToast('Large JSON - tree view may be slow to render', 'warning')
      }
      
      setTreeData(parsed)
    } catch (error) {
      setTreeData(null)
    }
  }, [debouncedJsonContent, showTreeView, startTimer, endTimer])

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('JSON Editor Error:', error, errorInfo)
        toast.error('An unexpected error occurred', {
          description: 'Please try refreshing the page or contact support if the problem persists.',
          duration: 8000
        })
      }}
    >
      <LoadingOverlay
        isLoading={operationProgress.show}
        message={operationProgress.message}
        progress={operationProgress.progress}
      >
        <Card>
      {/* Action Toolbar */}
      <div className="px-4 pt-4 pb-3 border-b">
        {/* Performance indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Validating...
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          {/* Basic Operations Group */}
          <div className="flex flex-wrap gap-1">
            <Tooltip content="Format and beautify JSON with proper indentation (Ctrl+F)">
              <Button
                onClick={handleFormat}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Format
              </Button>
            </Tooltip>
            
            <Tooltip content="Minify JSON by removing whitespace (Ctrl+M)">
              <Button
                onClick={handleCompact}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Minimize2 className="w-4 h-4" />
                Compact
              </Button>
            </Tooltip>
            
            <Tooltip content="Copy JSON content to clipboard (Alt+C)">
              <Button
                onClick={handleCopy}
                disabled={isLoading || !jsonContent}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
            </Tooltip>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-border h-8 self-center mx-1"></div>

          {/* Sort Operations Group */}
          <div className="flex flex-wrap gap-1">
            <Tooltip content="Sort object keys alphabetically (A to Z) (Ctrl+Shift+S)">
              <Button
                onClick={handleSortAsc}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowUpDown className="w-4 h-4" />
                Sort A-Z
              </Button>
            </Tooltip>
            
            <Tooltip content="Sort object keys reverse alphabetically (Z to A) (Ctrl+Shift+A)">
              <Button
                onClick={handleSortDesc}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowDownUp className="w-4 h-4" />
                Sort Z-A
              </Button>
            </Tooltip>
            
            <Tooltip content="Fix common JSON syntax errors and formatting issues (Ctrl+R)">
              <Button
                onClick={handleRepair}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                Repair
              </Button>
            </Tooltip>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-border h-8 self-center mx-1"></div>

          {/* Sample Data Group */}
          <div className="flex flex-wrap gap-1">
            <Tooltip content="Load sample JSON data to test with (Ctrl+L)">
              <Button
                onClick={handleLoadSample}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Sample
              </Button>
            </Tooltip>
            
            <Tooltip content="Clear all content from the editor">
              <Button
                onClick={handleClear}
                disabled={isLoading || !jsonContent}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Clear
              </Button>
            </Tooltip>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-border h-8 self-center mx-1"></div>

          {/* Backer Features Group */}
          <div className="flex flex-wrap gap-1">
            <Tooltip content={isBackerUser ? "Upload JSON or text files (up to 5MB) (Ctrl+O)" : "Upload files - Backer feature (Ctrl+O)"}>
              <Button
                onClick={handleUpload}
                disabled={!isBackerUser || isLoading}
                size="sm"
                variant="outline"
                className={`flex items-center gap-2 relative transition-all duration-200 ${
                  !isBackerUser 
                    ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                    : 'hover:shadow-sm'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload
                {!isBackerUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" />}
              </Button>
            </Tooltip>
            
            <Tooltip content={isBackerUser ? "Download JSON content as a file (Alt+D)" : "Download files - Backer feature (Alt+D)"}>
              <Button
                onClick={handleDownload}
                disabled={!isBackerUser || isLoading || !jsonContent}
                size="sm"
                variant="outline"
                className={`flex items-center gap-2 relative transition-all duration-200 ${
                  !isBackerUser 
                    ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                    : 'hover:shadow-sm'
                }`}
              >
                <Download className="w-4 h-4" />
                Download
                {!isBackerUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" />}
              </Button>
            </Tooltip>
            
            <Tooltip content={isBackerUser ? "Convert JSON to other formats (XML, CSV, YAML, JS)" : "Format conversion - Backer feature"}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={!isBackerUser || isLoading || !jsonContent}
                    size="sm"
                    variant="outline"
                    className={`flex items-center gap-2 relative transition-all duration-200 ${
                      !isBackerUser 
                        ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                        : 'hover:shadow-sm'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Convert
                    <ChevronDown className="w-3 h-3" />
                    {!isBackerUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => convertJson('xml')}>
                    JSON → XML
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => convertJson('csv')}>
                    JSON → CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => convertJson('yaml')}>
                    JSON → YAML
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => convertJson('javascript')}>
                    JSON → JS Object
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Tooltip>
            
            <Tooltip content={isBackerUser ? "Save JSON as a reusable snippet (Alt+S)" : "Save snippets - Backer feature (Alt+S)"}>
              <Button
                onClick={handleSaveSnippet}
                disabled={!isBackerUser || isLoading || !jsonContent || !userId}
                size="sm"
                variant="outline"
                className={`flex items-center gap-2 relative transition-all duration-200 ${
                  !isBackerUser 
                    ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                    : 'hover:shadow-sm'
                }`}
              >
                <Save className="w-4 h-4" />
                Save
                {!isBackerUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" />}
              </Button>
            </Tooltip>
            
            <Tooltip content={isBackerUser ? "Load a saved JSON snippet (Alt+L)" : "Load snippets - Backer feature (Alt+L)"}>
              <Button
                onClick={() => setShowLoadDialog(true)}
                disabled={!isBackerUser || isLoading || !userId || snippets.length === 0}
                size="sm"
                variant="outline"
                className={`flex items-center gap-2 relative transition-all duration-200 ${
                  !isBackerUser 
                    ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                    : 'hover:shadow-sm'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                Load
                {!isBackerUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" />}
              </Button>
            </Tooltip>
            
            <Tooltip content={isBackerUser ? (showTreeView ? "Switch back to editor mode (Alt+T)" : "View JSON as interactive tree (Alt+T)") : "Tree visualization - Backer feature (Alt+T)"}>
              <Button
                onClick={toggleTreeView}
                disabled={!isBackerUser || isLoading || !jsonContent}
                size="sm"
                variant={showTreeView ? "default" : "outline"}
                className={`flex items-center gap-2 relative transition-all duration-200 ${
                  !isBackerUser 
                    ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                    : 'hover:shadow-sm'
                }`}
              >
                <TreePine className="w-4 h-4" />
                {showTreeView ? 'Show Editor' : 'Tree View'}
                {!isBackerUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" />}
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
      
            <CardContent className="p-4">
        {/* Upload Error Display */}
        {uploadError && (
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">{uploadError}</span>
              <Button
                onClick={() => setUploadError(null)}
                size="sm"
                variant="ghost"
                className="ml-auto h-auto p-1 text-red-600 hover:text-red-800"
              >
                ×
              </Button>
            </div>
          </div>
        )}



        <div className={`${showConversionPanel ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : ''}`}>
          {/* JSON Editor or Tree View */}
          <div 
            className={`border rounded-lg overflow-hidden relative transition-colors ${
              isDragOver 
                ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-border'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {showConversionPanel && (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b text-sm font-medium">
                {showTreeView ? 'JSON Tree View' : 'JSON Editor'}
              </div>
            )}
            {isDragOver && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-50/90 dark:bg-blue-900/90 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Drop JSON or text file here
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {isBackerUser ? 'Up to 5MB supported (.json, .txt)' : 'Backer required for file upload'}
                  </p>
                </div>
              </div>
            )}
            
            {showTreeView ? (
              /* Tree View */
              <div className="h-[400px] bg-white dark:bg-gray-900 relative">
                {treeData ? (
                  <div className="h-full overflow-auto p-4" style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  }}>
                    <JSONTree
                      data={treeData}
                      theme={{
                        scheme: isDarkMode ? 'monokai' : 'github',
                        base00: isDarkMode ? '#272822' : '#ffffff', // Background
                        base01: isDarkMode ? '#383830' : '#f6f8fa', // Lighter background
                        base02: isDarkMode ? '#49483e' : '#f0f2f5', // Selection background  
                        base03: isDarkMode ? '#75715e' : '#6a737d', // Comments
                        base04: isDarkMode ? '#a59f85' : '#959da5', // Dark foreground
                        base05: isDarkMode ? '#f8f8f2' : '#24292e', // Default foreground
                        base06: isDarkMode ? '#f5f4f1' : '#1b1f23', // Light foreground
                        base07: isDarkMode ? '#f9f8f5' : '#1c2022', // Lightest foreground
                        base08: isDarkMode ? '#f92672' : '#d73a49', // Variables, XML Tags, Markup Link Text
                        base09: isDarkMode ? '#fd971f' : '#e36209', // Integers, Boolean, Constants
                        base0A: isDarkMode ? '#f4bf75' : '#b08800', // Classes, Markup Bold, Search Text Background
                        base0B: isDarkMode ? '#a6e22e' : '#22863a', // Strings, Inherited Class, Markup Code
                        base0C: isDarkMode ? '#a1efe4' : '#032f62', // Support, Regular Expressions, Escape Characters
                        base0D: isDarkMode ? '#66d9ef' : '#0969da', // Functions, Methods, Attribute IDs, Headings
                        base0E: isDarkMode ? '#ae81ff' : '#6f42c1', // Keywords, Storage, Selector, Markup Italic
                        base0F: isDarkMode ? '#cc6633' : '#e1732a'  // Deprecated, Opening/Closing Embedded Language Tags
                      }}
                      invertTheme={false}
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    {jsonContent.trim() ? (
                      <div className="text-center">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
                        <p className="text-lg font-medium mb-1">Invalid JSON</p>
                        <p className="text-sm">Tree view not available</p>
                        <p className="text-xs mt-2 text-muted-foreground">Fix JSON errors to see tree visualization</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <TreePine className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-lg font-medium mb-1">No JSON Content</p>
                        <p className="text-sm">Add JSON content to see tree visualization</p>
                        <p className="text-xs mt-2 text-muted-foreground">Switch back to editor to paste or load JSON data</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* JSON Editor */
              <AceEditor
                mode="json"
                theme={isDarkMode ? "monokai" : "github"}
                value={jsonContent}
                onChange={setJsonContent}
                onLoad={handleEditorLoad}
                onCursorChange={(selection) => {
                  setCursorPosition({
                    line: selection.cursor.row + 1,
                    column: selection.cursor.column + 1
                  })
                }}
                name="json-editor"
                editorProps={{ $blockScrolling: true }}
                width="100%"
                height="400px"
                fontSize={14}
                showPrintMargin={true}
                showGutter={true}
                highlightActiveLine={true}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: false,
                  showLineNumbers: true,
                  tabSize: 2,
                  wrap: true,
                  printMargin: 80,
                }}
                placeholder="Paste your JSON here..."
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                }}
              />
            )}
          </div>

          {/* Converted Content Editor */}
          {showConversionPanel && (
            <div className="border rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b flex items-center justify-between">
                <span className="text-sm font-medium">
                  {conversionMode?.toUpperCase()} Output
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => convertToJson(conversionMode!, convertedContent)}
                    size="sm"
                    variant="outline"
                    className="text-xs h-6 px-2"
                  >
                    Convert Back to JSON
                  </Button>
                  <Button
                    onClick={closeConversionPanel}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <AceEditor
                mode={getConversionMode(conversionMode!)}
                theme={isDarkMode ? "monokai" : "github"}
                value={convertedContent}
                onChange={setConvertedContent}
                name="converted-editor"
                editorProps={{ $blockScrolling: true }}
                width="100%"
                height="400px"
                fontSize={14}
                showPrintMargin={true}
                showGutter={true}
                highlightActiveLine={true}
                readOnly={false}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: false,
                  showLineNumbers: true,
                  tabSize: 2,
                  wrap: true,
                  printMargin: 80,
                }}
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                }}
              />
            </div>
          )}
        </div>
        
        {/* Performance Status */}
        {debouncedJsonContent && (
          <div className="mt-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border rounded-md">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span>Size: {(debouncedJsonContent.length / 1024).toFixed(1)} KB</span>
                {isLargeJson(debouncedJsonContent) && (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-3 h-3" />
                    Large JSON - operations may be slower
                  </span>
                )}
                {isVeryLargeJson(debouncedJsonContent) && (
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    Very large JSON - consider using smaller files
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {showTreeView ? (
                  treeData && (
                    <span className="text-center">
                      Click arrows to expand/collapse nodes • Switch back to editor to modify JSON
                    </span>
                  )
                ) : (
                  <span>Line {cursorPosition.line}, Column {cursorPosition.column}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cursor Position or Tree View Help - Legacy support */}
        {!debouncedJsonContent && (
          <>
            {showTreeView ? (
              treeData && (
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  Click arrows to expand/collapse nodes • Switch back to editor to modify JSON
                </div>
              )
            ) : (
              <div className="mt-2 text-xs text-muted-foreground text-right">
                Line {cursorPosition.line}, Column {cursorPosition.column}
              </div>
            )}
          </>
        )}
        
        {/* Validation Status */}
        <div className="mt-4">
          {validation.isValid ? (
            jsonContent.trim() && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                  Valid JSON
                </span>
              </div>
            )
          ) : (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-red-800 dark:text-red-200">
                      JSON Validation Error
                    </span>
                    {validation.line && validation.column && (
                      <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded">
                        Line {validation.line}, Column {validation.column}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-red-700 dark:text-red-300 mb-3 font-mono bg-red-100 dark:bg-red-900/30 p-2 rounded">
                    {validation.error}
                  </p>
                  
                  {validation.tip && (
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Tip: </span>
                        {validation.tip}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        
      </CardContent>

      {/* Save Snippet Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Save JSON Snippet</CardTitle>
              <CardDescription>
                Save your JSON content for future use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name *</label>
                <Input
                  placeholder="Enter snippet name..."
                  value={saveDialogData.name}
                  onChange={(e) => setSaveDialogData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <select
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={saveDialogData.category}
                  onChange={(e) => setSaveDialogData(prev => ({ ...prev, category: e.target.value }))}
                >
                  {getAvailableCategories().map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Description (optional)</label>
                <textarea
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm min-h-[80px] resize-none"
                  placeholder="Add a description..."
                  value={saveDialogData.description}
                  onChange={(e) => setSaveDialogData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setShowSaveDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveDialogSubmit}
                  disabled={isLoading || !saveDialogData.name.trim()}
                  className="flex-1"
                >
                  {isLoading ? 'Saving...' : 'Save Snippet'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Load Snippet Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
            <CardHeader>
              <CardTitle>Load JSON Snippet</CardTitle>
              <CardDescription>
                Choose a saved snippet to load into the editor
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {/* Category Filter */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Filter by category</label>
                <select
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Snippets ({snippets.length})</option>
                  <option value="favorites">
                    Favorites ({snippets.filter(s => s.is_favorite).length})
                  </option>
                  {getAvailableCategories().map(category => {
                    const count = snippets.filter(s => s.category === category).length
                    if (count === 0) return null
                    return (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')} ({count})
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Snippets List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {getFilteredSnippets().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No snippets found</p>
                    {selectedCategory !== 'all' && (
                      <p className="text-sm">Try selecting a different category</p>
                    )}
                  </div>
                ) : (
                  getFilteredSnippets().map(snippet => (
                    <div
                      key={snippet.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{snippet.name}</h4>
                            {snippet.is_favorite && (
                              <Star className="w-3 h-3 text-amber-500 flex-shrink-0" />
                            )}
                            <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {snippet.category.replace('-', ' ')}
                            </span>
                          </div>
                          {snippet.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {snippet.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(snippet.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            onClick={() => handleToggleFavorite(snippet)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            {snippet.is_favorite ? (
                              <Star className="w-3 h-3 text-amber-500" />
                            ) : (
                              <StarOff className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            onClick={() => handleDeleteSnippet(snippet.id)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => handleLoadSnippet(snippet)}
                            size="sm"
                            className="h-6 text-xs px-2"
                          >
                            Load
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => setShowLoadDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
        context="json-formatter"
      />
        </Card>
      </LoadingOverlay>
    </ErrorBoundary>
  )
} 