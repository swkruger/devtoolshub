"use client"

import { useState, useCallback } from "react"
import { Upload, Download, FileText, X, CheckCircle, AlertCircle, Crown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

import {
  encodeTextToBase64,
  encodeFileToBase64,
  formatFileSize,
  isImageFile,
  EncodingOptions
} from "../lib/base64-utils"

interface BatchItem {
  id: string
  type: 'text' | 'file'
  name: string
  input: string | File
  status: 'pending' | 'processing' | 'success' | 'error'
  result?: string
  dataUrl?: string
  error?: string
  originalSize?: number
  encodedSize?: number
}

interface BatchProcessorProps {
  isPremiumUser: boolean
  encodingOptions: EncodingOptions
  maxFileSize: number
}

export function BatchProcessor({ isPremiumUser, encodingOptions, maxFileSize }: BatchProcessorProps) {

  const [batchItems, setBatchItems] = useState<BatchItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [textInput, setTextInput] = useState("")
  const [includeDataUrl, setIncludeDataUrl] = useState(true)

  // Add text entries from textarea
  const addTextEntries = useCallback(() => {
    if (!textInput.trim()) return

    const lines = textInput.split('\n').filter(line => line.trim())
    const newItems: BatchItem[] = lines.map((line, index) => ({
      id: `text-${Date.now()}-${index}`,
      type: 'text',
      name: `Text ${batchItems.length + index + 1}`,
      input: line.trim(),
      status: 'pending'
    }))

    setBatchItems(prev => [...prev, ...newItems])
    setTextInput("")

    toast.success("Text Entries Added", {
      description: `Added ${newItems.length} text entries for processing`
    })
  }, [textInput, batchItems.length, toast])

  // Add files
  const addFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const newItems: BatchItem[] = []

    fileArray.forEach((file, index) => {
      // Check file size
      if (file.size > maxFileSize) {
        toast.error("File Too Large", {
          description: `${file.name} exceeds size limit (${formatFileSize(maxFileSize)})`
        })
        return
      }

      newItems.push({
        id: `file-${Date.now()}-${index}`,
        type: 'file',
        name: file.name,
        input: file,
        status: 'pending'
      })
    })

    if (newItems.length > 0) {
      setBatchItems(prev => [...prev, ...newItems])
             toast.success("Files Added", {
         description: `Added ${newItems.length} files for processing`
       })
    }
  }, [maxFileSize, toast])

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      addFiles(files)
    }
  }, [addFiles])

  // Remove item
  const removeItem = useCallback((id: string) => {
    setBatchItems(prev => prev.filter(item => item.id !== id))
  }, [])

  // Clear all items
  const clearAll = useCallback(() => {
    setBatchItems([])
    setProgress(0)
  }, [])

  // Process all items
  const processAll = useCallback(async () => {
    if (batchItems.length === 0) return

    setIsProcessing(true)
    setProgress(0)

    const updatedItems = [...batchItems]
    let completedCount = 0

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i]
      
      // Update status to processing
      item.status = 'processing'
      setBatchItems([...updatedItems])

      try {
        if (item.type === 'text') {
          const result = encodeTextToBase64(item.input as string, encodingOptions)
          if (result.success) {
            item.result = result.result
            item.originalSize = result.originalSize
            item.encodedSize = result.encodedSize
            item.status = 'success'
          } else {
            item.error = result.error
            item.status = 'error'
          }
        } else {
          const file = item.input as File
          const result = await encodeFileToBase64(file, encodingOptions, includeDataUrl)
          if (result.success) {
            item.result = result.result
            item.dataUrl = result.dataUrl
            item.originalSize = result.originalSize
            item.encodedSize = result.encodedSize
            item.status = 'success'
          } else {
            item.error = result.error
            item.status = 'error'
          }
        }
      } catch (error) {
        item.error = error instanceof Error ? error.message : 'Processing failed'
        item.status = 'error'
      }

      completedCount++
      setProgress((completedCount / updatedItems.length) * 100)
      setBatchItems([...updatedItems])

      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setIsProcessing(false)
    
    const successCount = updatedItems.filter(item => item.status === 'success').length
    const errorCount = updatedItems.filter(item => item.status === 'error').length

         if (successCount > 0) {
       toast.success("Batch Processing Complete", {
         description: `${successCount} successful, ${errorCount} failed`
       })
     } else {
       toast.error("Batch Processing Complete", {
         description: `${successCount} successful, ${errorCount} failed`
       })
     }
  }, [batchItems, encodingOptions, includeDataUrl, toast])

  // Export results
  const exportResults = useCallback((format: 'csv' | 'json') => {
    const successfulItems = batchItems.filter(item => item.status === 'success')
    
    if (successfulItems.length === 0) {
             toast.error("No Results", {
         description: "No successful conversions to export"
       })
      return
    }

    let content: string
    let filename: string
    let mimeType: string

    if (format === 'csv') {
      const headers = ['Name', 'Type', 'Original Size', 'Encoded Size', 'Result']
      const rows = successfulItems.map(item => [
        item.name,
        item.type,
        item.originalSize?.toString() || '',
        item.encodedSize?.toString() || '',
        item.result || ''
      ])
      
      content = [headers, ...rows].map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n')
      
      filename = 'base64-batch-results.csv'
      mimeType = 'text/csv'
    } else {
      const exportData = successfulItems.map(item => ({
        name: item.name,
        type: item.type,
        originalSize: item.originalSize,
        encodedSize: item.encodedSize,
        result: item.result,
        dataUrl: item.dataUrl,
        timestamp: new Date().toISOString()
      }))
      
      content = JSON.stringify(exportData, null, 2)
      filename = 'base64-batch-results.json'
      mimeType = 'application/json'
    }

    // Download file
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

         toast.success("Export Complete", {
       description: `Results exported as ${format.toUpperCase()}`
     })
  }, [batchItems, toast])

  if (!isPremiumUser) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-8">
          <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Batch Processing
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Process multiple files or text entries at once with premium
          </p>
                      <Button variant="outline" asChild>
              <Link href="/go-premium">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Link>
            </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Text Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Text Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batch-text">Enter text (one per line)</Label>
              <Textarea
                id="batch-text"
                placeholder="Line 1 text to encode&#10;Line 2 text to encode&#10;Line 3 text to encode"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
            </div>
            <Button onClick={addTextEntries} disabled={!textInput.trim()}>
              Add Text Entries
            </Button>
          </CardContent>
        </Card>

        {/* File Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              File Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Drop files here or click to select
              </p>
              <p className="text-xs text-gray-500">
                Max size: {formatFileSize(maxFileSize)}
              </p>
              <Button
                className="mt-2"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.multiple = true
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files
                    if (files) addFiles(files)
                  }
                  input.click()
                }}
              >
                Select Files
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeDataUrl}
                onChange={(e) => setIncludeDataUrl(e.target.checked)}
              />
              Include Data URLs for files
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Batch Items */}
      {batchItems.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Batch Queue ({batchItems.length} items)
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={processAll}
                disabled={isProcessing}
                variant="default"
              >
                {isProcessing ? "Processing..." : "Process All"}
              </Button>
              <Button onClick={clearAll} variant="outline" size="sm">
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {/* Items List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {batchItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      {item.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {item.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                      {item.status === 'processing' && (
                        <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      )}
                      {item.status === 'pending' && <div className="h-4 w-4 bg-gray-300 rounded-full" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        <Badge variant="outline">{item.type}</Badge>
                        {item.type === 'file' && isImageFile(item.input as File) && (
                          <Badge variant="secondary">Image</Badge>
                        )}
                      </div>
                      {item.error && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {item.error}
                        </p>
                      )}
                      {item.status === 'success' && item.originalSize && item.encodedSize && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formatFileSize(item.originalSize)} → {formatFileSize(item.encodedSize)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Export Options */}
            {batchItems.some(item => item.status === 'success') && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => exportResults('csv')}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  onClick={() => exportResults('json')}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}