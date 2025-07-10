"use client"

import { useState, useEffect, useCallback } from "react"
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
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Dynamic import for AceEditor to avoid SSR issues
const AceEditor = dynamic(
  async () => {
    const ace = await import("react-ace")
    
    // Import ace modules after react-ace is loaded
    if (typeof window !== 'undefined') {
      await import("ace-builds/src-noconflict/mode-json")
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
  isPremiumUser: boolean
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

export function JsonEditor({ isPremiumUser }: JsonEditorProps) {
  const [jsonContent, setJsonContent] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true })
  const [editorRef, setEditorRef] = useState<any>(null)

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
      tokenEnd = Math.min(tokenStart + 1, lineContent.length)
    }
    
    return {
      startRow: errorLine - 1, // Convert to 0-based
      startCol: tokenStart,
      endRow: errorLine - 1,
      endCol: tokenEnd
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
      const positionMatch = errorMessage.match(/at position (\d+)|line (\d+) column (\d+)/)
      if (positionMatch) {
        if (positionMatch[1]) {
          // Convert position to line/column
          const position = parseInt(positionMatch[1])
          const lines = content.substring(0, position).split('\n')
          line = lines.length
          column = lines[lines.length - 1].length + 1
        } else if (positionMatch[2] && positionMatch[3]) {
          line = parseInt(positionMatch[2])
          column = parseInt(positionMatch[3])
        }
      }

      // Calculate the error range for highlighting
      if (line && column) {
        range = findErrorRange(content, line, column)
      }

      // Provide helpful tips for common JSON errors
      if (errorMessage.includes('Unexpected token')) {
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

  // Debounced validation effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const result = validateJson(jsonContent)
      setValidation(result)
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [jsonContent, validateJson])

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

  // Show toast notification (placeholder - would implement with actual toast library)
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`${type.toUpperCase()}: ${message}`)
    // TODO: Implement with actual toast component
  }

  // JSON operation functions
  const handleFormat = () => {
    if (!jsonContent.trim()) {
      showToast('Please enter some JSON content', 'error')
      return
    }

    try {
      setIsLoading(true)
      const parsed = JSON.parse(jsonContent)
      const formatted = JSON.stringify(parsed, null, 2)
      setJsonContent(formatted)
      showToast('JSON formatted successfully')
    } catch (error) {
      showToast('Invalid JSON: ' + (error as Error).message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompact = () => {
    if (!jsonContent.trim()) {
      showToast('Please enter some JSON content', 'error')
      return
    }

    try {
      setIsLoading(true)
      const parsed = JSON.parse(jsonContent)
      const compacted = JSON.stringify(parsed)
      setJsonContent(compacted)
      showToast('JSON compacted successfully')
    } catch (error) {
      showToast('Invalid JSON: ' + (error as Error).message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSortAsc = () => {
    if (!jsonContent.trim()) {
      showToast('Please enter some JSON content', 'error')
      return
    }

    try {
      setIsLoading(true)
      const parsed = JSON.parse(jsonContent)
      const sorted = sortObjectKeys(parsed, true)
      const formatted = JSON.stringify(sorted, null, 2)
      setJsonContent(formatted)
      showToast('JSON keys sorted alphabetically (A-Z)')
    } catch (error) {
      showToast('Invalid JSON: ' + (error as Error).message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSortDesc = () => {
    if (!jsonContent.trim()) {
      showToast('Please enter some JSON content', 'error')
      return
    }

    try {
      setIsLoading(true)
      const parsed = JSON.parse(jsonContent)
      const sorted = sortObjectKeys(parsed, false)
      const formatted = JSON.stringify(sorted, null, 2)
      setJsonContent(formatted)
      showToast('JSON keys sorted alphabetically (Z-A)')
    } catch (error) {
      showToast('Invalid JSON: ' + (error as Error).message, 'error')
    } finally {
      setIsLoading(false)
    }
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
    showToast('Sample JSON data loaded')
  }

  const handleClear = () => {
    setJsonContent('')
    showToast('Editor cleared')
  }

  const handleRepair = () => {
    if (!jsonContent.trim()) {
      showToast('Please enter some content to repair', 'error')
      return
    }

    try {
      setIsLoading(true)
      let repairedJson = jsonContent

      // 1. Replace single quotes with double quotes (but preserve strings)
      repairedJson = repairedJson.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
      repairedJson = repairedJson.replace(/:\s*'([^']*)'/g, ': "$1"')
      
      // 2. Remove trailing commas
      repairedJson = repairedJson.replace(/,(\s*[}\]])/g, '$1')
      
      // 3. Remove comments (single line and multi-line)
      repairedJson = repairedJson.replace(/\/\*[\s\S]*?\*\//g, '')
      repairedJson = repairedJson.replace(/\/\/.*$/gm, '')
      
      // 4. Remove JSONP wrapper (if present)
      repairedJson = repairedJson.replace(/^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(\s*/, '')
      repairedJson = repairedJson.replace(/\s*\)\s*;?\s*$/, '')
      
      // 5. Fix unescaped quotes in strings (basic attempt)
      repairedJson = repairedJson.replace(/"([^"\\]*)\\?"([^"]*)"([^"\\]*)"/g, '"$1\\"$2\\"$3"')
      
      // 6. Add missing quotes around property names that don't have them
      repairedJson = repairedJson.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
      
      // 7. Remove extra whitespace and clean up
      repairedJson = repairedJson.trim()
      
      // 8. Try to parse and format to validate
      try {
        const parsed = JSON.parse(repairedJson)
        const formatted = JSON.stringify(parsed, null, 2)
        setJsonContent(formatted)
        showToast('JSON repaired and formatted successfully!')
      } catch {
        // If still invalid, at least return the attempted repair
        setJsonContent(repairedJson)
        showToast('JSON partially repaired, but still contains errors. Please check manually.', 'error')
      }
    } catch (error) {
      showToast('Failed to repair JSON: ' + (error as Error).message, 'error')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Premium feature placeholders
  const handleUpload = () => console.log('Upload file (Premium)')
  const handleDownload = () => console.log('Download file (Premium)')
  const handleConvert = () => console.log('Convert format (Premium)')
  const handleSaveSnippet = () => console.log('Save snippet (Premium)')

  return (
    <Card>
      <CardHeader>
        <CardTitle>JSON Editor</CardTitle>
        <CardDescription>
          Paste your JSON data below to format, validate, and manipulate it
        </CardDescription>
      </CardHeader>
      
      {/* Action Toolbar */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-3">
          {/* Basic Operations Group */}
          <div className="flex flex-wrap gap-2">
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
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-border h-8 self-center"></div>

          {/* Sort Operations Group */}
          <div className="flex flex-wrap gap-2">
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
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-border h-8 self-center"></div>

          {/* Sample Data Group */}
          <div className="flex flex-wrap gap-2">
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
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-border h-8 self-center"></div>

          {/* Premium Features Group */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleUpload}
              disabled={!isPremiumUser || isLoading}
              size="sm"
              variant="outline"
              className="flex items-center gap-2 relative"
            >
              <Upload className="w-4 h-4" />
              Upload
              {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1" />}
            </Button>
            
            <Button
              onClick={handleDownload}
              disabled={!isPremiumUser || isLoading || !jsonContent}
              size="sm"
              variant="outline"
              className="flex items-center gap-2 relative"
            >
              <Download className="w-4 h-4" />
              Download
              {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1" />}
            </Button>
            
            <Button
              onClick={handleConvert}
              disabled={!isPremiumUser || isLoading || !jsonContent}
              size="sm"
              variant="outline"
              className="flex items-center gap-2 relative"
            >
              <RefreshCw className="w-4 h-4" />
              Convert
              {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1" />}
            </Button>
            
            <Button
              onClick={handleSaveSnippet}
              disabled={!isPremiumUser || isLoading || !jsonContent}
              size="sm"
              variant="outline"
              className="flex items-center gap-2 relative"
            >
              <Save className="w-4 h-4" />
              Save
              {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1" />}
            </Button>
          </div>
        </div>
      </div>
      
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
                      <AceEditor
              mode="json"
              theme={isDarkMode ? "monokai" : "github"}
              value={jsonContent}
              onChange={setJsonContent}
              onLoad={handleEditorLoad}
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
        </div>
        
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
    </Card>
  )
} 