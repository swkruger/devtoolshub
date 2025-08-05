"use client"

import { useState } from "react"
import { format, fromUnixTime, parseISO, isValid, getUnixTime } from "date-fns"
import { formatInTimeZone } from "date-fns-tz"
import { Upload, Download, FileText, Crown, Copy, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"
import { EnhancedTooltip } from "./enhanced-tooltip"

interface BatchConverterProps {
  isPremiumUser: boolean
  selectedTimezone: string
  selectedFormat: string
}

interface BatchResult {
  input: string
  output: string
  format: string
  error?: string
}

export function BatchConverter({ isPremiumUser, selectedTimezone, selectedFormat }: BatchConverterProps) {
  const { toast } = useToast()
  const [batchInput, setBatchInput] = useState("")
  const [batchResults, setBatchResults] = useState<BatchResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [exportFormat, setExportFormat] = useState("csv")

  // Process batch input
  const processBatch = async () => {
    if (!isPremiumUser) {
      toast({
        type: "warning",
        title: "Premium Required",
        description: "Batch conversion requires a premium plan"
      })
      return
    }

    if (!batchInput.trim()) {
      toast({
        type: "error",
        title: "No Input",
        description: "Please enter timestamps to convert"
      })
      return
    }

    setIsProcessing(true)
    setProgress(0)
    
    try {
      // Split input by newlines and commas, filter out empty entries
      const inputs = batchInput
        .split(/[\n,]/)
        .map(line => line.trim())
        .filter(line => line.length > 0)

      if (inputs.length === 0) {
        throw new Error("No valid timestamps found")
      }

      if (inputs.length > 1000) {
        throw new Error("Maximum 1000 timestamps allowed per batch")
      }

      const results: BatchResult[] = []
      
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i]
        
        try {
          let result: BatchResult
          
          // Try to determine input type and convert
          if (/^\d+$/.test(input)) {
            // Unix timestamp
            const timestamp = parseInt(input)
            const timestampMs = input.length === 10 ? timestamp * 1000 : timestamp
            const date = new Date(timestampMs)
            
            if (!isValid(date)) {
              throw new Error("Invalid timestamp")
            }
            
            let output: string
            if (selectedFormat === 'iso') {
              output = formatInTimeZone(date, selectedTimezone, "yyyy-MM-dd'T'HH:mm:ssXXX")
            } else if (selectedFormat === 'locale') {
              output = formatInTimeZone(date, selectedTimezone, "PPpp")
            } else if (selectedFormat === 'custom-1') {
              output = formatInTimeZone(date, selectedTimezone, "yyyy-MM-dd HH:mm:ss")
            } else if (selectedFormat === 'custom-2') {
              output = formatInTimeZone(date, selectedTimezone, "MM/dd/yyyy h:mm a")
            } else {
              output = formatInTimeZone(date, selectedTimezone, "dd.MM.yyyy HH:mm")
            }
            
            result = {
              input,
              output,
              format: "Unix → Date"
            }
          } else {
            // Date string
            let date: Date
            
            if (input.includes('T') || input.includes('Z')) {
              date = parseISO(input)
            } else {
              date = new Date(input)
            }
            
            if (!isValid(date)) {
              throw new Error("Invalid date format")
            }
            
            const unixTimestamp = getUnixTime(date)
            
            result = {
              input,
              output: unixTimestamp.toString(),
              format: "Date → Unix"
            }
          }
          
          results.push(result)
        } catch (error) {
          results.push({
            input,
            output: "",
            format: "Error",
            error: error instanceof Error ? error.message : "Conversion failed"
          })
        }
        
        // Update progress
        setProgress(((i + 1) / inputs.length) * 100)
        
        // Small delay to prevent UI blocking
        if (i % 50 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1))
        }
      }
      
      setBatchResults(results)
      
      const successCount = results.filter(r => !r.error).length
      const errorCount = results.filter(r => r.error).length
      
      toast({
        type: "success",
        title: "Batch Processing Complete",
        description: `${successCount} successful, ${errorCount} failed`
      })
      
    } catch (error) {
      toast({
        type: "error",
        title: "Batch Processing Failed",
        description: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  // Export results
  const exportResults = () => {
    if (!isPremiumUser || batchResults.length === 0) return

    try {
      let content: string
      let filename: string
      let mimeType: string

      if (exportFormat === "csv") {
        const headers = ["Input", "Output", "Format", "Error"]
        const rows = batchResults.map(result => [
          `"${result.input}"`,
          `"${result.output}"`,
          `"${result.format}"`,
          `"${result.error || ""}"`
        ])
        
        content = [headers.join(","), ...rows.map(row => row.join(","))].join("\n")
        filename = `timestamp_conversion_${Date.now()}.csv`
        mimeType = "text/csv"
      } else {
        // JSON export
        content = JSON.stringify(batchResults, null, 2)
        filename = `timestamp_conversion_${Date.now()}.json`
        mimeType = "application/json"
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      toast({
        type: "success",
        title: "Export Complete",
        description: `Results exported as ${filename}`
      })
    } catch (error) {
      toast({
        type: "error",
        title: "Export Failed",
        description: "Unable to export results"
      })
    }
  }

  // Copy all results
  const copyAllResults = async () => {
    if (!isPremiumUser || batchResults.length === 0) return

    try {
      const successfulResults = batchResults.filter(r => !r.error)
      const content = successfulResults.map(r => r.output).join("\n")
      
      await navigator.clipboard.writeText(content)
      
      toast({
        type: "success",
        title: "Copied!",
        description: `${successfulResults.length} results copied to clipboard`
      })
    } catch (error) {
      toast({
        type: "error",
        title: "Copy Failed",
        description: "Unable to copy to clipboard"
      })
    }
  }

  // Clear results
  const clearResults = () => {
    setBatchResults([])
    setBatchInput("")
  }

  if (!isPremiumUser) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">👑</div>
            <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Batch timestamp conversion is available with a premium plan
            </p>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <p>• Convert up to 1000 timestamps at once</p>
              <p>• Support for mixed input formats</p>
              <p>• Export results as CSV or JSON</p>
              <p>• Progress tracking for large batches</p>
            </div>
            <Button className="mt-4">
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Batch Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="batch-input">
              Timestamps (one per line or comma-separated)
            </Label>
            <Textarea
              id="batch-input"
              placeholder={`1704110400
2024-01-01T12:00:00Z
1609459200000
2021-01-01 00:00:00`}
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supports Unix timestamps (seconds/milliseconds) and date strings. Maximum 1000 entries.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={processBatch} disabled={isProcessing}>
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Process Batch
                </>
              )}
            </Button>
            
            <Button onClick={clearResults} variant="outline" disabled={isProcessing}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {batchResults.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Batch Results ({batchResults.length})
              </CardTitle>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="export-format" className="text-sm">Export:</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <EnhancedTooltip content="Copy all successful results">
                  <Button size="sm" variant="outline" onClick={copyAllResults}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </EnhancedTooltip>
                
                <EnhancedTooltip content="Export results to file">
                  <Button size="sm" variant="outline" onClick={exportResults}>
                    <Download className="h-4 w-4" />
                  </Button>
                </EnhancedTooltip>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {batchResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${
                    result.error 
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' 
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={result.error ? "destructive" : "secondary"}>
                          {result.format}
                        </Badge>
                        <span className="text-xs text-gray-500">#{index + 1}</span>
                      </div>
                      
                      <div className="font-mono text-sm space-y-1">
                        <div className="text-gray-600 dark:text-gray-400">
                          Input: {result.input}
                        </div>
                        {result.error ? (
                          <div className="text-red-600 dark:text-red-400">
                            Error: {result.error}
                          </div>
                        ) : (
                          <div className="text-gray-900 dark:text-gray-100">
                            Output: {result.output}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!result.error && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigator.clipboard.writeText(result.output)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}