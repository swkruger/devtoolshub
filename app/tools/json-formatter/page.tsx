"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { authClient } from "@/lib/auth"
import { 
  FileJson, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  AlertCircle, 
  Wand2, 
  Minimize2, 
  Crown,
  RotateCcw,
  FileX
} from "lucide-react"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { JSONTree } from 'react-json-tree'
import AceEditor from 'react-ace'

import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-noconflict/ext-language_tools'
import * as yaml from 'js-yaml'
import * as convert from 'xml-js'
import { Parser } from 'json2csv'

interface ValidationError {
  message: string
  line?: number
  column?: number
  suggestion?: string
}

type OutputFormat = 'json' | 'xml' | 'csv' | 'yaml'
type JsonAction = 'format' | 'minify' | 'validate'

const theme = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
  base00: '#272822',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633'
}

export default function JsonFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<ValidationError | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [copied, setCopied] = useState(false)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('json')
  const [outputViewMode, setOutputViewMode] = useState<'code' | 'tree'>('code')
  const [inputViewMode, setInputViewMode] = useState<'editor' | 'highlighted'>('editor')
  const [parsedJson, setParsedJson] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formattedInput, setFormattedInput] = useState('')
  const [formattedError, setFormattedError] = useState<ValidationError | null>(null)

  const validateJson = useCallback((jsonString: string): ValidationError | null => {
    if (!jsonString.trim()) {
      return { message: 'Input is empty', suggestion: 'Please enter some JSON data' }
    }

    try {
      JSON.parse(jsonString)
      return null
    } catch (error) {
      const err = error as SyntaxError
      const message = err.message
      
      // Enhanced line/column extraction with better debugging
      let line, column
      
      console.log('🔍 Error message:', message)
      console.log('🔍 JSON string length:', jsonString.length)
      console.log('🔍 JSON string has lines:', jsonString.split('\n').length)
      
      // Try different patterns to extract position
      const positionMatch = message.match(/position (\d+)/i)
      const lineMatch = message.match(/line (\d+)/i)
      const columnMatch = message.match(/column (\d+)/i)
      
      if (positionMatch) {
        const position = parseInt(positionMatch[1])
        console.log('🔍 Found position match:', position)
        const beforeError = jsonString.substring(0, position)
        const lines = beforeError.split('\n')
        line = lines.length
        column = lines[lines.length - 1].length + 1
        console.log('🔍 Calculated line from position:', line, 'column:', column)
      } else if (lineMatch) {
        line = parseInt(lineMatch[1])
        column = columnMatch ? parseInt(columnMatch[1]) : 1
        console.log('🔍 Found line match:', line, 'column:', column)
      } else {
        console.log('🔍 No position/line match, trying error pattern search...')
        
        // Extract the problematic text from the error message
        // Look for patterns like: "Unexpected token 'x'" or quoted text snippets
        let searchPattern = ''
        
        // Try to extract the problematic token/text from error message
        const tokenMatch = message.match(/Unexpected token ['"]?([^'".,\s]+)['"]?/)
        const snippetMatch = message.match(/\.\.\."([^"]+)"\.\.\./)
        const beforeMatch = message.match(/"([^"]*)" is not valid JSON/)
        const errorContextMatch = message.match(/\.\.\."[^"]*":\[?\{?"[^"]*":([^,\s}]+)/)
        
        console.log('🔍 Checking patterns:')
        console.log('  - tokenMatch:', tokenMatch)
        console.log('  - snippetMatch:', snippetMatch)
        console.log('  - beforeMatch:', beforeMatch)
        console.log('  - errorContextMatch:', errorContextMatch)
        
        if (errorContextMatch) {
          searchPattern = errorContextMatch[1]
          console.log('🔍 Found error context value:', searchPattern)
        } else if (tokenMatch && tokenMatch[1].length > 1) {
          searchPattern = tokenMatch[1]
          console.log('🔍 Found problematic token:', searchPattern)
        } else if (snippetMatch) {
          searchPattern = snippetMatch[1]
          console.log('🔍 Found error snippet:', searchPattern)
        } else if (beforeMatch) {
          searchPattern = beforeMatch[1]
          console.log('🔍 Found error context:', searchPattern)
        }
        
        // Search for the pattern in the formatted JSON
        if (searchPattern) {
          const lines = jsonString.split('\n')
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(searchPattern)) {
              line = i + 1 // Convert to 1-based line numbering
              column = lines[i].indexOf(searchPattern) + 1
              console.log('🔍 Found error pattern on line', line, 'column', column)
              console.log('🔍 Line content:', lines[i])
              break
            }
          }
        }
        
        // Fallback: try to find error by parsing incrementally
        if (!line) {
          console.log('🔍 Pattern search failed, trying incremental parsing...')
          for (let i = 0; i < jsonString.length; i++) {
            try {
              JSON.parse(jsonString.substring(0, i + 1))
            } catch {
              const beforeError = jsonString.substring(0, i)
              const lines = beforeError.split('\n')
              line = lines.length
              column = lines[lines.length - 1].length + 1
              console.log('🔍 Found error at character', i, 'which is line', line, 'column', column)
              console.log('🔍 Error context:', jsonString.substring(Math.max(0, i-20), i+20))
              break
            }
          }
        }
      }
      
      console.log('🎯 Final calculated line:', line, 'column:', column)

      // Provide helpful suggestions
      let suggestion = ''
      if (message.includes('Unexpected token')) {
        if (message.includes("'")) {
          suggestion = 'Try using double quotes instead of single quotes for strings'
        } else if (message.includes(',')) {
          suggestion = 'Check for trailing commas, which are not allowed in JSON'
        } else {
          suggestion = 'Check for syntax errors like missing quotes or brackets'
        }
      } else if (message.includes('Unexpected end')) {
        suggestion = 'Check for missing closing brackets or quotes'
      } else if (message.includes('duplicate')) {
        suggestion = 'Remove duplicate keys in objects'
      }



      return {
        message: message,
        line,
        column,
        suggestion: suggestion || 'Check JSON syntax and formatting'
      }
    }
  }, [])

  // Check premium status
  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const user = await authClient.getUser()
        if (user) {
          const profile = await authClient.getUserProfile(user.id)
          setIsPremium(profile?.plan === 'premium' || false)
        }
      } catch (error) {
        console.error('Error checking premium status:', error)
      }
    }
    checkPremiumStatus()
  }, [])

  // Update formatted input when switching to highlighted mode
  useEffect(() => {
    if (inputViewMode === 'highlighted' && input) {
      try {
        // Try to parse and format the JSON for better line separation
        const parsed = JSON.parse(input)
        const formatted = JSON.stringify(parsed, null, 2)
        setFormattedInput(formatted)
        setFormattedError(null) // Clear error if JSON is valid
        console.log('✅ JSON is valid, formatted successfully')
      } catch {
        console.log('❌ JSON parsing failed, attempting to format for error detection...')
        
        // For invalid JSON, use a very basic formatting approach
        console.log('🔄 Input contains newlines?', input.includes('\n'))
        console.log('🔄 Input length:', input.length)
        console.log('🔄 First 100 chars of input:', input.substring(0, 100))
        
        let formatted = input
        
        // Always format for invalid JSON
        console.log('🔄 Forcing formatting for better error visibility')
        
        // Much simpler: just split on commas to create multiple lines
        const parts = input.split(',')
        formatted = parts.join(',\n')
        
        console.log('🔄 After comma splitting, number of lines:', formatted.split('\n').length)
        console.log('🔄 After comma splitting, first 200 chars:', formatted.substring(0, 200) + '...')
        
        console.log('📝 Formatted content for error detection:', formatted)
        setFormattedInput(formatted)
        
        // Re-validate the formatted content to get correct line numbers for highlighting
        console.log('🔍 Re-validating formatted content...')
        const formattedValidationError = validateJson(formatted)
        console.log('🎯 Formatted validation result:', formattedValidationError)
        setFormattedError(formattedValidationError)
      }
    } else if (inputViewMode === 'editor') {
      // Clear formatted states when switching back to simple editor
      setFormattedInput('')
      setFormattedError(null)
    }
  }, [inputViewMode, input, validateJson])

  const formatJson = useCallback((jsonString: string, spaces: number = 2): string => {
    try {
      const parsed = JSON.parse(jsonString)
      return JSON.stringify(parsed, null, spaces)
    } catch (error) {
      throw new Error('Invalid JSON')
    }
  }, [])

  const minifyJson = useCallback((jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString)
      return JSON.stringify(parsed)
    } catch (error) {
      throw new Error('Invalid JSON')
    }
  }, [])

  const convertToXml = useCallback((jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString)
      
      // Helper function to recursively convert JSON to XML structure
      const jsonToXmlElements = (obj: any, parentKey?: string): any => {
        if (obj === null || obj === undefined) {
          return { type: 'text', text: '' }
        }
        
        if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
          return { type: 'text', text: String(obj) }
        }
        
        if (Array.isArray(obj)) {
          return obj.map((item, index) => ({
            type: 'element',
            name: parentKey ? `${parentKey}_item` : 'item',
            elements: [jsonToXmlElements(item)]
          }))
        }
        
        if (typeof obj === 'object') {
          return Object.keys(obj).map(key => ({
            type: 'element',
            name: key,
            elements: Array.isArray(jsonToXmlElements(obj[key], key)) 
              ? jsonToXmlElements(obj[key], key)
              : [jsonToXmlElements(obj[key], key)]
          }))
        }
        
        return { type: 'text', text: String(obj) }
      }
      
      const xmlStructure = {
        elements: [{
          type: 'element',
          name: 'root',
          elements: jsonToXmlElements(parsed)
        }]
      }
      
      const options = {
        compact: false,
        ignoreComment: true,
        spaces: 2
      }
      
      return convert.js2xml(xmlStructure, options)
    } catch (error) {
      throw new Error('Failed to convert to XML')
    }
  }, [])

  const convertToCsv = useCallback((jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString)
      
      // Handle array of objects
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
        const parser = new Parser()
        return parser.parse(parsed)
      }
      
      // Handle single object
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        const flattened = [parsed]
        const parser = new Parser()
        return parser.parse(flattened)
      }
      
      // Handle primitive values or mixed arrays
      const flattened = Array.isArray(parsed) 
        ? parsed.map((item, index) => ({ index, value: item }))
        : [{ value: parsed }]
      
      const parser = new Parser()
      return parser.parse(flattened)
    } catch (error) {
      throw new Error('Failed to convert to CSV')
    }
  }, [])

  const convertToYaml = useCallback((jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString)
      return yaml.dump(parsed, { indent: 2 })
    } catch (error) {
      throw new Error('Failed to convert to YAML')
    }
  }, [])

  const processJson = useCallback((action: JsonAction) => {
    setIsProcessing(true)
    setError(null)

    try {
      const validationError = validateJson(input)
      if (validationError) {
        setError(validationError)
        setOutput('')
        setParsedJson(null)
        // Auto-switch to highlighted mode for premium users when there's an error
        if (isPremium && validationError.line) {
          setInputViewMode('highlighted')
        }
        return
      }

      let result = ''
      const parsed = JSON.parse(input)
      setParsedJson(parsed)

      switch (action) {
        case 'format':
          result = formatJson(input)
          break
        case 'minify':
          result = minifyJson(input)
          break
        case 'validate':
          result = 'JSON is valid! ✅'
          break
      }

      setOutput(result)
      
      // Auto-switch to tree view for JSON formatting if user prefers it
      if (action === 'format' && outputViewMode === 'tree') {
        setOutputViewMode('tree')
      }
      
      // Reset to editor mode when JSON is valid (successful processing)
      if (inputViewMode === 'highlighted') {
        setInputViewMode('editor')
      }
    } catch (error) {
      const errorObj = {
        message: (error as Error).message,
        suggestion: 'Please check your JSON syntax'
      }
      setError(errorObj)
      setOutput('')
      setParsedJson(null)
      // Auto-switch to highlighted mode for premium users when there's an error
      if (isPremium) {
        setInputViewMode('highlighted')
      }
    } finally {
      setIsProcessing(false)
    }
  }, [input, validateJson, formatJson, minifyJson, isPremium, inputViewMode])

  const convertFormat = useCallback((format: OutputFormat) => {
    setIsProcessing(true)
    setError(null)

    try {
      const validationError = validateJson(input)
      if (validationError) {
        setError(validationError)
        setOutput('')
        // Auto-switch to highlighted mode for premium users when there's an error
        if (isPremium && validationError.line) {
          setInputViewMode('highlighted')
        }
        return
      }

      let result = ''
      switch (format) {
        case 'json':
          result = formatJson(input)
          break
        case 'xml':
          result = convertToXml(input)
          break
        case 'csv':
          result = convertToCsv(input)
          break
        case 'yaml':
          result = convertToYaml(input)
          break
      }

      setOutput(result)
      setOutputFormat(format)
      
      // Reset to code view for non-JSON formats
      if (format !== 'json') {
        setOutputViewMode('code')
      }
      
      // Reset to editor mode when JSON is valid (successful processing)
      if (inputViewMode === 'highlighted') {
        setInputViewMode('editor')
      }
    } catch (error) {
      const errorObj = {
        message: (error as Error).message,
        suggestion: 'Please check your JSON syntax'
      }
      setError(errorObj)
      setOutput('')
      // Auto-switch to highlighted mode for premium users when there's an error
      if (isPremium) {
        setInputViewMode('highlighted')
      }
    } finally {
      setIsProcessing(false)
    }
  }, [input, validateJson, formatJson, convertToXml, convertToCsv, convertToYaml, isPremium, inputViewMode])

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }, [output])

  const downloadFile = useCallback(() => {
    if (!isPremium) return

    const mimeTypes = {
      json: 'application/json',
      xml: 'application/xml',
      csv: 'text/csv',
      yaml: 'application/x-yaml'
    }

    const blob = new Blob([output], { type: mimeTypes[outputFormat] })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formatted.${outputFormat}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [output, outputFormat, isPremium])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPremium) return

    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setInput(content)
    }
    reader.readAsText(file)
  }, [isPremium])

  const clearAll = useCallback(() => {
    setInput('')
    setOutput('')
    setError(null)
    setParsedJson(null)
    setOutputViewMode('code')
    setInputViewMode('editor')
    setFormattedInput('')
    setFormattedError(null)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-4xl">📄</span>
          <div>
            <h1 className="text-3xl font-bold">JSON Formatter</h1>
            <p className="text-muted-foreground">Format, validate, and convert JSON data with advanced features</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {/* Basic Actions */}
              <Button 
                onClick={() => processJson('format')} 
                disabled={isProcessing}
                variant="default"
              >
                <FileJson className="h-4 w-4 mr-2" />
                Format / Beautify
              </Button>
              
              <Button 
                onClick={() => processJson('minify')} 
                disabled={isProcessing}
                variant="outline"
              >
                <Minimize2 className="h-4 w-4 mr-2" />
                Minify
              </Button>
              
              <Button 
                onClick={() => processJson('validate')} 
                disabled={isProcessing}
                variant="outline"
              >
                <Check className="h-4 w-4 mr-2" />
                Validate
              </Button>

              {/* Format Conversion */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Convert to:</span>
                <Select value={outputFormat} onValueChange={(value: OutputFormat) => convertFormat(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="xml">XML</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="yaml">YAML</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Upload File */}
              <label className={`${!isPremium ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <Input
                  type="file"
                  accept=".json,.txt"
                  onChange={isPremium ? handleFileUpload : undefined}
                  className="hidden"
                  disabled={!isPremium}
                />
                <Button 
                  type="button"
                  variant="outline" 
                  disabled={!isPremium}
                  className="pointer-events-none"
                >
                  {!isPremium && <Crown className="h-4 w-4 mr-2" />}
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </label>

              <Button onClick={clearAll} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Input JSON</CardTitle>
                <CardDescription>
                  {inputViewMode === 'editor' 
                    ? 'Paste your JSON data here' 
                    : 'Enhanced editor with syntax highlighting and auto-completion'
                  }
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {/* Input View Mode Toggle - show when there's input and error for highlighting */}
                {input && (
                  <div className="flex border rounded-md">
                    <Button
                      onClick={() => setInputViewMode('editor')}
                      size="sm"
                      variant={inputViewMode === 'editor' ? 'default' : 'ghost'}
                      className="rounded-r-none"
                    >
                      Simple
                    </Button>
                    <Button
                      onClick={() => isPremium ? setInputViewMode('highlighted') : undefined}
                      size="sm"
                      variant={inputViewMode === 'highlighted' ? 'default' : 'ghost'}
                      className="rounded-l-none"
                      disabled={!isPremium}
                    >
                      {!isPremium && <Crown className="h-3 w-3 mr-1" />}
                      Enhanced
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {inputViewMode === 'highlighted' && isPremium ? (
              <div className="relative">
                <AceEditor
                  mode="json"
                  theme="monokai"
                  name="json-editor"
                  width="100%"
                  height="400px"
                  fontSize={14}
                  showPrintMargin={false}
                  showGutter={true}
                  highlightActiveLine={true}
                  value={(() => {
                    // If we have formatted input, use it; otherwise try to format on the fly
                    if (formattedInput) return formattedInput
                    if (!input) return ''
                    
                    // Quick format for display - just add line breaks for better visibility
                    if (!input.includes('\n')) {
                      return input
                        .replace(/,(?=\s*")/g, ',\n')
                        .replace(/\{/g, '{\n')
                        .replace(/\[/g, '[\n')
                        .replace(/\}/g, '\n}')
                        .replace(/\]/g, '\n]')
                    }
                    
                    return input
                  })()}
                  onChange={(value) => {
                    console.log('🔄 AceEditor onChange triggered')
                    setInput(value)
                    // Real-time validation of the current editor content
                    const currentError = validateJson(value)
                    console.log('🔍 Real-time validation result:', currentError)
                    setFormattedError(currentError)
                    // Only clear formatted input if user significantly changes content
                    if (Math.abs(value.length - (formattedInput || input).length) > 10) {
                      setFormattedInput('')
                      console.log('📝 Cleared formatted input due to significant changes')
                    }
                  }}
                  setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: false,
                    showLineNumbers: true,
                    tabSize: 2,
                    wrap: true,
                    useWorker: false // Disable worker to avoid CORS issues
                  }}
                  annotations={(() => {
                    // In enhanced mode, only use formattedError for accurate line numbers
                    const currentError = formattedError
                    if (currentError && currentError.line) {
                      console.log(`🔥 Adding error annotation at line ${currentError.line}`)
                      return [
                        {
                          row: currentError.line - 1, // Ace uses 0-based indexing
                          column: Math.max(0, (currentError.column || 1) - 1),
                          text: `${currentError.message}${currentError.suggestion ? ' - ' + currentError.suggestion : ''}`,
                          type: 'error'
                        }
                      ]
                    }
                    return []
                  })()}
                  markers={(() => {
                    // In enhanced mode, only use formattedError for accurate line numbers
                    const currentError = formattedError
                    if (currentError && currentError.line) {
                      return [
                        {
                          startRow: currentError.line - 1,
                          startCol: 0,
                          endRow: currentError.line - 1,
                          endCol: 1000, // Cover the entire line
                          className: 'error-marker',
                          type: 'fullLine' as const
                        }
                      ]
                    }
                    return []
                  })()}
                />
                <style jsx>{`
                  :global(.error-marker) {
                    background-color: rgba(239, 68, 68, 0.2) !important;
                    border-left: 4px solid #dc2626 !important;
                    position: absolute;
                  }
                `}</style>
                <div className="mt-2 text-xs text-muted-foreground">
                  💡 Enhanced editor with syntax highlighting, auto-completion, and real-time error detection.
                  {formattedError && (
                    <span className="text-red-400 ml-1">
                      Error on line {formattedError.line} highlighted with annotation.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your JSON here..."
                className="min-h-[400px] font-mono text-sm"
              />
            )}
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card>
          <CardHeader>
                          <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Output</CardTitle>
                  <CardDescription>
                    Formatted result
                    {outputFormat !== 'json' && (
                      <Badge variant="secondary" className="ml-2">
                        {outputFormat.toUpperCase()}
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {/* View Mode Toggle - show for JSON format */}
                  {output && outputFormat === 'json' && parsedJson && (
                    <div className="flex border rounded-md">
                      <Button
                        onClick={() => setOutputViewMode('code')}
                        size="sm"
                        variant={outputViewMode === 'code' ? 'default' : 'ghost'}
                        className="rounded-r-none"
                      >
                        Code
                      </Button>
                      <Button
                        onClick={() => isPremium ? setOutputViewMode('tree') : undefined}
                        size="sm"
                        variant={outputViewMode === 'tree' ? 'default' : 'ghost'}
                        className="rounded-l-none"
                        disabled={!isPremium}
                      >
                        {!isPremium && <Crown className="h-3 w-3 mr-1" />}
                        Tree
                      </Button>
                    </div>
                  )}
                  {output && (
                    <Button onClick={copyToClipboard} size="sm" variant="outline">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  )}
                  {output && (
                    <Button 
                      onClick={isPremium ? downloadFile : undefined} 
                      size="sm" 
                      variant="outline"
                      disabled={!isPremium}
                    >
                      {!isPremium && <Crown className="h-3 w-3 mr-1" />}
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
          </CardHeader>
          <CardContent>
            {((inputViewMode === 'highlighted' && formattedError) ? formattedError : error) && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <p className="text-destructive font-semibold mb-1">Validation Error</p>
                    <p className="text-sm text-destructive mb-2">
                      {((inputViewMode === 'highlighted' && formattedError) ? formattedError : error)?.message}
                    </p>
                    {((inputViewMode === 'highlighted' && formattedError) ? formattedError : error)?.line && 
                     ((inputViewMode === 'highlighted' && formattedError) ? formattedError : error)?.column && (
                      <div className="bg-destructive/20 border border-destructive/30 rounded p-2 mb-2">
                        <p className="text-xs text-destructive font-mono">
                          🎯 Error detected at Line {((inputViewMode === 'highlighted' && formattedError) ? formattedError : error)?.line}, Column {((inputViewMode === 'highlighted' && formattedError) ? formattedError : error)?.column}
                          {isPremium && inputViewMode === 'highlighted' && formattedError && (
                            <span className="ml-2 text-green-600">← Highlighted in enhanced editor</span>
                          )}
                        </p>
                      </div>
                    )}
                    {((inputViewMode === 'highlighted' && formattedError) ? formattedError : error)?.suggestion && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">Suggestion:</span> {((inputViewMode === 'highlighted' && formattedError) ? formattedError : error)?.suggestion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {output ? (
              <div className="relative">
                {outputFormat === 'json' && parsedJson && outputViewMode === 'tree' && isPremium ? (
                  <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[400px] text-sm">
                    <JSONTree
                      data={parsedJson}
                      theme={theme}
                      invertTheme={false}
                      shouldExpandNodeInitially={(keyPath: any, data: any, level: number) => level < 3}
                      getItemString={(type: string, data: any, itemType: any, itemString: string) => (
                        <span className="text-gray-400">
                          {type === 'Array' ? `[${data.length}]` : type === 'Object' ? `{${Object.keys(data).length}}` : itemString}
                        </span>
                      )}
                    />
                  </div>
                ) : (
                  <SyntaxHighlighter
                    language={outputFormat === 'json' ? 'json' : outputFormat}
                    style={vscDarkPlus}
                    className="max-h-[400px] rounded-lg text-sm"
                    showLineNumbers
                  >
                    {output}
                  </SyntaxHighlighter>
                )}
              </div>
            ) : (
              <div className="min-h-[400px] flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <FileX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Output will appear here after processing
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>



      {/* Premium Features Promotion */}
      {!isPremium && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Unlock Premium Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">🌲 Interactive Tree View</h4>
                <p className="text-sm text-muted-foreground">
                  Toggle between Code and Tree view modes. Explore JSON with collapsible nodes and expand/collapse functionality
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">📁 File Operations</h4>
                <p className="text-sm text-muted-foreground">
                  Upload JSON files directly and download formatted results in any format
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">🚀 Large File Support</h4>
                <p className="text-sm text-muted-foreground">
                  Process JSON files larger than 5MB without limitations
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">⚡ Enhanced Editor</h4>
                <p className="text-sm text-muted-foreground">
                  Editable syntax highlighting, auto-completion, live error detection, and advanced formatting
                </p>
              </div>
            </div>
            <Button className="mt-4" size="lg">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 