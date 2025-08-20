"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { format, fromUnixTime, getUnixTime, parseISO, isValid } from "date-fns"
import { formatInTimeZone } from "date-fns-tz"
import { Clock, Copy, RotateCcw, Play, Pause, HelpCircle, Crown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { HelpPanel } from "./help-panel"
import { BatchConverter } from "./batch-converter"
import { TimezoneComparison } from "./timezone-comparison"

interface TimestampConverterClientProps {
  isPremiumUser: boolean
  userId: string | null
}

interface ConversionResult {
  format: string
  value: string
  description: string
}

// Common timezones for the dropdown
const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Kolkata', label: 'Mumbai (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' }
]

// Date format options
const DATE_FORMATS = [
  { value: 'iso', label: 'ISO 8601', example: '2024-01-01T12:00:00Z' },
  { value: 'locale', label: 'Locale String', example: '1/1/2024, 12:00:00 PM' },
  { value: 'custom-1', label: 'YYYY-MM-DD HH:mm:ss', example: '2024-01-01 12:00:00' },
  { value: 'custom-2', label: 'MM/DD/YYYY h:mm A', example: '01/01/2024 12:00 PM' },
  { value: 'custom-3', label: 'DD.MM.YYYY HH:mm', example: '01.01.2024 12:00' }
]

export function TimestampConverterClient({ isPremiumUser, userId }: TimestampConverterClientProps) {

  const showSuccess = (title: string, description?: string) => toast.success(title, { description })
  const showError = (title: string, description?: string) => toast.error(title, { description })
  const [unixInput, setUnixInput] = useState("")
  const [dateInput, setDateInput] = useState("")
  const [selectedTimezone, setSelectedTimezone] = useState("UTC")
  const [selectedFormat, setSelectedFormat] = useState("iso")
  const [currentTimestamp, setCurrentTimestamp] = useState(Date.now())
  const [isAutoUpdate, setIsAutoUpdate] = useState(true)
  const [activeTab, setActiveTab] = useState("single")
  const [conversionResults, setConversionResults] = useState<ConversionResult[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [showHelp, setShowHelp] = useState(false)
  const [lastActiveField, setLastActiveField] = useState<"unix" | "date" | null>(null)
  const prevFormatRef = useRef(selectedFormat)
  const prevTimezoneRef = useRef(selectedTimezone)

  // Auto-update current timestamp every second
  useEffect(() => {
    if (!isAutoUpdate) return

    const interval = setInterval(() => {
      setCurrentTimestamp(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [isAutoUpdate])

  // Convert Unix timestamp to date
  const convertUnixToDate = useCallback((timestamp: string, timezone: string, formatType: string): ConversionResult[] => {
    try {
      const results: ConversionResult[] = []
      
      // Handle both seconds and milliseconds
      let timestampNum = parseInt(timestamp)
      if (timestamp.length === 10) {
        timestampNum = timestampNum * 1000 // Convert seconds to milliseconds
      }
      
      if (isNaN(timestampNum) || timestampNum < 0) {
        throw new Error("Invalid timestamp format")
      }

      const date = new Date(timestampNum)
      
      if (!isValid(date)) {
        throw new Error("Invalid date")
      }

      // Generate different format outputs - show selected format first
      if (formatType === 'iso') {
        results.push({
          format: 'Selected Format (ISO 8601)',
          value: formatInTimeZone(date, timezone, "yyyy-MM-dd'T'HH:mm:ssXXX"),
          description: `ISO 8601 format in ${timezone}`
        })
      } else if (formatType === 'locale') {
        results.push({
          format: 'Selected Format (Locale)',
          value: formatInTimeZone(date, timezone, "PPpp"),
          description: `Localized format in ${timezone}`
        })
      } else if (formatType === 'custom-1') {
        results.push({
          format: 'Selected Format (YYYY-MM-DD HH:mm:ss)',
          value: formatInTimeZone(date, timezone, "yyyy-MM-dd HH:mm:ss"),
          description: `Standard format in ${timezone}`
        })
      } else if (formatType === 'custom-2') {
        results.push({
          format: 'Selected Format (MM/DD/YYYY h:mm A)',
          value: formatInTimeZone(date, timezone, "MM/dd/yyyy h:mm a"),
          description: `US format in ${timezone}`
        })
      } else if (formatType === 'custom-3') {
        results.push({
          format: 'Selected Format (DD.MM.YYYY HH:mm)',
          value: formatInTimeZone(date, timezone, "dd.MM.yyyy HH:mm"),
          description: `European format in ${timezone}`
        })
      }

      // Always add standard formats
      results.push({
        format: 'Unix Timestamp',
        value: Math.floor(timestampNum / 1000).toString(),
        description: 'Seconds since epoch'
      })

      if (timestampNum % 1000 !== 0) {
        results.push({
          format: 'Unix Timestamp (ms)',
          value: timestampNum.toString(),
          description: 'Milliseconds since epoch'
        })
      }

      // Add ISO 8601 UTC for reference (unless it's already the selected format)
      if (formatType !== 'iso') {
        results.push({
          format: 'ISO 8601',
          value: date.toISOString(),
          description: 'ISO format in UTC'
        })
      }

      return results
    } catch (error) {
      throw new Error(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [])

  // Convert date to Unix timestamp
  const convertDateToUnix = useCallback((dateString: string, timezone: string): ConversionResult[] => {
    try {
      const results: ConversionResult[] = []
      let date: Date
      let parseMethod = ""

      // Try parsing as ISO string first
      if (dateString.includes('T') || dateString.includes('Z')) {
        date = parseISO(dateString)
        parseMethod = "ISO 8601"
      } else {
        // Parse as regular date string
        date = new Date(dateString)
        parseMethod = "Natural Language"
      }

      if (!isValid(date)) {
        throw new Error("Invalid date format")
      }

      // Show how the input was interpreted
      results.push({
        format: `Parsed Input (${parseMethod})`,
        value: format(date, 'yyyy-MM-dd HH:mm:ss'),
        description: `Input interpreted as ${parseMethod} format`
      })

      const unixSeconds = getUnixTime(date)
      const unixMillis = date.getTime()

      results.push({
        format: 'Unix Timestamp',
        value: unixSeconds.toString(),
        description: 'Seconds since epoch'
      })

      results.push({
        format: 'Unix Timestamp (ms)',
        value: unixMillis.toString(),
        description: 'Milliseconds since epoch'
      })

      results.push({
        format: 'ISO 8601',
        value: date.toISOString(),
        description: 'ISO format in UTC'
      })

      return results
    } catch (error) {
      throw new Error(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [])

  // Handle Unix input change with debounced conversion
  useEffect(() => {
    if (!unixInput.trim() || lastActiveField !== "unix") {
      if (!unixInput.trim()) {
        setConversionResults([])
        setErrors([])
      }
      return
    }

    const timeoutId = setTimeout(() => {
      try {
        const results = convertUnixToDate(unixInput, selectedTimezone, selectedFormat)
        setConversionResults(results)
        setErrors([])
        
        // Auto-fill date input only if it's empty or we're actively converting from unix
        if (results.length > 0 && lastActiveField === "unix") {
          const primaryResult = results.find(r => r.format === 'ISO 8601')
          if (primaryResult) {
            setDateInput(primaryResult.value)
          }
        }
      } catch (error) {
        setErrors([error instanceof Error ? error.message : 'Conversion failed'])
        setConversionResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [unixInput, selectedTimezone, selectedFormat, convertUnixToDate, lastActiveField])

  // Handle date input change with debounced conversion
  useEffect(() => {
    if (!dateInput.trim() || lastActiveField !== "date") {
      if (!dateInput.trim()) {
        setConversionResults([])
        setErrors([])
      }
      return
    }

    const timeoutId = setTimeout(() => {
      try {
        const results = convertDateToUnix(dateInput, selectedTimezone)
        setConversionResults(results)
        setErrors([])
        
        // Auto-fill unix input only if we're actively converting from date
        if (results.length > 0 && lastActiveField === "date") {
          const unixResult = results.find(r => r.format === 'Unix Timestamp')
          if (unixResult) {
            setUnixInput(unixResult.value)
          }
        }
      } catch (error) {
        setErrors([error instanceof Error ? error.message : 'Conversion failed'])
        setConversionResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [dateInput, selectedTimezone, convertDateToUnix, lastActiveField])

  // Handle format/timezone changes - reprocess existing data immediately
  useEffect(() => {
    const formatChanged = prevFormatRef.current !== selectedFormat
    const timezoneChanged = prevTimezoneRef.current !== selectedTimezone
    
    // Only reprocess if format or timezone actually changed and we have data
    if ((formatChanged || timezoneChanged) && (unixInput.trim() || dateInput.trim())) {
      try {
        if (unixInput.trim() && lastActiveField === "unix") {
          const results = convertUnixToDate(unixInput, selectedTimezone, selectedFormat)
          setConversionResults(results)
          setErrors([])
        } else if (dateInput.trim() && lastActiveField === "date") {
          const results = convertDateToUnix(dateInput, selectedTimezone)
          setConversionResults(results)
          setErrors([])
        }
      } catch (error) {
        setErrors([error instanceof Error ? error.message : 'Conversion failed'])
        setConversionResults([])
      }
    }

    // Update refs
    prevFormatRef.current = selectedFormat
    prevTimezoneRef.current = selectedTimezone
  }, [selectedTimezone, selectedFormat, unixInput, dateInput, lastActiveField, convertUnixToDate, convertDateToUnix])

  // Copy to clipboard
  const copyToClipboard = async (text: string, description: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showSuccess('Copied!', `${description} copied to clipboard`)
    } catch (error) {
      showError('Copy failed', 'Unable to copy to clipboard')
    }
  }

  // Clear all inputs
  const clearAll = () => {
    setUnixInput("")
    setDateInput("")
    setConversionResults([])
    setErrors([])
    setLastActiveField(null)
  }

  // Load sample data
  const loadSample = () => {
    const sampleTimestamp = "1704110400" // 2024-01-01 12:00:00 UTC
    setUnixInput(sampleTimestamp)
    setDateInput("")
    setLastActiveField("unix")
  }

  // Get current timestamp in different formats
  const getCurrentTimestampResults = (): ConversionResult[] => {
    const now = new Date(currentTimestamp)
    return [
      {
        format: 'Unix Timestamp',
        value: Math.floor(currentTimestamp / 1000).toString(),
        description: 'Current time in seconds'
      },
      {
        format: 'Unix Timestamp (ms)',
        value: currentTimestamp.toString(),
        description: 'Current time in milliseconds'
      },
      {
        format: 'ISO 8601',
        value: formatInTimeZone(now, selectedTimezone, "yyyy-MM-dd'T'HH:mm:ssXXX"),
        description: 'Current time in ISO format'
      },
      {
        format: 'Locale String',
        value: formatInTimeZone(now, selectedTimezone, "PPpp"),
        description: 'Current time in locale format'
      }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2">
          <Button onClick={loadSample} variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Load Sample
          </Button>
          <Button onClick={clearAll} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All
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
          <TabsTrigger value="compare" disabled={!isPremiumUser}>
            Current & Compare {!isPremiumUser && <Crown className="w-3 h-3 ml-1" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Timestamp Conversion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Input Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unix-input" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Unix Timestamp</Label>
                  <Input
                    id="unix-input"
                    placeholder="1704110400 or 1704110400000"
                    value={unixInput}
                    onChange={(e) => {
                      setUnixInput(e.target.value)
                      setLastActiveField("unix")
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-input" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Human-Readable Date</Label>
                  <Input
                    id="date-input"
                    placeholder="2024-01-01T12:00:00Z or January 1, 2024"
                    value={dateInput}
                    onChange={(e) => {
                      setDateInput(e.target.value)
                      setLastActiveField("date")
                    }}
                  />
                </div>
              </div>

              {/* Configuration Section */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="timezone" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Timezone</Label>
                  <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="format" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Output Format</Label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {DATE_FORMATS.map((fmt) => (
                        <SelectItem key={fmt.value} value={fmt.value}>
                          {fmt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

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

              {/* Results Section */}
              {conversionResults.length > 0 && (
                <div className="space-y-3">
                  <Separator />
                  <h3 className="font-medium">Conversion Results</h3>
                  <div className="space-y-2">
                    {conversionResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{result.format}</Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {result.description}
                            </span>
                          </div>
                          <p className="font-mono text-sm mt-1">{result.value}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(result.value, result.format)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <BatchConverter 
            isPremiumUser={isPremiumUser}
            selectedTimezone={selectedTimezone}
            selectedFormat={selectedFormat}
          />
        </TabsContent>

        <TabsContent value="compare" className="space-y-4">
          {/* Current Timestamp Section */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Current Timestamp</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAutoUpdate(!isAutoUpdate)}
                >
                  {isAutoUpdate ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getCurrentTimestampResults().map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{result.format}</Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {result.description}
                        </span>
                      </div>
                      <p className="font-mono text-sm mt-1">{result.value}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(result.value, result.format)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timezone Comparison Section */}
          <TimezoneComparison 
            isPremiumUser={isPremiumUser}
            userId={userId}
            timestamp={currentTimestamp}
            isAutoUpdate={isAutoUpdate}
          />
        </TabsContent>
      </Tabs>

      {/* Help Panel */}
      <HelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  )
}