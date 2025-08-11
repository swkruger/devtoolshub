"use client"

import { useState, useEffect, useCallback } from "react"
import { formatInTimeZone } from "date-fns-tz"
import { Plus, X, Crown, Copy, Globe, Calendar, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { EnhancedTooltip } from "./enhanced-tooltip"
import { TimezoneSlot } from "@/lib/types/user-timezones"

interface TimezoneComparisonProps {
  isPremiumUser: boolean
  userId: string | null
  timestamp: number
  isAutoUpdate: boolean
}

const POPULAR_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', region: 'Global' },
  { value: 'America/New_York', label: 'New York (EST/EDT)', region: 'Americas' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)', region: 'Americas' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)', region: 'Americas' },
  { value: 'America/Denver', label: 'Denver (MST/MDT)', region: 'Americas' },
  { value: 'America/Toronto', label: 'Toronto (EST/EDT)', region: 'Americas' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT/BRST)', region: 'Americas' },
  { value: 'Europe/London', label: 'London (GMT/BST)', region: 'Europe' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)', region: 'Europe' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', region: 'Europe' },
  { value: 'Europe/Rome', label: 'Rome (CET/CEST)', region: 'Europe' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', region: 'Europe' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', region: 'Asia' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', region: 'Asia' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', region: 'Asia' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', region: 'Asia' },
  { value: 'Asia/Kolkata', label: 'Mumbai (IST)', region: 'Asia' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', region: 'Asia' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)', region: 'Oceania' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)', region: 'Oceania' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)', region: 'Oceania' }
]

const DEFAULT_TIMEZONES = [
  { id: '1', timezone: 'UTC', label: 'UTC' },
  { id: '2', timezone: 'America/New_York', label: 'New York' },
  { id: '3', timezone: 'Europe/London', label: 'London' },
  { id: '4', timezone: 'Asia/Tokyo', label: 'Tokyo' }
]

export function TimezoneComparison({ isPremiumUser, userId, timestamp, isAutoUpdate }: TimezoneComparisonProps) {
  const { toast } = useToast()
  const [timezones, setTimezones] = useState<TimezoneSlot[]>(DEFAULT_TIMEZONES)
  const [selectedTimezone, setSelectedTimezone] = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load user's saved timezones from database
  const loadUserTimezones = useCallback(async () => {
    if (!isPremiumUser || !userId) {
      setTimezones(DEFAULT_TIMEZONES)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/user-timezones?userId=${userId}`)
      if (response.ok) {
        const userTimezones = await response.json()
        if (userTimezones.length > 0) {
          const formattedTimezones = userTimezones.map((tz: any) => ({
            id: tz.id,
            timezone: tz.timezone,
            label: tz.label,
            isDefault: tz.is_default
          }))
          setTimezones(formattedTimezones)
        } else {
          // Initialize default timezones for new premium user
          await initializeUserTimezones()
        }
      }
    } catch (error) {
      console.error('Error loading user timezones:', error)
      toast({
        type: "error",
        title: "Failed to Load",
        description: "Could not load your saved timezones"
      })
    } finally {
      setIsLoading(false)
    }
  }, [isPremiumUser, userId, toast])

  // Initialize default timezones for new premium user
  const initializeUserTimezones = async () => {
    if (!isPremiumUser || !userId) return

    try {
      const response = await fetch('/api/user-timezones/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        const defaultTimezones = await response.json()
        const formattedTimezones = defaultTimezones.map((tz: any) => ({
          id: tz.id,
          timezone: tz.timezone,
          label: tz.label,
          isDefault: tz.is_default
        }))
        setTimezones(formattedTimezones)
      }
    } catch (error) {
      console.error('Error initializing user timezones:', error)
    }
  }

  // Load timezones on component mount
  useEffect(() => {
    loadUserTimezones()
  }, [loadUserTimezones])

  // Add timezone slot
  const addTimezone = async () => {
    if (!isPremiumUser) {
      toast({
        type: "warning",
        title: "Premium Required",
        description: "Timezone comparison requires a premium plan"
      })
      return
    }

    if (!selectedTimezone) return

    if (timezones.length >= 8) {
      toast({
        type: "warning",
        title: "Maximum Reached",
        description: "Maximum 8 timezones can be compared at once"
      })
      return
    }

    if (timezones.some(tz => tz.timezone === selectedTimezone)) {
      toast({
        type: "warning",
        title: "Already Added",
        description: "This timezone is already in the comparison"
      })
      return
    }

    const timezoneInfo = POPULAR_TIMEZONES.find(tz => tz.value === selectedTimezone)
    const label = customLabel.trim() || timezoneInfo?.label.split(' ')[0] || selectedTimezone

    // Save to database if user is logged in
    if (userId) {
      setIsSaving(true)
      try {
        const response = await fetch('/api/user-timezones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            timezone: selectedTimezone,
            label
          })
        })

        if (response.ok) {
          const savedTimezone = await response.json()
          const newTimezone: TimezoneSlot = {
            id: savedTimezone.id,
            timezone: savedTimezone.timezone,
            label: savedTimezone.label,
            isDefault: savedTimezone.is_default
          }

          setTimezones(prev => [...prev, newTimezone])
          setSelectedTimezone('')
          setCustomLabel('')
          setShowAddForm(false)

          toast({
            type: "success",
            title: "Timezone Added",
            description: `${label} added to comparison and saved to your account`
          })
        } else {
          throw new Error('Failed to save timezone')
        }
      } catch (error) {
        console.error('Error saving timezone:', error)
        toast({
          type: "error",
          title: "Save Failed",
          description: "Could not save timezone to your account"
        })
      } finally {
        setIsSaving(false)
      }
    } else {
      // Fallback to local state for users not logged in
      const newTimezone: TimezoneSlot = {
        id: Date.now().toString(),
        timezone: selectedTimezone,
        label
      }

      setTimezones(prev => [...prev, newTimezone])
      setSelectedTimezone('')
      setCustomLabel('')
      setShowAddForm(false)

      toast({
        type: "success",
        title: "Timezone Added",
        description: `${label} added to comparison`
      })
    }
  }

  // Remove timezone slot
  const removeTimezone = async (id: string) => {
    if (!isPremiumUser) return
    
    const timezone = timezones.find(tz => tz.id === id)
    if (!timezone) return

    // Check if it's a default timezone
    if (timezone.isDefault) {
      toast({
        type: "warning",
        title: "Cannot Remove",
        description: "Default timezones cannot be removed"
      })
      return
    }

    // Remove from database if user is logged in
    if (userId) {
      try {
        const response = await fetch(`/api/user-timezones/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        })

        if (response.ok) {
          setTimezones(prev => prev.filter(tz => tz.id !== id))
          toast({
            type: "success",
            title: "Timezone Removed",
            description: `${timezone.label} removed from comparison`
          })
        } else {
          throw new Error('Failed to remove timezone')
        }
      } catch (error) {
        console.error('Error removing timezone:', error)
        toast({
          type: "error",
          title: "Remove Failed",
          description: "Could not remove timezone from your account"
        })
      }
    } else {
      // Fallback to local state
      setTimezones(prev => prev.filter(tz => tz.id !== id))
    }
  }

  // Copy timezone result
  const copyTimezoneResult = async (timezone: string, label: string, format: 'formatted' | 'iso' = 'formatted') => {
    try {
      const date = new Date(timestamp)
      let textToCopy: string
      
      if (format === 'iso') {
        textToCopy = formatInTimeZone(date, timezone, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
      } else {
        textToCopy = formatInTimeZone(date, timezone, "yyyy-MM-dd'T'HH:mm:ssXXX")
      }
      
      await navigator.clipboard.writeText(textToCopy)
      
      toast({
        type: "success",
        title: "Copied!",
        description: `${label} ${format === 'iso' ? 'ISO format' : 'time'} copied to clipboard`
      })
    } catch (error) {
      toast({
        type: "error",
        title: "Copy Failed",
        description: "Unable to copy to clipboard"
      })
    }
  }

  // Copy all timezones
  const copyAllTimezones = async () => {
    if (!isPremiumUser) return

    try {
      const date = new Date(timestamp)
      const results = timezones.map(tz => {
        const formatted = formatInTimeZone(date, tz.timezone, "yyyy-MM-dd'T'HH:mm:ssXXX")
        return `${tz.label}: ${formatted}`
      }).join('\n')

      await navigator.clipboard.writeText(results)
      
      toast({
        type: "success",
        title: "Copied!",
        description: "All timezone results copied to clipboard"
      })
    } catch (error) {
      toast({
        type: "error",
        title: "Copy Failed",
        description: "Unable to copy to clipboard"
      })
    }
  }

  // Get timezone display info
  const getTimezoneDisplay = (timezone: string, label: string) => {
    try {
      const date = new Date(timestamp)
      const formatted = formatInTimeZone(date, timezone, "yyyy-MM-dd'T'HH:mm:ssXXX")
      const isoFormatted = formatInTimeZone(date, timezone, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
      const timeOnly = formatInTimeZone(date, timezone, "HH:mm:ss")
      const dateOnly = formatInTimeZone(date, timezone, "MMM dd, yyyy")
      const offset = formatInTimeZone(date, timezone, "XXX")
      
      return {
        full: formatted,
        iso: isoFormatted,
        time: timeOnly,
        date: dateOnly,
        offset,
        valid: true
      }
    } catch (error) {
      return {
        full: 'Invalid timezone',
        iso: 'Invalid timezone',
        time: '--:--:--',
        date: 'Invalid',
        offset: '+00:00',
        valid: false
      }
    }
  }

  if (!isPremiumUser) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="flex items-center justify-center mb-4">
              <Crown className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Timezone comparison is available with a premium plan
            </p>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <p>• Compare timestamp across multiple timezones</p>
              <p>• Historical timezone data with DST handling</p>
              <p>• Custom timezone labels and organization</p>
              <p>• Copy individual or all timezone results</p>
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
      {/* Header with actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Timezone Comparison
            </CardTitle>
            <div className="flex gap-2">
              <EnhancedTooltip content="Copy all timezone results">
                <Button size="sm" variant="outline" onClick={copyAllTimezones}>
                  <Copy className="h-4 w-4" />
                </Button>
              </EnhancedTooltip>
              
              <Button 
                size="sm" 
                onClick={() => setShowAddForm(!showAddForm)}
                disabled={timezones.length >= 8}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Timezone
              </Button>
            </div>
          </div>
          
          {isAutoUpdate && (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Live updating every second
            </div>
          )}
        </CardHeader>

        {/* Add timezone form */}
        {showAddForm && (
          <CardContent className="border-t pt-4">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Label htmlFor="timezone-select">Timezone</Label>
                  <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {['Global', 'Americas', 'Europe', 'Asia', 'Oceania'].map(region => (
                        <div key={region}>
                          <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800">
                            {region}
                          </div>
                          {POPULAR_TIMEZONES
                            .filter(tz => tz.region === region)
                            .map(tz => (
                              <SelectItem key={tz.value} value={tz.value}>
                                {tz.label}
                              </SelectItem>
                            ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="custom-label">Custom Label (Optional)</Label>
                  <Input
                    id="custom-label"
                    placeholder="e.g., Office, Home"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={addTimezone} 
                  disabled={!selectedTimezone || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Add Timezone'}
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Timezone comparison grid */}
      <div className="grid gap-3">
        {timezones.map((tz) => {
          const display = getTimezoneDisplay(tz.timezone, tz.label)
          
          return (
            <Card key={tz.id} className={`${!display.valid ? 'border-red-200 dark:border-red-800' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {tz.label}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {display.offset}
                      </Badge>
                      {tz.timezone !== 'UTC' && timezones.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeTimezone(tz.id)}
                          className="h-5 w-5 p-0 text-gray-400 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-mono text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {display.time}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {display.date}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                        {tz.timezone}
                      </div>
                      
                      {/* Unix timestamp and ISO format section */}
                      <div className="mt-3 space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">Unix</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                              {Math.floor(timestamp / 1000)}
                            </span>
                            <EnhancedTooltip content="Copy Unix timestamp">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0"
                                onClick={() => navigator.clipboard.writeText(Math.floor(timestamp / 1000).toString())}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </EnhancedTooltip>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">ISO</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-mono text-gray-600 dark:text-gray-400 max-w-32 truncate">
                              {display.iso}
                            </span>
                            <EnhancedTooltip content="Copy ISO format">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0"
                                onClick={() => copyTimezoneResult(tz.timezone, tz.label, 'iso')}
                                disabled={!display.valid}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </EnhancedTooltip>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <EnhancedTooltip content={`Copy ${tz.label} formatted time`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyTimezoneResult(tz.timezone, tz.label)}
                        disabled={!display.valid}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </EnhancedTooltip>
                    {tz.isDefault && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {timezones.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Timezones Added
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add timezones to compare how the same timestamp appears in different regions
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Timezone
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}