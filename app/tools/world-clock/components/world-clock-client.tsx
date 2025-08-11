'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Globe, 
  Clock, 
  RefreshCw, 
  Download, 
  Users, 
  Calendar, 
  Settings,
  Grid3X3,
  Clock4,
  Crown,
  HelpCircle,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useWorldClock, useWorldClockKeyboard } from '../hooks/use-world-clock'
import { getPopularCities } from '../lib/cities-data'
import TimezoneCard from './timezone-card'
import TimezoneSelector from './timezone-selector'
import HelpPanel from './help-panel'
import MeetingPlanner from './meeting-planner'
import { DatePicker } from './date-picker'

interface WorldClockClientProps {
  isPremiumUser: boolean
  userId: string
}

export default function WorldClockClient({ isPremiumUser, userId }: WorldClockClientProps) {
  const [state, actions] = useWorldClock(isPremiumUser, userId)
  const [showHelp, setShowHelp] = useState(false)
  const [activeTab, setActiveTab] = useState('clock')
  const { toast } = useToast()
  const showSuccess = (title: string, description?: string) => toast({ type: 'success', title, description })
  const showError = (title: string, description?: string) => toast({ type: 'error', title, description })
  const showWarning = (title: string, description?: string) => toast({ type: 'warning', title, description })

  // Initialize with popular cities for demo (only if no saved cities after hook has loaded)
  useEffect(() => {
    // Only initialize if hook has finished loading AND no cities are selected
    if (state.isInitialized && state.selectedCities.length === 0) {
      console.log('Initializing with popular cities...')
      const initializePopularCities = async () => {
        const popularCities = getPopularCities().slice(0, isPremiumUser ? 3 : 2)
        for (const city of popularCities) {
          await actions.addCity(city)
        }
      }
      initializePopularCities()
    }
  }, [state.isInitialized, state.selectedCities.length, isPremiumUser, actions.addCity])

  // Store refreshWeather in a ref to avoid dependency issues
  const refreshWeatherRef = useRef(actions.refreshWeather)
  refreshWeatherRef.current = actions.refreshWeather

  // Auto-refresh weather for premium users (with rate limiting)
  useEffect(() => {
    console.log('Weather effect triggered:', { isPremiumUser, citiesCount: state.selectedCities.length })
    
    if (isPremiumUser && state.selectedCities.length > 0) {
      console.log('Setting up weather auto-refresh...')
      
      // Initial load - only once when cities are first loaded  
      const initialTimeout = setTimeout(() => {
        console.log('Triggering initial weather refresh...')
        refreshWeatherRef.current()
      }, 2000) // Wait 2 seconds to avoid rapid succession
      
      // Refresh every 10 minutes
      const weatherInterval = setInterval(() => {
        console.log('Triggering scheduled weather refresh...')
        refreshWeatherRef.current()
      }, 10 * 60 * 1000)
      
      return () => {
        console.log('Cleaning up weather auto-refresh...')
        clearTimeout(initialTimeout)
        clearInterval(weatherInterval)
      }
    } else {
      console.log('Weather auto-refresh not set up:', { isPremiumUser, citiesCount: state.selectedCities.length })
    }
  }, [isPremiumUser, state.selectedCities.length]) // Only depend on stable values

  // Set up keyboard shortcuts
  useWorldClockKeyboard(actions)

  const handleCityAdd = async (city: any) => {
    const success = await actions.addCity(city)
    if (success) {
      toast({
        type: "success",
        title: "City Added",
        description: `${city.name}, ${city.country} has been added to your world clock.`,
      })
    } else if (state.selectedCities.length >= state.maxCities) {
      if (isPremiumUser) {
        toast({
          type: "error",
          title: "City Limit Reached",
          description: "You've reached the maximum number of cities."
        })
      } else {
        toast({
          type: "warning",
          title: "Free Limit Reached",
          description: `Free users can add up to ${state.maxCities} cities. Upgrade to premium for unlimited cities.`
        })
      }
    } else {
      toast({
        type: "warning",
        title: "City Already Added",
        description: `${city.name} is already in your world clock.`
      })
    }
  }

  const handleLabelUpdate = async (cityId: string, label: string): Promise<boolean> => {
    const success = await actions.updateCityLabel(cityId, label)
    if (success) {
      toast({
        type: "success",
        title: "Label Updated",
        description: "City label has been updated successfully.",
      })
    } else {
      toast({
        type: "error",
        title: "Update Failed",
        description: "Failed to update city label."
      })
    }
    return success
  }

  const handleMoveUp = async (cityId: string): Promise<boolean> => {
    const cityIndex = state.selectedCities.findIndex(city => city.id === cityId)
    if (cityIndex > 0) {
      const newOrders = state.selectedCities.map((city, index) => {
        if (index === cityIndex) return { cityId: city.id, displayOrder: index - 1 }
        if (index === cityIndex - 1) return { cityId: city.id, displayOrder: index + 1 }
        return { cityId: city.id, displayOrder: index }
      })
      
      const success = await actions.reorderCities(newOrders)
      if (success) {
        toast({
          type: "success",
          title: "Cities Reordered",
          description: "City moved up successfully.",
        })
      } else {
        toast({
          type: "error",
          title: "Reorder Failed",
          description: "Failed to reorder cities."
        })
      }
      return success
    }
    return false
  }

  const handleMoveDown = async (cityId: string): Promise<boolean> => {
    const cityIndex = state.selectedCities.findIndex(city => city.id === cityId)
    if (cityIndex < state.selectedCities.length - 1) {
      const newOrders = state.selectedCities.map((city, index) => {
        if (index === cityIndex) return { cityId: city.id, displayOrder: index + 1 }
        if (index === cityIndex + 1) return { cityId: city.id, displayOrder: index - 1 }
        return { cityId: city.id, displayOrder: index }
      })
      
      const success = await actions.reorderCities(newOrders)
      if (success) {
        toast({
          type: "success",
          title: "Cities Reordered",
          description: "City moved down successfully.",
        })
      } else {
        toast({
          type: "error",
          title: "Reorder Failed",
          description: "Failed to reorder cities."
        })
      }
      return success
    }
    return false
  }

  const handleCityRemove = async (cityId: string) => {
    const city = state.selectedCities.find(c => c.id === cityId)
    await actions.removeCity(cityId)
    if (city) {
      toast({
        type: "info",
        title: "City Removed",
        description: `${city.name} has been removed from your world clock.`,
      })
    }
  }

  const handleCopyTime = async (cityId: string): Promise<boolean> => {
    const success = await actions.copyTimeToClipboard(cityId)
    if (success) {
      const city = state.cityTimezones.find(tz => tz.id === cityId)
      toast({
        type: "success",
        title: "Time Copied",
        description: `${city?.name} time copied to clipboard.`,
      })
    } else {
      toast({
        type: "error",
        title: "Copy Failed",
        description: "Failed to copy time to clipboard."
      })
    }
    return success
  }

  const handleExportJSON = () => {
    const jsonData = actions.exportAsJSON()
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `world-clock-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      type: "success",
      title: "Export Complete",
      description: "World clock data exported as JSON file.",
    })
  }

  const formatOffsetDisplay = (hours: number): string => {
    if (hours === 0) return 'Now'
    const absHours = Math.abs(hours)
    const days = Math.floor(absHours / 24)
    const remainingHours = absHours % 24
    
    let display = ''
    if (days > 0) display += `${days}d `
    if (remainingHours > 0) display += `${remainingHours}h`
    
    return hours > 0 ? `+${display}` : `-${display}`
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-lg">
                World Clock Control Panel
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {state.selectedCities.length} cities
              </Badge>
              {!isPremiumUser && (
                <Badge variant="secondary" className="text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  Free Plan
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* City Selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Add City
            </label>
            <TimezoneSelector
              searchQuery={state.searchQuery}
              searchResults={state.searchResults}
              isSearching={state.isSearching}
              onSearchChange={actions.setSearchQuery}
              onCitySelect={handleCityAdd}
              onClearSearch={actions.clearSearch}
              selectedCitiesCount={state.selectedCities.length}
              maxCities={state.maxCities}
              isPremiumUser={isPremiumUser}
            />
          </div>

          {/* Date Picker */}
          <DatePicker
            selectedDate={state.selectedDate}
            onDateChange={actions.setSelectedDate}
            disabled={state.isLoading}
            className="mb-4"
          />

          {/* Time Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Real-time Controls */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Time Controls
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={actions.toggleRealTime}
                  className="flex-1"
                >
                  {state.isRealTimeEnabled ? (
                    <>
                      <Pause className="w-3 h-3 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 mr-1" />
                      Live
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={actions.resetToCurrentTime}
                  disabled={state.timeOffset === 0}
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Fine-Tune Time */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Fine-Tune Time
                {state.timeOffset !== 0 && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {formatOffsetDisplay(state.timeOffset)}
                  </Badge>
                )}
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => actions.navigateTime('backward', 1)}
                  title="Go back 1 hour"
                >
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => actions.navigateTime('backward', 24)}
                  className="flex-1 text-xs"
                  title="Go back 1 day"
                >
                  -1 Day
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => actions.navigateTime('forward', 24)}
                  className="flex-1 text-xs"
                  title="Go forward 1 day"
                >
                  +1 Day
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => actions.navigateTime('forward', 1)}
                  title="Go forward 1 hour"
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={actions.refreshTimezones}
              disabled={state.isLoading}
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${state.isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {/* Debug: Manual Weather Refresh */}
            {isPremiumUser && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('Manual weather refresh triggered')
                  console.log('isPremiumUser:', isPremiumUser)
                  console.log('selectedCities:', state.selectedCities.length)
                  actions.refreshWeather()
                }}
                disabled={state.isLoading}
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${state.isLoading ? 'animate-spin' : ''}`} />
                Weather
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              disabled={state.selectedCities.length === 0}
            >
              <Download className="w-3 h-3 mr-1" />
              Export JSON
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={actions.findBestMeetingTimes}
              disabled={state.selectedCities.length < 2 || state.isLoading}
              className={!isPremiumUser ? 'opacity-60' : ''}
            >
              {!isPremiumUser && <Crown className="w-3 h-3 mr-1" />}
              <Users className="w-3 h-3 mr-1" />
              Find Meeting Times
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle className="w-3 h-3 mr-1" />
              Help
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clock">
            <Grid3X3 className="w-4 h-4 mr-1" />
            World Clock
          </TabsTrigger>
          <TabsTrigger value="meeting" disabled={state.selectedCities.length < 2}>
            <Users className="w-4 h-4 mr-1" />
            Meeting Planner
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock4 className="w-4 h-4 mr-1" />
            Timeline View
          </TabsTrigger>
        </TabsList>

        {/* World Clock Grid */}
        <TabsContent value="clock">
          {state.selectedCities.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Globe className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Cities Added
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start by searching and adding cities to your world clock
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Free users can add up to {state.maxCities} cities
                  {!isPremiumUser && ' • Premium users get unlimited cities'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {state.cityTimezones.map((cityTimezone, index) => (
                <TimezoneCard
                  key={cityTimezone.id}
                  cityTimezone={cityTimezone}
                  onRemove={handleCityRemove}
                  onCopy={handleCopyTime}
                  onUpdateLabel={handleLabelUpdate}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  canMoveUp={index > 0}
                  canMoveDown={index < state.cityTimezones.length - 1}
                  isPremiumUser={isPremiumUser}
                  showWeather={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Meeting Planner */}
        <TabsContent value="meeting">
          <MeetingPlanner
            cityTimezones={state.cityTimezones}
            meetingTimes={state.meetingTimes}
            meetingDuration={state.meetingDuration}
            onDurationChange={actions.setMeetingDuration}
            onFindMeetingTimes={actions.findBestMeetingTimes}
            isLoading={state.isLoading}
            isPremiumUser={isPremiumUser}
          />
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline">
          <Card>
            <CardContent className="p-8 text-center">
              <Clock4 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Timeline View
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Coming soon - Visual timeline showing time differences across all cities
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Panel */}
      <HelpPanel 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
        isPremiumUser={isPremiumUser}
      />
    </div>
  )
}