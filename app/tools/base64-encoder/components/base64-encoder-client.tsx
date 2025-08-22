"use client"

import { useState, useEffect, useCallback } from "react"
import { RotateCcw, Copy, Upload, Download, HelpCircle, ArrowLeftRight, FileText, Crown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

import {
  encodeTextToBase64,
  decodeBase64ToText,
  encodeFileToBase64,
  detectInputType,
  formatFileSize,
  calculateCompressionRatio,
  isImageFile,
  getImageDimensions,
  getCharacterSets,
  getNewlineSeparators,
  EncodingOptions,
  ConversionResult
} from "../lib/base64-utils"
import { config } from "../tool.config"
import { HelpPanel } from "./help-panel"
import { BatchProcessor } from "./batch-processor"
import { ConversionHistory } from "./conversion-history"

interface Base64EncoderClientProps {
  isPremiumUser: boolean
  userId: string | null
}

type ConversionMode = 'encode' | 'decode'
type InputType = 'text' | 'file'

export function Base64EncoderClient({ isPremiumUser, userId }: Base64EncoderClientProps) {
  const showSuccess = (title: string, description?: string) => toast.success(title, { description })
  const showError = (title: string, description?: string) => toast.error(title, { description })
  
  // Core state
  const [activeTab, setActiveTab] = useState("single")
  const [mode, setMode] = useState<ConversionMode>('encode')
  const [inputType, setInputType] = useState<InputType>('text')
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [conversionStats, setConversionStats] = useState<{
    originalSize: number
    encodedSize: number
  } | null>(null)
  
  // Image-specific state
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null)
  const [fileMimeType, setFileMimeType] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState<{ width: number, height: number } | null>(null)
  const [showDataUrl, setShowDataUrl] = useState(true) // Toggle between data URL and raw base64
  
  // History state (always available for premium users)
  const [history, setHistory] = useState<any[]>([])
  const STORAGE_KEY = 'base64-conversion-history'
  const MAX_HISTORY_ITEMS = 100
  
  // Encoding options (premium)
  const [encodingOptions, setEncodingOptions] = useState<EncodingOptions>({
    urlSafe: false,
    noPadding: false,
    lineLength: 76,
    characterSet: 'utf-8',
    newlineSeparator: 'lf'
  })
  
  // UI state
  const [showHelp, setShowHelp] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  // Load history from localStorage on mount
  useEffect(() => {
    if (!isPremiumUser) return
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const historyWithDates = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }))
        setHistory(historyWithDates)
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  }, [isPremiumUser])

  // Save history to localStorage
  const saveHistory = useCallback((newHistory: any[]) => {
    if (!isPremiumUser) return
    
    try {
      // Keep only the latest MAX_HISTORY_ITEMS
      const trimmed = newHistory.slice(0, MAX_HISTORY_ITEMS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
      setHistory(trimmed)
    } catch (error) {
      console.error('Failed to save history:', error)
    }
  }, [isPremiumUser])

  // Auto-detect input type and convert
  useEffect(() => {
    if (!inputText.trim()) {
      setOutputText("")
      setConversionStats(null)
      setErrors([])
      return
    }

    // Don't auto-convert if we have a file uploaded (inputText starts with [File:])
    if (uploadedFile && inputText.startsWith('[File:')) {
      return
    }

    const timeoutId = setTimeout(() => {
      handleConversion()
    }, 300) // Debounced conversion

    return () => clearTimeout(timeoutId)
  }, [inputText, mode, encodingOptions, uploadedFile])

  // Re-encode file when encoding options change
  useEffect(() => {
    if (uploadedFile && (fileDataUrl || !showDataUrl)) {
      // Re-encode the file with new options
      encodeFileToBase64(uploadedFile, encodingOptions, showDataUrl).then(result => {
        if (result.success) {
          if (showDataUrl && result.dataUrl) {
            setFileDataUrl(result.dataUrl)
            setOutputText(result.dataUrl)
          } else if (!showDataUrl && result.result) {
            setOutputText(result.result)
          }
          
          if (result.originalSize && result.encodedSize) {
            setConversionStats({
              originalSize: result.originalSize,
              encodedSize: result.encodedSize
            })
          }
        }
      })
    }
  }, [encodingOptions, uploadedFile, showDataUrl, fileDataUrl])

  // Handle text conversion
  const handleConversion = useCallback(() => {
    if (!inputText.trim()) return

    setIsProcessing(true)
    setErrors([])

    try {
      let result: ConversionResult

      if (mode === 'encode') {
        result = encodeTextToBase64(inputText, encodingOptions)
      } else {
        result = decodeBase64ToText(inputText, encodingOptions)
      }

      if (result.success && result.result) {
        setOutputText(result.result)
        if (result.originalSize && result.encodedSize) {
          setConversionStats({
            originalSize: result.originalSize,
            encodedSize: result.encodedSize
          })
        }
        
        // Add to history
        addToHistory(result.result)
      } else {
        setErrors([result.error || 'Conversion failed'])
        setOutputText("")
        setConversionStats(null)
      }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Conversion failed'])
      setOutputText("")
      setConversionStats(null)
    } finally {
      setIsProcessing(false)
    }
  }, [inputText, mode, encodingOptions])

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true)
    setErrors([])

    // Validate file size
    const maxSize = isPremiumUser ? config.maxFileSize.premium : config.maxFileSize.free
    if (file.size > maxSize) {
      const maxSizeFormatted = formatFileSize(maxSize)
      setErrors([`File size exceeds limit (${maxSizeFormatted} for ${isPremiumUser ? 'premium' : 'free'} users)`])
      setIsProcessing(false)
      return
    }

    try {
      // Get image dimensions if it's an image file
      let dimensions = null
      if (isImageFile(file)) {
        try {
          dimensions = await getImageDimensions(file)
          setImageDimensions(dimensions)
        } catch (error) {
          console.warn('Could not get image dimensions:', error)
        }
      } else {
        setImageDimensions(null)
      }

      const result = await encodeFileToBase64(file, encodingOptions, true) // Include data URL
      
      if (result.success && result.result) {
        setUploadedFile(file)
        setFileDataUrl(result.dataUrl || null)
        setFileMimeType(result.mimeType || null)
        
        // Show appropriate output based on toggle
        const displayOutput = showDataUrl && result.dataUrl ? result.dataUrl : result.result
        setOutputText(displayOutput)
        setInputText(`[File: ${file.name}${dimensions ? ` - ${dimensions.width}×${dimensions.height}px` : ''}]`)
        
        if (result.originalSize && result.encodedSize) {
          setConversionStats({
            originalSize: result.originalSize,
            encodedSize: result.encodedSize
          })
        }
        
        // Add to history
        addToHistory(displayOutput, result.dataUrl)
        
        showSuccess('File Encoded', `${file.name} encoded successfully`)
      } else {
        setErrors([result.error || 'File encoding failed'])
      }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'File encoding failed'])
    } finally {
      setIsProcessing(false)
    }
  }, [encodingOptions, isPremiumUser, showDataUrl, toast])

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setInputType('file')
      handleFileUpload(files[0])
    }
  }, [handleFileUpload])

  // Copy to clipboard
  const copyToClipboard = async (text: string, description: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showSuccess('Copied!', `${description} copied to clipboard`)
    } catch (error) {
      showError('Copy failed', 'Unable to copy to clipboard')
    }
  }

  // Download result
  const downloadResult = useCallback(() => {
    if (!outputText) return

    try {
      const blob = new Blob([outputText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `base64-${mode}-result.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showSuccess('Downloaded!', 'Result downloaded successfully')
    } catch (error) {
      showError('Download failed', 'Unable to download result')
    }
  }, [outputText, mode, toast])

  // Add to history helper
  const addToHistory = useCallback((result: string, dataUrl?: string) => {
    if (!isPremiumUser) return
    
    try {
      const newEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        type: inputType,
        mode: mode,
        inputName: uploadedFile ? uploadedFile.name : `Text ${mode === 'encode' ? 'Encoding' : 'Decoding'}`,
        inputSize: conversionStats?.originalSize,
        outputSize: conversionStats?.encodedSize,
        result: result,
        dataUrl: dataUrl,
        mimeType: fileMimeType,
        encodingOptions: encodingOptions
      }
      
      const newHistory = [newEntry, ...history]
      saveHistory(newHistory)
      
      toast.success("Added to History", {
        description: "Conversion saved to history"
      })
    } catch (error) {
      console.warn('Failed to add to history:', error)
    }
  }, [isPremiumUser, inputType, mode, uploadedFile, conversionStats, fileMimeType, encodingOptions, history, saveHistory, toast])

  // Clear all
  const clearAll = useCallback(() => {
    setInputText("")
    setOutputText("")
    setUploadedFile(null)
    setFileDataUrl(null)
    setFileMimeType(null)
    setImageDimensions(null)
    setErrors([])
    setConversionStats(null)
    setInputType('text')
  }, [])

  // Load sample data
  const loadSample = useCallback(() => {
    if (mode === 'encode') {
      setInputText("Hello, World! This is a sample text for Base64 encoding. 🌟")
      setInputType('text')
    } else {
      setInputText("SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgc2FtcGxlIHRleHQgZm9yIEJhc2U2NCBlbmNvZGluZy4g8J+MnQ==")
      setInputType('text')
    }
    setUploadedFile(null)
  }, [mode])

  // Switch mode
  const switchMode = useCallback(() => {
    setMode(prev => prev === 'encode' ? 'decode' : 'encode')
    // Swap input and output if both have content
    if (inputText && outputText) {
      const temp = inputText
      setInputText(outputText)
      setOutputText(temp)
    }
    setUploadedFile(null)
    setFileDataUrl(null)
    setFileMimeType(null)
    setImageDimensions(null)
    setInputType('text')
  }, [inputText, outputText])

  // Handle reuse from history
  const handleHistoryReuse = useCallback((entry: any) => {
    setMode(entry.mode)
    setInputType(entry.type)
    
    if (entry.type === 'file') {
      // For files, we can't restore the original file, but we can show the result
      setInputText(`[Restored: ${entry.inputName}]`)
      setOutputText(entry.result)
      setFileDataUrl(entry.dataUrl || null)
      setFileMimeType(entry.mimeType || null)
    } else {
      // For text, we can restore the input if it was encoding
      if (entry.mode === 'encode') {
        // We don't store the original input for privacy, so we can only show result
        setInputText("")
        setOutputText(entry.result)
      } else {
        // For decode, the result would be the decoded text
        setInputText("")
        setOutputText(entry.result)
      }
    }
    
    if (entry.inputSize && entry.outputSize) {
      setConversionStats({
        originalSize: entry.inputSize,
        encodedSize: entry.outputSize
      })
    }
    
    // Switch to Single tab
    setActiveTab('single')
    
      showSuccess('Conversion Restored', 'Previous conversion has been loaded')
  }, [toast])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Help panel
      if (event.key === 'F1') {
        event.preventDefault()
        setShowHelp(prev => !prev)
        return
      }

      // Mode switching
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'e':
            event.preventDefault()
            setMode('encode')
            break
          case 'd':
            event.preventDefault()
            setMode('decode')
            break
          case 'r':
            event.preventDefault()
            clearAll()
            break
          case 'c':
            if (!event.shiftKey && outputText) {
              event.preventDefault()
              copyToClipboard(outputText, 'Result')
            }
            break
          case 's':
            event.preventDefault()
            if (outputText) downloadResult()
            break
          case 'b':
            if (event.shiftKey && isPremiumUser) {
              event.preventDefault()
              setActiveTab('batch')
            }
            break
          case 'h':
            if (event.shiftKey && isPremiumUser) {
              event.preventDefault()
              setActiveTab('history')
            }
            break
          case 'v':
            if (!event.shiftKey) {
              event.preventDefault()
              navigator.clipboard.readText().then(text => {
                if (text) {
                  setInputText(text)
                  setInputType('text')
                }
              }).catch(() => {
                // Clipboard access denied - ignore
              })
            }
            break
        }
      }

      // Escape to clear focused input
      if (event.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement
        if (activeElement?.tagName === 'TEXTAREA' || activeElement?.tagName === 'INPUT') {
          activeElement.blur()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [outputText, clearAll, copyToClipboard, downloadResult, isPremiumUser])

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2">
          <Button onClick={loadSample} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Load Sample
          </Button>
          <Button onClick={clearAll} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          <Button onClick={switchMode} variant="outline" size="sm">
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Switch Mode
          </Button>
        </div>
        <div className="flex gap-2 ml-auto">
          <Button 
            onClick={() => setShowHelp(!showHelp)} 
            variant="ghost" 
            size="sm"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single">Single</TabsTrigger>
          <TabsTrigger value="batch" disabled={!isPremiumUser}>
            Batch {!isPremiumUser && <Crown className="w-3 h-3 ml-1" />}
          </TabsTrigger>
          <TabsTrigger value="history" disabled={!isPremiumUser}>
            History {!isPremiumUser && <Crown className="w-3 h-3 ml-1" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Base64 {mode === 'encode' ? 'Encoder' : 'Decoder'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={mode === 'encode' ? 'default' : 'secondary'}>
                    {mode === 'encode' ? 'Encode' : 'Decode'}
                  </Badge>
                  <Button 
                    onClick={switchMode} 
                    variant="outline" 
                    size="sm"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Input Section */}
              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Input Type:</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={inputType === 'text' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInputType('text')}
                    >
                      Text
                    </Button>
                    <Button
                      variant={inputType === 'file' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInputType('file')}
                      disabled={mode === 'decode'}
                    >
                      File
                    </Button>
                  </div>
                </div>

                {inputType === 'text' ? (
                  <div className="space-y-2">
                    <Label htmlFor="input-text" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      {mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
                    </Label>
                    <Textarea
                      id="input-text"
                      placeholder={mode === 'encode' 
                        ? "Enter text to encode to Base64..." 
                        : "Enter Base64 string to decode..."
                      }
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">File Upload</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragOver 
                          ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {uploadedFile ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center">
                            <Upload className="h-8 w-8 text-green-500" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{uploadedFile.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(uploadedFile.size)}
                              {fileMimeType && ` • ${fileMimeType}`}
                              {imageDimensions && ` • ${imageDimensions.width}×${imageDimensions.height}px`}
                            </p>
                          </div>
                          
                          {/* Image Preview */}
                          {isImageFile(uploadedFile) && fileDataUrl && (
                            <div className="flex flex-col items-center space-y-2">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview:</p>
                              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800">
                                <img 
                                  src={fileDataUrl} 
                                  alt={uploadedFile.name}
                                  className="max-w-48 max-h-32 object-contain rounded"
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Output Format Toggle for Files */}
                          {(fileDataUrl || uploadedFile) && (
                            <div className="flex items-center justify-center gap-2">
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Output Format:</Label>
                              <div className="flex gap-1">
                                <Button
                                  variant={showDataUrl ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={async () => {
                                    setShowDataUrl(true)
                                    if (fileDataUrl) {
                                      setOutputText(fileDataUrl)
                                    } else if (uploadedFile) {
                                      // Re-encode with data URL if not available
                                      const result = await encodeFileToBase64(uploadedFile, encodingOptions, true)
                                      if (result.success && result.dataUrl) {
                                        setFileDataUrl(result.dataUrl)
                                        setOutputText(result.dataUrl)
                                      }
                                    }
                                  }}
                                >
                                  Data URL
                                </Button>
                                <Button
                                  variant={!showDataUrl ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={async () => {
                                    setShowDataUrl(false)
                                    // Re-encode with current options to get raw base64
                                    if (uploadedFile) {
                                      const result = await encodeFileToBase64(uploadedFile, encodingOptions, false)
                                      if (result.success && result.result) {
                                        setOutputText(result.result)
                                      }
                                    }
                                  }}
                                >
                                  Raw Base64
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center">
                            <Upload className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-lg font-medium">
                              Drop files here or click to upload
                            </p>
                            <p className="text-sm text-gray-500">
                              Max size: {formatFileSize(isPremiumUser ? config.maxFileSize.premium : config.maxFileSize.free)}
                            </p>
                          </div>
                          <Button
                            onClick={() => {
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0]
                                if (file) handleFileUpload(file)
                              }
                              input.click()
                            }}
                          >
                            Select File
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Encoding Options (Premium) */}
              {isPremiumUser && (
                <Card className="p-4">
                   <div className="flex items-center gap-2 mb-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Encoding Options</Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Character Set */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Character Set</Label>
                      <Select
                        value={encodingOptions.characterSet || 'utf-8'}
                        onValueChange={(value) => 
                          setEncodingOptions(prev => ({ ...prev, characterSet: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Popular encodings */}
                          <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b">Popular</div>
                          {getCharacterSets()
                            .filter(cs => cs.category === 'Popular')
                            .map(cs => (
                              <SelectItem key={cs.value} value={cs.value}>
                                {cs.label}
                              </SelectItem>
                            ))
                          }
                          {/* Other encodings */}
                          <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b">Others</div>
                          {getCharacterSets()
                            .filter(cs => cs.category === 'Others')
                            .map(cs => (
                              <SelectItem key={cs.value} value={cs.value}>
                                {cs.label}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Newline Separator */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Newline Separator</Label>
                      <Select
                        value={encodingOptions.newlineSeparator || 'lf'}
                        onValueChange={(value) => 
                          setEncodingOptions(prev => ({ ...prev, newlineSeparator: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getNewlineSeparators().map(sep => (
                            <SelectItem key={sep.value} value={sep.value}>
                              {sep.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* URL Safe */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">URL Safe</Label>
                      <Select
                        value={encodingOptions.urlSafe ? 'true' : 'false'}
                        onValueChange={(value) => 
                          setEncodingOptions(prev => ({ ...prev, urlSafe: value === 'true' }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">Standard (+/)</SelectItem>
                          <SelectItem value="true">URL Safe (-_)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Padding */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Padding</Label>
                      <Select
                        value={encodingOptions.noPadding ? 'false' : 'true'}
                        onValueChange={(value) => 
                          setEncodingOptions(prev => ({ ...prev, noPadding: value === 'false' }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">With Padding (=)</SelectItem>
                          <SelectItem value="false">No Padding</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Line Length */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Line Length</Label>
                      <Select
                        value={encodingOptions.lineLength?.toString() || '0'}
                        onValueChange={(value) => 
                          setEncodingOptions(prev => ({ ...prev, lineLength: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No Line Breaks</SelectItem>
                          <SelectItem value="64">64 Characters</SelectItem>
                          <SelectItem value="76">76 Characters</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              )}

              {/* Error Display */}
              {errors.length > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  {errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  ))}
                </div>
              )}

              {/* Output Section */}
              {outputText && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="output-text" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {mode === 'encode' 
                        ? (showDataUrl && fileDataUrl ? 'Data URL (Ready for Image Components)' : 'Base64 Result')
                        : 'Decoded Text'
                      }
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(outputText, 'Result')}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={downloadResult}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  {/* Usage hint for data URLs */}
                  {showDataUrl && fileDataUrl && isImageFile(uploadedFile!) && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        💡 <strong>Ready to use:</strong> This data URL can be directly used in HTML img tags or React Image components:
                      </p>
                      <code className="text-xs text-blue-700 dark:text-blue-300 mt-1 block">
                        &lt;img src=&quot;{outputText.slice(0, 50)}...&quot; alt=&quot;image&quot; /&gt;
                      </code>
                    </div>
                  )}
                  
                  <Textarea
                    id="output-text"
                    value={outputText}
                    readOnly
                    rows={8}
                    className="font-mono text-sm bg-gray-50 dark:bg-gray-900"
                  />
                  
                  {/* Conversion Stats */}
                  {conversionStats && (
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>Original: {formatFileSize(conversionStats.originalSize)}</span>
                      <span>Result: {formatFileSize(conversionStats.encodedSize)}</span>
                      <span>Change: {calculateCompressionRatio(conversionStats.originalSize, conversionStats.encodedSize)}</span>
                      {fileMimeType && <span>Type: {fileMimeType}</span>}
                      {imageDimensions && <span>Size: {imageDimensions.width}×{imageDimensions.height}px</span>}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <BatchProcessor 
            isPremiumUser={isPremiumUser}
            encodingOptions={encodingOptions}
            maxFileSize={isPremiumUser ? config.maxFileSize.premium : config.maxFileSize.free}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <ConversionHistory 
            isPremiumUser={isPremiumUser}
            onReuse={handleHistoryReuse}
            history={history}
            setHistory={setHistory}
            saveHistory={saveHistory}
          />
        </TabsContent>
      </Tabs>

      {/* Help Panel */}
      <HelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  )
}