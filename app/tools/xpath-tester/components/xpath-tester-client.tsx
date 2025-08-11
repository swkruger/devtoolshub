'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Copy, 
  Download, 
  Upload, 
  Globe, 
  FileText, 
  Search, 
  Code, 
  HelpCircle,
  Crown,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Clock
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import HtmlEditor from './html-editor'
import SelectorEditor from './selector-editor'
import HelpPanel from './help-panel'

interface MatchResult {
  element: string
  text: string
  attributes: Record<string, string>
  xpath: string
  cssPath: string
}

interface TestResult {
  matches: MatchResult[]
  count: number
  error?: string
  executionTime: number
}

interface XPathTesterClientProps {
  isPremiumUser: boolean;
  userId?: string;
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

export default function XPathTesterClient({ isPremiumUser, userId }: XPathTesterClientProps) {
  const { toast } = useToast()
  const [htmlContent, setHtmlContent] = useState('')
  const [xpathSelector, setXpathSelector] = useState('')
  const [cssSelector, setCssSelector] = useState('')
  const [activeTab, setActiveTab] = useState<'xpath' | 'css'>('xpath')
  const [results, setResults] = useState<TestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [isUrlLoading, setIsUrlLoading] = useState(false)
  const [liveTesting, setLiveTesting] = useState(true)
  const [currentLine, setCurrentLine] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const aceEditorRef = useRef<any>(null)
  const markersRef = useRef<number[]>([])

  // Debounced values for live testing
  const debouncedHtmlContent = useDebounce(htmlContent, 300)
  const debouncedXpathSelector = useDebounce(xpathSelector, 500)
  const debouncedCssSelector = useDebounce(cssSelector, 500)

  // Sample HTML content
  const sampleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample Page</title>
</head>
<body>
    <header class="main-header">
        <nav>
            <ul class="nav-list">
                <li><a href="/" class="nav-link">Home</a></li>
                <li><a href="/about" class="nav-link">About</a></li>
                <li><a href="/contact" class="nav-link">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main class="content">
        <section class="hero">
            <h1 class="title">Welcome to Our Site</h1>
            <p class="description">This is a sample page for testing XPath and CSS selectors.</p>
            <button class="cta-button">Get Started</button>
        </section>
        
        <section class="features">
            <h2>Features</h2>
            <div class="feature-grid">
                <div class="feature-card" data-feature="responsive">
                    <h3>Responsive Design</h3>
                    <p>Works on all devices</p>
                </div>
                <div class="feature-card" data-feature="fast">
                    <h3>Fast Performance</h3>
                    <p>Optimized for speed</p>
                </div>
                <div class="feature-card" data-feature="secure">
                    <h3>Secure</h3>
                    <p>Built with security in mind</p>
                </div>
            </div>
        </section>
    </main>
    
    <footer class="main-footer">
        <p>&copy; 2024 Sample Site. All rights reserved.</p>
    </footer>
</body>
</html>`

  // Sample selectors
  const sampleXPath = '//div[@class="feature-card"]'
  const sampleCSS = '.feature-card'

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

  // Find complete element positions in HTML source for highlighting
  const findElementPositionsInSource = useCallback((matchResults: MatchResult[]) => {
    const positions: Array<{startLine: number, startCol: number, endLine: number, endCol: number, matchIndex: number}> = []

    // For each match result, find ALL complete elements in the HTML
    matchResults.forEach((matchResult, matchIndex) => {
      const elementName = matchResult.element
      const attributes = matchResult.attributes

      // Build search pattern for opening tag
      let openTagPattern = `<${elementName}\\b`
      
      if (attributes.class) {
        // Escape special regex characters in class name
        const escapedClass = attributes.class.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        openTagPattern = `<${elementName}[^>]*class=["'][^"']*\\b${escapedClass}\\b[^"']*["'][^>]*>`
      } else if (Object.keys(attributes).find(attr => attr.startsWith('data-'))) {
        // Use first data attribute if no class
        const dataAttr = Object.keys(attributes).find(attr => attr.startsWith('data-'))!
        const escapedValue = attributes[dataAttr].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        openTagPattern = `<${elementName}[^>]*${dataAttr}=["']${escapedValue}["'][^>]*>`
      } else {
        openTagPattern = `<${elementName}[^>]*>`
      }

      const openTagRegex = new RegExp(openTagPattern, 'gi')
      const htmlText = htmlContent
      let openTagMatch: RegExpExecArray | null
      
      while ((openTagMatch = openTagRegex.exec(htmlText)) !== null) {
        // Find the corresponding closing tag
        const openTagEnd = openTagMatch.index + openTagMatch[0].length
        const restOfHtml = htmlText.substring(openTagEnd)
        
        // Find matching closing tag using simple character-by-character parsing
        let depth = 1
        let i = 0
        
        while (depth > 0 && i < restOfHtml.length) {
          if (restOfHtml[i] === '<') {
            // Check if this is an opening tag of the same element
            const remainingHtml = restOfHtml.substring(i)
            const openMatch = remainingHtml.match(new RegExp(`^<${elementName}\\b[^>]*>`, 'i'))
            const closeMatch = remainingHtml.match(new RegExp(`^</${elementName}>`, 'i'))
            
            if (closeMatch) {
              depth--
              if (depth === 0) {
                // Found the matching closing tag
                const completeElementEnd = openTagEnd + i + closeMatch[0].length
                
                // Convert positions to line/column coordinates
                const beforeStart = htmlText.substring(0, openTagMatch.index)
                const beforeEnd = htmlText.substring(0, completeElementEnd)
                
                const startLineNumber = beforeStart.split('\n').length - 1
                const endLineNumber = beforeEnd.split('\n').length - 1
                
                const startLineStart = beforeStart.lastIndexOf('\n') + 1
                const endLineStart = beforeEnd.lastIndexOf('\n') + 1
                
                const startCol = openTagMatch.index - startLineStart
                const endCol = completeElementEnd - endLineStart

                positions.push({
                  startLine: startLineNumber,
                  startCol: startCol,
                  endLine: endLineNumber,
                  endCol: endCol,
                  matchIndex: matchIndex
                })
                break
              }
              i += closeMatch[0].length
            } else if (openMatch) {
              depth++
              i += openMatch[0].length
            } else {
              i++
            }
          } else {
            i++
          }
        }
      }
    })

    return positions
  }, [htmlContent])

  // Add highlight markers to ace editor
  const highlightMatches = useCallback((matchResults: MatchResult[]) => {
    if (!aceEditorRef.current || matchResults.length === 0) return
    
    const editor = aceEditorRef.current
    const session = editor.getSession()
    const Range = (window as any).ace?.require('ace/range').Range
    
    if (!Range) return

    // Clear previous markers
    clearMarkers()

    // Find positions of matching elements in the HTML source
    const positions = findElementPositionsInSource(matchResults)

    positions.forEach((pos, positionIndex) => {
      // Check if match is on current line (cursor line)
      const isOnCurrentLine = pos.startLine === currentLine
      
      // Add main match marker with different class for current line
      const range = new Range(pos.startLine, pos.startCol, pos.endLine, pos.endCol)
      const baseClass = isOnCurrentLine ? 'ace_xpath_match_current' : 'ace_xpath_match'
      // Use position index for color variety instead of match index
      const colorClass = `ace_xpath_match_${positionIndex % 5}`
      const markerId = session.addMarker(range, `${baseClass} ${colorClass}`, 'text')
      markersRef.current.push(markerId)
    })

    // Add CSS styles for highlighting if not already added
    if (!document.getElementById('ace-xpath-highlight-styles')) {
      const style = document.createElement('style')
      style.id = 'ace-xpath-highlight-styles'
      style.textContent = `
        /* Regular match highlighting */
        .ace_xpath_match_0 { background-color: rgba(255, 255, 0, 0.4); position: absolute; z-index: 10; }
        .ace_xpath_match_1 { background-color: rgba(0, 255, 255, 0.4); position: absolute; z-index: 10; }
        .ace_xpath_match_2 { background-color: rgba(255, 0, 255, 0.4); position: absolute; z-index: 10; }
        .ace_xpath_match_3 { background-color: rgba(0, 255, 0, 0.4); position: absolute; z-index: 10; }
        .ace_xpath_match_4 { background-color: rgba(255, 165, 0, 0.4); position: absolute; z-index: 10; }
        
        /* Current line match highlighting - brighter/more prominent */
        .ace_xpath_match_current.ace_xpath_match_0 { 
          background-color: rgba(255, 255, 0, 0.7); 
          border: 2px solid rgba(255, 255, 0, 0.9);
          box-shadow: 0 0 4px rgba(255, 255, 0, 0.5);
          position: absolute; 
          z-index: 15;
        }
        .ace_xpath_match_current.ace_xpath_match_1 { 
          background-color: rgba(0, 255, 255, 0.7); 
          border: 2px solid rgba(0, 255, 255, 0.9);
          box-shadow: 0 0 4px rgba(0, 255, 255, 0.5);
          position: absolute; 
          z-index: 15;
        }
        .ace_xpath_match_current.ace_xpath_match_2 { 
          background-color: rgba(255, 0, 255, 0.7); 
          border: 2px solid rgba(255, 0, 255, 0.9);
          box-shadow: 0 0 4px rgba(255, 0, 255, 0.5);
          position: absolute; 
          z-index: 15;
        }
        .ace_xpath_match_current.ace_xpath_match_3 { 
          background-color: rgba(0, 255, 0, 0.7); 
          border: 2px solid rgba(0, 255, 0, 0.9);
          box-shadow: 0 0 4px rgba(0, 255, 0, 0.5);
          position: absolute; 
          z-index: 15;
        }
        .ace_xpath_match_current.ace_xpath_match_4 { 
          background-color: rgba(255, 165, 0, 0.7); 
          border: 2px solid rgba(255, 165, 0, 0.9);
          box-shadow: 0 0 4px rgba(255, 165, 0, 0.5);
          position: absolute; 
          z-index: 15;
        }
      `
      document.head.appendChild(style)
    }
  }, [currentLine, clearMarkers, findElementPositionsInSource])

  const loadSample = () => {
    setHtmlContent(sampleHtml)
    if (activeTab === 'xpath') {
      setXpathSelector(sampleXPath)
    } else {
      setCssSelector(sampleCSS)
    }
    toast({
      type: 'success',
      title: 'Sample Loaded',
      description: 'Sample HTML and selector loaded successfully'
    })
  }

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all inputs?')) {
      setHtmlContent('')
      setXpathSelector('')
      setCssSelector('')
      setResults(null)
      toast({
        type: 'success',
        title: 'Cleared',
        description: 'All inputs cleared successfully'
      })
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        type: 'success',
        title: 'Copied',
        description: 'Content copied to clipboard'
      })
    } catch (error) {
      toast({
        type: 'error',
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard'
      })
    }
  }

  const testSelector = useCallback(async (isLive = false) => {
    if (!htmlContent.trim() || (!xpathSelector.trim() && !cssSelector.trim())) {
      if (!isLive) {
        if (!htmlContent.trim()) {
          toast({
            type: 'error',
            title: 'Missing Content',
            description: 'Please enter HTML content'
          })
        } else {
          toast({
            type: 'error',
            title: 'Missing Selector',
            description: 'Please enter a selector'
          })
        }
      }
      return
    }

    const selector = activeTab === 'xpath' ? xpathSelector : cssSelector
    if (!selector.trim()) {
      if (!isLive) {
        toast({
          type: 'error',
          title: 'Missing Selector',
          description: 'Please enter a selector'
        })
      }
      return
    }

    if (!isLive) {
      setIsLoading(true)
    }
    const startTime = performance.now()

    try {
      // Create a DOM parser
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')
      
      let matches: MatchResult[] = []
      let error: string | undefined

      if (activeTab === 'xpath') {
        // XPath evaluation
        try {
          const result = document.evaluate(
            selector,
            doc,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
          )
          
          for (let i = 0; i < result.snapshotLength; i++) {
            const node = result.snapshotItem(i)
            if (node && node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              const attributes: Record<string, string> = {}
              if (element.attributes) {
                for (let j = 0; j < element.attributes.length; j++) {
                  const attr = element.attributes[j]
                  attributes[attr.name] = attr.value
                }
              }
              
              matches.push({
                element: element.nodeName.toLowerCase(),
                text: element.textContent || '',
                attributes,
                xpath: getXPath(element),
                cssPath: getCSSPath(element)
              })
            }
          }
        } catch (e) {
          error = `XPath Error: ${e instanceof Error ? e.message : 'Invalid XPath expression'}`
        }
      } else {
        // CSS selector evaluation
        try {
          const elements = doc.querySelectorAll(selector)
          elements.forEach((element) => {
            const attributes: Record<string, string> = {}
            if (element.attributes) {
              for (let i = 0; i < element.attributes.length; i++) {
                const attr = element.attributes[i]
                attributes[attr.name] = attr.value
              }
            }
            
            matches.push({
              element: element.tagName.toLowerCase(),
              text: element.textContent || '',
              attributes,
              xpath: getXPath(element),
              cssPath: getCSSPath(element)
            })
          })
        } catch (e) {
          error = `CSS Error: ${e instanceof Error ? e.message : 'Invalid CSS selector'}`
        }
      }

      const executionTime = performance.now() - startTime
      
      const testResult = {
        matches,
        count: matches.length,
        error,
        executionTime
      }
      
      setResults(testResult)

      // Highlight matches in the HTML editor
      if (matches.length > 0) {
        highlightMatches(matches)
      } else {
        clearMarkers()
      }

      if (!isLive) {
        if (error) {
          toast({
            type: 'error',
            title: 'XPath Error',
            description: error
          })
        } else if (matches.length === 0) {
          toast({
            type: 'info',
            title: 'No Matches',
            description: 'No matches found for the selector'
          })
        } else {
          toast({
            type: 'success',
            title: 'Matches Found',
            description: `Found ${matches.length} match${matches.length === 1 ? '' : 'es'}`
          })
        }
      }
    } catch (error) {
      if (!isLive) {
        toast({
          type: 'error',
          title: 'Test Failed',
          description: 'Failed to test selector'
        })
      }
    } finally {
      if (!isLive) {
        setIsLoading(false)
      }
    }
  }, [htmlContent, xpathSelector, cssSelector, activeTab, toast, highlightMatches, clearMarkers])

  // Manual test function (non-live)
  const manualTestSelector = useCallback(() => {
    testSelector(false)
  }, [testSelector])

  // Helper functions to get XPath and CSS paths
  const getXPath = (element: Element): string => {
    if (element.id) {
      return `//*[@id="${element.id}"]`
    }
    
    let path = ''
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let index = 1
      let sibling = element.previousSibling
      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === element.nodeName) {
          index++
        }
        sibling = sibling.previousSibling
      }
      
      const tagName = element.nodeName.toLowerCase()
      path = `/${tagName}[${index}]${path}`
      element = element.parentElement as Element
    }
    
    return path
  }

  const getCSSPath = (element: Element): string => {
    if (element.id) {
      return `#${element.id}`
    }
    
    let path = ''
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let selector = element.nodeName.toLowerCase()
      
      if (element.className) {
        const classes = element.className.split(' ').filter(c => c.trim())
        if (classes.length > 0) {
          selector += `.${classes.join('.')}`
        }
      }
      
      path = selector + (path ? ' > ' + path : '')
      element = element.parentElement as Element
    }
    
    return path
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!isPremiumUser) {
      toast({
        type: 'error',
        title: 'Premium Feature',
        description: 'File upload is a premium feature. Please upgrade to use this feature.'
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        type: 'error',
        title: 'File Too Large',
        description: 'File size must be less than 5MB'
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setHtmlContent(content)
      toast({
        type: 'success',
        title: 'File Loaded',
        description: 'HTML file loaded successfully'
      })
    }
    reader.readAsText(file)
  }

  const fetchUrl = async () => {
    if (!urlInput.trim()) {
      toast({
        type: 'error',
        title: 'Missing URL',
        description: 'Please enter a URL'
      })
      return
    }

    if (!isPremiumUser) {
      toast({
        type: 'error',
        title: 'Premium Feature',
        description: 'URL fetching is a premium feature. Please upgrade to use this feature.'
      })
      return
    }

    setIsUrlLoading(true)
    try {
      const response = await fetch(`/api/fetch-url?url=${encodeURIComponent(urlInput)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch URL')
      }
      const data = await response.json()
      setHtmlContent(data.html)
      toast({
        type: 'success',
        title: 'URL Loaded',
        description: 'URL content loaded successfully'
      })
    } catch (error) {
      toast({
        type: 'error',
        title: 'Fetch Failed',
        description: 'Failed to fetch URL content'
      })
    } finally {
      setIsUrlLoading(false)
    }
  }

  const exportResults = () => {
    if (!results || !isPremiumUser) {
      toast({
        type: 'error',
        title: 'Premium Feature',
        description: 'Export is a premium feature. Please upgrade to use this feature.'
      })
      return
    }

    const data = {
      selector: activeTab === 'xpath' ? xpathSelector : cssSelector,
      type: activeTab,
      matches: results.matches,
      count: results.count,
      executionTime: results.executionTime,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `xpath-test-results-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      type: 'success',
      title: 'Exported',
      description: 'Results exported successfully'
    })
  }

  // Live testing effect - automatically test when content changes
  useEffect(() => {
    if (liveTesting && (debouncedHtmlContent || debouncedXpathSelector || debouncedCssSelector)) {
      testSelector(true)
    }
  }, [debouncedHtmlContent, debouncedXpathSelector, debouncedCssSelector, activeTab, liveTesting, testSelector])

  // Re-highlight when current line changes
  useEffect(() => {
    if (results && results.matches.length > 0) {
      highlightMatches(results.matches)
    }
  }, [currentLine, results, highlightMatches])

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      clearMarkers()
    }
  }, [clearMarkers])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault()
        setShowHelp(true)
      } else if (e.ctrlKey && e.key === 't') {
        e.preventDefault()
        manualTestSelector()
      } else if (e.ctrlKey && e.key === 'c' && results) {
        e.preventDefault()
        const resultText = results.matches.map(m => `${m.element}: ${m.text}`).join('\n')
        copyToClipboard(resultText)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [results, manualTestSelector])

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Button onClick={loadSample} variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Load Sample
          </Button>
          <Button onClick={clearAll} variant="outline" size="sm">
            <XCircle className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          <Button onClick={manualTestSelector} disabled={isLoading} size="sm">
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Test Selector
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            disabled={!isPremiumUser}
            className={!isPremiumUser ? 'opacity-50' : ''}
          >
            {!isPremiumUser && <Crown className="w-4 h-4 mr-2" />}
            <Upload className="w-4 h-4 mr-2" />
            Upload HTML
          </Button>
          <Button
            onClick={exportResults}
            variant="outline"
            size="sm"
            disabled={!results || !isPremiumUser}
            className={!isPremiumUser ? 'opacity-50' : ''}
          >
            {!isPremiumUser && <Crown className="w-4 h-4 mr-2" />}
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
          <Button onClick={() => setShowHelp(true)} variant="outline" size="sm">
            <HelpCircle className="w-4 h-4 mr-2" />
            Help
          </Button>
        </div>
      </div>

      {/* Premium URL Input - Only show for premium users */}
      {isPremiumUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Test Against URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter URL to fetch HTML content..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUrl()}
              />
              <Button onClick={fetchUrl} disabled={isUrlLoading}>
                {isUrlLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Interface */}
      <Card>
        {/* Action Toolbar */}
        <div className="px-4 pt-4 pb-3 border-b">
          <div className="flex flex-wrap gap-2">
            {/* Basic Operations Group */}
            <div className="flex flex-wrap gap-1">
              <Button
                onClick={manualTestSelector}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Test Selector
              </Button>

              <Button
                onClick={loadSample}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Load Sample
              </Button>

              <Button
                onClick={clearAll}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Clear All
              </Button>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px bg-border h-8 self-center mx-1"></div>

            {/* Premium Operations Group */}
            <div className="flex flex-wrap gap-1">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                disabled={!isPremiumUser}
                className={!isPremiumUser ? 'opacity-50' : ''}
              >
                {!isPremiumUser && <Crown className="w-4 h-4 mr-1" />}
                <Upload className="w-4 h-4" />
                Upload HTML
              </Button>

              <Button
                onClick={exportResults}
                variant="outline"
                size="sm"
                disabled={!results || !isPremiumUser}
                className={!isPremiumUser ? 'opacity-50' : ''}
              >
                {!isPremiumUser && <Crown className="w-4 h-4 mr-1" />}
                <Download className="w-4 h-4" />
                Export Results
              </Button>
            </div>

            {/* Live Testing Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="live-testing"
                checked={liveTesting}
                onChange={(e) => setLiveTesting(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="live-testing" className="text-sm text-gray-700 dark:text-gray-300">
                Live Testing
              </label>
            </div>

            {/* Status Info */}
            <div className="flex items-center gap-4 ml-auto">
              {results && results.count > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {results.count} match{results.count !== 1 ? 'es' : ''}
                  </span>
                </div>
              )}
              
              {results && results.executionTime && (
                <>
                  <div className="hidden sm:block w-px bg-border h-8 self-center"></div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {results.executionTime.toFixed(2)}ms
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
          {/* Selector Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">Selector</label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'xpath' | 'css')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="xpath">XPath</TabsTrigger>
                    <TabsTrigger value="css">CSS</TabsTrigger>
                  </TabsList>
                  <TabsContent value="xpath" className="mt-4">
                    <Input
                      value={xpathSelector}
                      onChange={(e) => setXpathSelector(e.target.value)}
                      placeholder="Enter XPath selector (e.g., //div[@class='feature-card'])"
                      className="font-mono"
                    />
                  </TabsContent>
                  <TabsContent value="css" className="mt-4">
                    <Input
                      value={cssSelector}
                      onChange={(e) => setCssSelector(e.target.value)}
                      placeholder="Enter CSS selector (e.g., .feature-card)"
                      className="font-mono"
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          {/* HTML Content Editor */}
          <div>
            <label className="text-sm font-medium mb-2 block">HTML Content</label>
            <div className="border rounded-lg overflow-hidden">
                             <HtmlEditor
                 value={htmlContent}
                 onChange={setHtmlContent}
                 placeholder="Enter HTML content to test against..."
                 onLoad={(editor) => {
                   aceEditorRef.current = editor
                 }}
                 onCursorChange={(selection) => {
                   const newLine = selection.cursor.row
                   if (newLine !== currentLine) {
                     setCurrentLine(newLine)
                   }
                 }}
               />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {results && results.error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="text-red-800 dark:text-red-200">
              <strong>Error:</strong> {results.error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Results */}
      {results && results.matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Results
              <Badge variant="secondary">
                {results.count} match{results.count === 1 ? '' : 'es'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Success</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Execution time: {results.executionTime.toFixed(2)}ms
                  </span>
                </div>
                <Button
                  onClick={() => copyToClipboard(JSON.stringify(results.matches, null, 2))}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All
                </Button>
              </div>

              {/* Matches */}
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {results.matches.map((match, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {match.element}
                        </span>
                        <Button
                          onClick={() => copyToClipboard(match.text)}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {match.text.length > 100 ? `${match.text.substring(0, 100)}...` : match.text}
                      </p>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <strong>XPath:</strong> {match.xpath}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <strong>CSS:</strong> {match.cssPath}
                        </div>
                        {Object.keys(match.attributes).length > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <strong>Attributes:</strong> {Object.entries(match.attributes).map(([k, v]) => `${k}="${v}"`).join(' ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results State */}
      {results && results.matches.length === 0 && !results.error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No matches found for the selector</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".html,.htm,.xml"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Help Panel */}
      {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}
    </div>
  )
} 