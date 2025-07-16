"use client"

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Play, 
  X, 
  FileText, 
  Download, 
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Trash2
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { getRegexEngine } from '../lib/regex-engines'
import type { RegexLanguage, RegexMatch } from '../lib/regex-engines'

interface BulkTestItem {
  id: string
  name: string
  content: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  matches?: RegexMatch[]
  error?: string
  executionTime?: number
}

interface BulkTestResults {
  totalItems: number
  completedItems: number
  totalMatches: number
  averageExecutionTime: number
  successRate: number
}

interface BulkTestingProps {
  isOpen: boolean
  onClose: () => void
  isPremiumUser: boolean
  pattern: string
  language: RegexLanguage
  flags: string[]
}

export function BulkTesting({ isOpen, onClose, isPremiumUser, pattern, language, flags }: BulkTestingProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [testItems, setTestItems] = useState<BulkTestItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<BulkTestResults | null>(null)
  const [manualInput, setManualInput] = useState('')

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addManualInput = useCallback(() => {
    if (!manualInput.trim()) {
      toast({
        type: 'warning',
        title: 'Empty input',
        description: 'Please enter some text to test'
      })
      return
    }

    const newItem: BulkTestItem = {
      id: generateId(),
      name: `Manual Input ${testItems.length + 1}`,
      content: manualInput.trim(),
      status: 'pending'
    }

    setTestItems(prev => [...prev, newItem])
    setManualInput('')
    
    toast({
      type: 'success',
      title: 'Input added',
      description: 'Text added to bulk testing queue'
    })
  }, [manualInput, testItems.length, toast])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (content) {
          const newItem: BulkTestItem = {
            id: generateId(),
            name: file.name,
            content: content,
            status: 'pending'
          }

          setTestItems(prev => [...prev, newItem])
          
          toast({
            type: 'success',
            title: 'File uploaded',
            description: `Added ${file.name} to bulk testing queue`
          })
        }
      }
      reader.readAsText(file)
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [toast])

  const removeItem = useCallback((id: string) => {
    setTestItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const clearAllItems = useCallback(() => {
    setTestItems([])
    setResults(null)
    setProgress(0)
  }, [])

  const runBulkTest = useCallback(async () => {
    if (!isPremiumUser) {
      toast({
        type: 'warning',
        title: 'Premium Feature',
        description: 'Bulk testing requires a premium plan'
      })
      return
    }

    if (!pattern) {
      toast({
        type: 'warning',
        title: 'No pattern',
        description: 'Please enter a regex pattern to test'
      })
      return
    }

    if (testItems.length === 0) {
      toast({
        type: 'warning',
        title: 'No test data',
        description: 'Please add some text inputs or upload files to test'
      })
      return
    }

    setIsProcessing(true)
    setProgress(0)
    
    const engine = getRegexEngine(language)
    const updatedItems: BulkTestItem[] = []
    let totalMatches = 0
    let totalExecutionTime = 0
    let successCount = 0

    for (let i = 0; i < testItems.length; i++) {
      const item = testItems[i]
      
      // Update item status to processing
      setTestItems(prev => prev.map(prevItem => 
        prevItem.id === item.id 
          ? { ...prevItem, status: 'processing' as const }
          : prevItem
      ))

      try {
        const startTime = performance.now()
        const result = engine.test(pattern, item.content, flags)
        const endTime = performance.now()
        const executionTime = endTime - startTime

        if (result.isValid) {
          const updatedItem: BulkTestItem = {
            ...item,
            status: 'completed',
            matches: result.matches,
            executionTime: executionTime
          }
          updatedItems.push(updatedItem)
          totalMatches += result.matches.length
          totalExecutionTime += executionTime
          successCount++
        } else {
          const updatedItem: BulkTestItem = {
            ...item,
            status: 'error',
            error: result.error || 'Pattern validation failed'
          }
          updatedItems.push(updatedItem)
        }
      } catch (error) {
        const updatedItem: BulkTestItem = {
          ...item,
          status: 'error',
          error: 'Unexpected error during testing'
        }
        updatedItems.push(updatedItem)
      }

      // Update progress
      const progressPercent = ((i + 1) / testItems.length) * 100
      setProgress(progressPercent)

      // Update item status to completed/error
      setTestItems(prev => prev.map(prevItem => 
        prevItem.id === item.id 
          ? updatedItems[updatedItems.length - 1]
          : prevItem
      ))

      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    // Calculate final results
    const finalResults: BulkTestResults = {
      totalItems: testItems.length,
      completedItems: successCount,
      totalMatches: totalMatches,
      averageExecutionTime: successCount > 0 ? totalExecutionTime / successCount : 0,
      successRate: (successCount / testItems.length) * 100
    }

    setResults(finalResults)
    setIsProcessing(false)
    
    toast({
      type: 'success',
      title: 'Bulk testing completed',
      description: `Processed ${testItems.length} items with ${totalMatches} total matches`
    })
  }, [isPremiumUser, pattern, language, flags, testItems, toast])

  const exportResults = useCallback(() => {
    if (!results || testItems.length === 0) return

    const csvData = [
      ['Name', 'Status', 'Matches', 'Execution Time (ms)', 'Error'],
      ...testItems.map(item => [
        item.name,
        item.status,
        item.matches?.length || 0,
        item.executionTime?.toFixed(2) || '',
        item.error || ''
      ])
    ]

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `regex-bulk-test-results-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      type: 'success',
      title: 'Results exported',
      description: 'Bulk testing results saved as CSV file'
    })
  }, [results, testItems, toast])

  const copyResultsSummary = useCallback(() => {
    if (!results) return

    const summary = `Bulk Testing Results
Pattern: ${pattern}
Language: ${language}
Flags: ${flags.join('')}

Total Items: ${results.totalItems}
Successful Tests: ${results.completedItems}
Total Matches: ${results.totalMatches}
Success Rate: ${results.successRate.toFixed(1)}%
Average Execution Time: ${results.averageExecutionTime.toFixed(2)}ms`

    navigator.clipboard.writeText(summary).then(() => {
      toast({
        type: 'success',
        title: 'Copied to clipboard',
        description: 'Results summary copied to clipboard'
      })
    })
  }, [results, pattern, language, flags, toast])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Bulk Testing
                {!isPremiumUser && (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                    Premium
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Test your regex pattern against multiple text inputs
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Pattern Info */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <span><strong>Pattern:</strong> <code className="font-mono bg-muted px-1 py-0.5 rounded">{pattern || 'No pattern set'}</code></span>
              <span><strong>Language:</strong> {language}</span>
              <span><strong>Flags:</strong> {flags.join('') || 'none'}</span>
            </div>
          </div>

          {/* Input Methods */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Manual Input */}
            <div>
              <h3 className="font-medium mb-2">Add Text Input</h3>
              <div className="space-y-2">
                <textarea
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Enter text to test against your pattern..."
                  className="w-full p-2 border rounded-lg resize-none h-20 text-sm"
                  disabled={isProcessing}
                />
                <Button onClick={addManualInput} size="sm" disabled={isProcessing || !manualInput.trim()}>
                  Add Input
                </Button>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <h3 className="font-medium mb-2">Upload Files</h3>
              <div className="space-y-2">
                <div 
                  className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload text files
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".txt,.log,.json,.xml,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>

          {/* Test Items */}
          {testItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Test Items ({testItems.length})</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={runBulkTest}
                    disabled={isProcessing || !pattern || !isPremiumUser}
                    size="sm"
                  >
                    {isProcessing ? (
                      <>
                        <Clock className="h-3 w-3 mr-1 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Run Tests
                      </>
                    )}
                  </Button>
                  <Button onClick={clearAllItems} variant="outline" size="sm" disabled={isProcessing}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                </div>
              </div>

              {isProcessing && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Processing...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {testItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {item.status === 'pending' && <Clock className="h-4 w-4 text-gray-400" />}
                        {item.status === 'processing' && <Clock className="h-4 w-4 text-blue-500 animate-spin" />}
                        {item.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {item.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {item.content.slice(0, 100)}{item.content.length > 100 ? '...' : ''}
                        </div>
                        {item.status === 'completed' && (
                          <div className="text-xs text-green-600">
                            {item.matches?.length || 0} matches in {item.executionTime?.toFixed(2)}ms
                          </div>
                        )}
                        {item.status === 'error' && (
                          <div className="text-xs text-red-600">
                            Error: {item.error}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => removeItem(item.id)}
                      variant="ghost"
                      size="sm"
                      disabled={isProcessing}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Summary */}
          {results && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Results Summary</h3>
                <div className="flex gap-2">
                  <Button onClick={copyResultsSummary} variant="outline" size="sm">
                    <Copy className="h-3 w-3 mr-1" />
                    Copy Summary
                  </Button>
                  <Button onClick={exportResults} variant="outline" size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Export CSV
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{results.totalItems}</div>
                  <div className="text-xs text-muted-foreground">Total Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{results.completedItems}</div>
                  <div className="text-xs text-muted-foreground">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.totalMatches}</div>
                  <div className="text-xs text-muted-foreground">Total Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{results.successRate.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{results.averageExecutionTime.toFixed(1)}ms</div>
                  <div className="text-xs text-muted-foreground">Avg Time</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 