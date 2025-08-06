"use client"

import { useState, useEffect, useCallback } from "react"
import { History, Search, Copy, Download, Trash2, FileText, Image, Crown, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"

import { formatFileSize, isImageFile } from "../lib/base64-utils"

interface HistoryEntry {
  id: string
  timestamp: Date
  type: 'text' | 'file'
  mode: 'encode' | 'decode'
  inputName: string
  inputSize?: number
  outputSize?: number
  result: string
  dataUrl?: string
  mimeType?: string
  encodingOptions?: {
    urlSafe?: boolean
    noPadding?: boolean
    lineLength?: number
  }
}

interface ConversionHistoryProps {
  isPremiumUser: boolean
  onReuse?: (entry: HistoryEntry) => void
  history: HistoryEntry[]
  setHistory: (history: HistoryEntry[]) => void
  saveHistory: (history: HistoryEntry[]) => void
}

const STORAGE_KEY = 'base64-conversion-history'
const MAX_HISTORY_ITEMS = 100

export function ConversionHistory({ 
  isPremiumUser, 
  onReuse, 
  history, 
  setHistory, 
  saveHistory 
}: ConversionHistoryProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<'all' | 'text' | 'file'>('all')
  const [filterMode, setFilterMode] = useState<'all' | 'encode' | 'decode'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest')

  // Clear all history
  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
    toast({
      type: "success",
      title: "History Cleared",
      description: "All conversion history has been removed"
    })
  }, [setHistory, toast])

  // Remove single entry
  const removeEntry = useCallback((id: string) => {
    const newHistory = history.filter(entry => entry.id !== id)
    saveHistory(newHistory)
    toast({
      type: "success",
      title: "Entry Removed",
      description: "History entry has been deleted"
    })
  }, [history, saveHistory, toast])

  // Copy result to clipboard
  const copyResult = useCallback(async (entry: HistoryEntry) => {
    try {
      await navigator.clipboard.writeText(entry.result)
      toast({
        type: "success",
        title: "Copied!",
        description: "Result copied to clipboard"
      })
    } catch (error) {
      toast({
        type: "error",
        title: "Copy Failed",
        description: "Unable to copy to clipboard"
      })
    }
  }, [toast])

  // Download result
  const downloadResult = useCallback((entry: HistoryEntry) => {
    try {
      const blob = new Blob([entry.result], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${entry.inputName}-${entry.mode}-result.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        type: "success",
        title: "Downloaded!",
        description: "Result downloaded successfully"
      })
    } catch (error) {
      toast({
        type: "error",
        title: "Download Failed",
        description: "Unable to download result"
      })
    }
  }, [toast])

  // Filter and sort history
  const filteredHistory = history
    .filter(entry => {
      // Search filter
      if (searchTerm && !entry.inputName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Type filter
      if (filterType !== 'all' && entry.type !== filterType) {
        return false
      }
      
      // Mode filter
      if (filterMode !== 'all' && entry.mode !== filterMode) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp.getTime() - a.timestamp.getTime()
        case 'oldest':
          return a.timestamp.getTime() - b.timestamp.getTime()
        case 'name':
          return a.inputName.localeCompare(b.inputName)
        case 'size':
          return (b.outputSize || 0) - (a.outputSize || 0)
        default:
          return 0
      }
    })

  // No longer needed - history is managed by parent component

  if (!isPremiumUser) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-8">
          <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Conversion History
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Save and manage your conversion history with premium
          </p>
          <Button variant="outline">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Conversion History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Mode</Label>
              <Select value={filterMode} onValueChange={(value: any) => setFilterMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="encode">Encode</SelectItem>
                  <SelectItem value="decode">Decode</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="size">Size (Large to Small)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredHistory.length} of {history.length} entries
            </span>
            {history.length > 0 && (
              <Button onClick={clearHistory} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {history.length === 0 ? 'No History Yet' : 'No Results Found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {history.length === 0 
                ? 'Your conversion history will appear here as you use the tool'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {entry.type === 'file' ? (
                        isImageFile(entry.mimeType || '') ? (
                          <Image className="h-5 w-5 text-blue-500" />
                        ) : (
                          <FileText className="h-5 w-5 text-green-500" />
                        )
                      ) : (
                        <FileText className="h-5 w-5 text-purple-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{entry.inputName}</h4>
                        <Badge variant={entry.mode === 'encode' ? 'default' : 'secondary'}>
                          {entry.mode}
                        </Badge>
                        <Badge variant="outline">{entry.type}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>{entry.timestamp.toLocaleDateString()} {entry.timestamp.toLocaleTimeString()}</span>
                        {entry.inputSize && entry.outputSize && (
                          <span>{formatFileSize(entry.inputSize)} → {formatFileSize(entry.outputSize)}</span>
                        )}
                        {entry.mimeType && (
                          <span>{entry.mimeType}</span>
                        )}
                      </div>
                      
                      {/* Encoding options */}
                      {entry.encodingOptions && (
                        <div className="flex gap-2 mb-2">
                          {entry.encodingOptions.urlSafe && <Badge variant="outline" className="text-xs">URL Safe</Badge>}
                          {entry.encodingOptions.noPadding && <Badge variant="outline" className="text-xs">No Padding</Badge>}
                          {entry.encodingOptions.lineLength && entry.encodingOptions.lineLength > 0 && (
                            <Badge variant="outline" className="text-xs">Line: {entry.encodingOptions.lineLength}</Badge>
                          )}
                        </div>
                      )}
                      
                      {/* Result preview */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 mb-2">
                        <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                          {entry.result.slice(0, 100)}{entry.result.length > 100 && '...'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {onReuse && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onReuse(entry)}
                        title="Reuse this conversion"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyResult(entry)}
                      title="Copy result"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadResult(entry)}
                      title="Download result"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeEntry(entry.id)}
                      title="Remove from history"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}