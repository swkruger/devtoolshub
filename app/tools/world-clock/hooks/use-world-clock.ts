'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { addHours, addDays, subDays } from 'date-fns'
import { City, searchCities, getCityById } from '../lib/cities-data'
import { CityTimezone, updateCityTimezones, findMeetingTimes, MeetingTimeSlot } from '../lib/timezone-utils'

export interface WorldClockState {
  selectedCities: City[]
  cityTimezones: CityTimezone[]
  currentDateTime: Date
  timeOffset: number // hours from current time for scrubbing
  selectedDate: Date
  searchQuery: string
  searchResults: City[]
  isSearching: boolean
  isLoading: boolean
  isInitialized: boolean // whether initial data loading is complete
  meetingDuration: number // minutes
  meetingTimes: MeetingTimeSlot[]
  viewMode: 'grid' | 'timeline' | 'meeting'
  isRealTimeEnabled: boolean
  maxCities: number
  isPremiumUser: boolean
  temperatureUnit: 'C' | 'F'
}

export interface WorldClockActions {
  // City management
  addCity: (city: City) => Promise<boolean>
  removeCity: (cityId: string) => Promise<void>
  clearAllCities: () => Promise<void>
  updateCityLabel: (cityId: string, customLabel: string) => Promise<boolean>
  reorderCities: (cityOrders: { cityId: string; displayOrder: number }[]) => Promise<boolean>
  
  // Search
  setSearchQuery: (query: string) => void
  clearSearch: () => void
  
  // Time scrubbing
  setTimeOffset: (hours: number) => void
  resetToCurrentTime: () => void
  navigateTime: (direction: 'forward' | 'backward', amount: number) => void
  setSelectedDate: (date: Date) => void
  
  // Meeting planner
  setMeetingDuration: (minutes: number) => void
  findBestMeetingTimes: () => void
  
  // Display options
  setViewMode: (mode: 'grid' | 'timeline' | 'meeting') => void
  toggleRealTime: () => void
  
  // Weather
  refreshWeather: () => Promise<void>
  
  // Utility
  refreshTimezones: () => void
  copyTimeToClipboard: (cityId: string) => Promise<boolean>
  exportAsJSON: () => string
  setTemperatureUnit: (unit: 'C' | 'F') => Promise<void>
}

export const useWorldClock = (isPremiumUser: boolean = false, userId?: string): [WorldClockState, WorldClockActions] => {
  const [state, setState] = useState<WorldClockState>({
    selectedCities: [],
    cityTimezones: [],
    currentDateTime: new Date(),
    timeOffset: 0,
    selectedDate: new Date(),
    searchQuery: '',
    searchResults: [],
    isSearching: false,
    isLoading: false,
    isInitialized: false,
    meetingDuration: 60,
    meetingTimes: [],
    viewMode: 'grid',
    isRealTimeEnabled: true,
    maxCities: isPremiumUser ? 100 : 5,
    isPremiumUser,
    temperatureUnit: 'C'
  })
  
  const [isInitialized, setIsInitialized] = useState(false)

  const realTimeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastWeatherRefreshRef = useRef<number>(0)

  // Load saved cities from database or localStorage on initialization
  useEffect(() => {
    const loadSavedCities = async () => {
      if (isInitialized) return
      
      let savedCities: City[] = []
      let savedTempUnit: 'C' | 'F' = 'C'
      
      try {
        if (userId) {
          // Load from database for authenticated users
          const [citiesRes, profileRes] = await Promise.all([
            fetch('/api/world-clock-cities'),
            fetch('/api/settings/profile')
          ])
          if (citiesRes.ok) {
            const data = await citiesRes.json()
            savedCities = data.cities || []
          }
          if (profileRes.ok) {
            const data = await profileRes.json()
            const unit = (data?.preferences?.temperature_unit as 'C' | 'F') || null
            if (unit === 'C' || unit === 'F') savedTempUnit = unit
          }
        } else {
          // Load from localStorage for non-authenticated users
          const saved = localStorage.getItem('worldClockCities')
          if (saved) {
            savedCities = JSON.parse(saved)
          }
          const savedUnit = localStorage.getItem('worldClockTemperatureUnit') as 'C' | 'F' | null
          if (savedUnit === 'C' || savedUnit === 'F') {
            savedTempUnit = savedUnit
          } else {
            // Default by locale
            if (typeof navigator !== 'undefined' && navigator.language && navigator.language.includes('US')) {
              savedTempUnit = 'F'
            }
          }
        }
        
        setState(prev => ({
          ...prev,
          selectedCities: savedCities,
          temperatureUnit: savedTempUnit
        }))
      } catch (error) {
        console.error('Error loading saved cities:', error)
      } finally {
        setIsInitialized(true)
        setState(prev => ({
          ...prev,
          isInitialized: true
        }))
      }
    }
    
    loadSavedCities()
  }, [userId, isInitialized])

  // Save to localStorage for non-authenticated users
  const saveToLocalStorage = useCallback((cities: City[]) => {
    if (!userId) {
      try {
        localStorage.setItem('worldClockCities', JSON.stringify(cities))
      } catch (error) {
        console.error('Error saving to localStorage:', error)
      }
    }
  }, [userId])

  

  // Real-time clock updates
  useEffect(() => {
    if (state.isRealTimeEnabled && state.timeOffset === 0) {
      realTimeIntervalRef.current = setInterval(() => {
        const now = new Date()
        setState(prev => ({
          ...prev,
          currentDateTime: now,
          selectedDate: now,
          cityTimezones: updateCityTimezones(prev.selectedCities, now, prev.cityTimezones)
        }))
      }, 1000) // Update every second
    } else {
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current)
        realTimeIntervalRef.current = null
      }
    }

    return () => {
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current)
      }
    }
  }, [state.isRealTimeEnabled, state.timeOffset, state.selectedCities])

  // Update timezones when cities or time changes
  useEffect(() => {
    const baseTime = addHours(state.currentDateTime, state.timeOffset)
    setState(prev => ({
      ...prev,
      cityTimezones: updateCityTimezones(prev.selectedCities, baseTime, prev.cityTimezones)
    }))
  }, [state.selectedCities, state.currentDateTime, state.timeOffset])

  // Search with debouncing
  useEffect(() => {
    if (!state.searchQuery.trim()) {
      setState(prev => ({ ...prev, searchResults: [], isSearching: false }))
      return
    }

    setState(prev => ({ ...prev, isSearching: true }))
    
    const timeoutId = setTimeout(() => {
      const results = searchCities(state.searchQuery, 20)
      setState(prev => ({
        ...prev,
        searchResults: results,
        isSearching: false
      }))
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [state.searchQuery])

  const actions: WorldClockActions = {
    addCity: useCallback(async (city: City): Promise<boolean> => {
      if (state.selectedCities.length >= state.maxCities) {
        return false // City limit reached
      }
      
      if (state.selectedCities.find(c => c.id === city.id)) {
        return false // City already added
      }

      const newCities = [...state.selectedCities, city]
      
      // Save to database or localStorage
      try {
        if (userId) {
          const response = await fetch('/api/world-clock-cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ city })
          })
          
          if (!response.ok) {
            const error = await response.json()
            console.error('Failed to save city to database:', error)
            return false
          }
        } else {
          saveToLocalStorage(newCities)
        }
      } catch (error) {
        console.error('Error saving city:', error)
        return false
      }

      setState(prev => ({
        ...prev,
        selectedCities: newCities,
        searchQuery: '',
        searchResults: []
      }))
      
      return true
    }, [state.selectedCities, state.maxCities, userId, saveToLocalStorage]),

    removeCity: useCallback(async (cityId: string) => {
      const newCities = state.selectedCities.filter(city => city.id !== cityId)
      
      // Save to database or localStorage
      try {
        if (userId) {
          const response = await fetch(`/api/world-clock-cities/${cityId}`, {
            method: 'DELETE'
          })
          
          if (!response.ok) {
            const error = await response.json()
            console.error('Failed to remove city from database:', error)
            return
          }
        } else {
          saveToLocalStorage(newCities)
        }
      } catch (error) {
        console.error('Error removing city:', error)
        return
      }
      
      setState(prev => ({
        ...prev,
        selectedCities: newCities
      }))
    }, [state.selectedCities, userId, saveToLocalStorage]),

    clearAllCities: useCallback(async () => {
      // Save to database or localStorage
      try {
        if (userId) {
          const response = await fetch('/api/world-clock-cities', {
            method: 'DELETE'
          })
          
          if (!response.ok) {
            const error = await response.json()
            console.error('Failed to clear cities from database:', error)
            return
          }
        } else {
          saveToLocalStorage([])
        }
      } catch (error) {
        console.error('Error clearing cities:', error)
        return
      }
      
      setState(prev => ({
        ...prev,
        selectedCities: [],
        cityTimezones: []
      }))
    }, [userId, saveToLocalStorage]),

    updateCityLabel: useCallback(async (cityId: string, customLabel: string): Promise<boolean> => {
      try {
        if (userId) {
          const response = await fetch(`/api/world-clock-cities/${cityId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ custom_label: customLabel || null })
          })
          
          if (!response.ok) {
            const error = await response.json()
            console.error('Failed to update city label:', error)
            return false
          }
        } else {
          // Update localStorage for non-authenticated users
          const newCities = state.selectedCities.map(city => 
            city.id === cityId 
              ? { ...city, customLabel, name: customLabel || city.originalName || city.name }
              : city
          )
          saveToLocalStorage(newCities)
        }
        
        // Update local state
        setState(prev => ({
          ...prev,
          selectedCities: prev.selectedCities.map(city => 
            city.id === cityId 
              ? { ...city, customLabel, name: customLabel || city.originalName || city.name }
              : city
          )
        }))
        
        return true
      } catch (error) {
        console.error('Error updating city label:', error)
        return false
      }
    }, [state.selectedCities, userId, saveToLocalStorage]),

    reorderCities: useCallback(async (cityOrders: { cityId: string; displayOrder: number }[]): Promise<boolean> => {
      try {
        if (userId) {
          const response = await fetch('/api/world-clock-cities/reorder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              cityOrders: cityOrders.map(order => ({ 
                city_id: order.cityId, 
                display_order: order.displayOrder 
              }))
            })
          })
          
          if (!response.ok) {
            const error = await response.json()
            console.error('Failed to reorder cities:', error)
            return false
          }
        } else {
          // Update localStorage for non-authenticated users
          const reorderedCities = [...state.selectedCities]
          cityOrders.forEach(({ cityId, displayOrder }) => {
            const cityIndex = reorderedCities.findIndex(city => city.id === cityId)
            if (cityIndex !== -1) {
              reorderedCities[cityIndex] = { ...reorderedCities[cityIndex], displayOrder }
            }
          })
          reorderedCities.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          saveToLocalStorage(reorderedCities)
        }
        
        // Update local state
        setState(prev => {
          const reorderedCities = [...prev.selectedCities]
          cityOrders.forEach(({ cityId, displayOrder }) => {
            const cityIndex = reorderedCities.findIndex(city => city.id === cityId)
            if (cityIndex !== -1) {
              reorderedCities[cityIndex] = { ...reorderedCities[cityIndex], displayOrder }
            }
          })
          reorderedCities.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          
          return {
            ...prev,
            selectedCities: reorderedCities
          }
        })
        
        return true
      } catch (error) {
        console.error('Error reordering cities:', error)
        return false
      }
    }, [state.selectedCities, userId, saveToLocalStorage]),

    setSearchQuery: useCallback((query: string) => {
      setState(prev => ({ ...prev, searchQuery: query }))
    }, []),

    clearSearch: useCallback(() => {
      setState(prev => ({
        ...prev,
        searchQuery: '',
        searchResults: [],
        isSearching: false
      }))
    }, []),

    setTimeOffset: useCallback((hours: number) => {
      const maxOffset = state.isPremiumUser ? 720 : 168 // 30 days vs 7 days
      const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, hours))
      
      setState(prev => ({
        ...prev,
        timeOffset: clampedOffset,
        selectedDate: addHours(prev.currentDateTime, clampedOffset),
        isRealTimeEnabled: clampedOffset === 0
      }))
    }, [state.isPremiumUser]),

    resetToCurrentTime: useCallback(() => {
      const now = new Date()
      setState(prev => ({
        ...prev,
        currentDateTime: now,
        selectedDate: now,
        timeOffset: 0,
        isRealTimeEnabled: true
      }))
    }, []),

    navigateTime: useCallback((direction: 'forward' | 'backward', amount: number) => {
      const multiplier = direction === 'forward' ? 1 : -1
      const newOffset = state.timeOffset + (amount * multiplier)
      actions.setTimeOffset(newOffset)
    }, [state.timeOffset]),

    setSelectedDate: useCallback((date: Date) => {
      const now = new Date()
      const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60)
      actions.setTimeOffset(diffInHours)
    }, []),

    setMeetingDuration: useCallback((minutes: number) => {
      setState(prev => ({ ...prev, meetingDuration: minutes }))
    }, []),

    findBestMeetingTimes: useCallback(() => {
      if (state.cityTimezones.length === 0) return

      setState(prev => ({ ...prev, isLoading: true }))
      
      // Use a web worker for heavy computation in real implementation
      setTimeout(() => {
        const dateRange = {
          start: state.selectedDate,
          end: addDays(state.selectedDate, state.isPremiumUser ? 30 : 7)
        }
        
        const meetingTimes = findMeetingTimes(
          state.cityTimezones,
          state.meetingDuration,
          dateRange
        ).slice(0, 20) // Top 20 suggestions
        
        setState(prev => ({
          ...prev,
          meetingTimes,
          isLoading: false,
          viewMode: 'meeting'
        }))
      }, 500)
    }, [state.cityTimezones, state.meetingDuration, state.selectedDate, state.isPremiumUser]),

    setViewMode: useCallback((mode: 'grid' | 'timeline' | 'meeting') => {
      setState(prev => ({ ...prev, viewMode: mode }))
    }, []),

    toggleRealTime: useCallback(() => {
      setState(prev => {
        const newIsRealTimeEnabled = !prev.isRealTimeEnabled
        
        // If switching TO live mode, reset to current date/time
        if (newIsRealTimeEnabled) {
          const now = new Date()
          return {
            ...prev,
            isRealTimeEnabled: newIsRealTimeEnabled,
            currentDateTime: now,
            selectedDate: now,
            timeOffset: 0,
            cityTimezones: updateCityTimezones(prev.selectedCities, now, prev.cityTimezones)
          }
        } else {
          // If switching FROM live mode, just disable real-time updates
          return {
            ...prev,
            isRealTimeEnabled: newIsRealTimeEnabled
          }
        }
      })
    }, []),

    refreshTimezones: useCallback(() => {
      setState(prev => ({ ...prev, isLoading: true }))
      setTimeout(() => {
        const baseTime = addHours(state.currentDateTime, state.timeOffset)
        setState(prev => ({
          ...prev,
          cityTimezones: updateCityTimezones(prev.selectedCities, baseTime, prev.cityTimezones),
          isLoading: false
        }))
      }, 100)
    }, [state.currentDateTime, state.timeOffset]),

    refreshWeather: useCallback(async () => {
      if (!isPremiumUser || state.selectedCities.length === 0) return
      
      // Rate limiting: prevent too frequent calls
      const now = Date.now()
      const WEATHER_COOLDOWN = 5000 // 5 seconds minimum between weather refreshes
      
      if (now - lastWeatherRefreshRef.current < WEATHER_COOLDOWN) {
        console.log('Weather refresh skipped due to rate limiting')
        return
      }
      lastWeatherRefreshRef.current = now
      
      console.log('Refreshing weather for', state.selectedCities.length, 'cities')
      
      // Mark all cities as loading weather
      setState(prev => ({
        ...prev,
        cityTimezones: prev.cityTimezones.map(tz => ({
          ...tz,
          isLoadingWeather: true
        }))
      }))
      
      // Fetch weather for all cities with batch processing
      const weatherPromises = state.selectedCities.map(async (city, index) => {
        try {
          // Add small delay between requests to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, index * 200))
          
          const weatherUrl = `/api/weather?lat=${city.coordinates.lat}&lng=${city.coordinates.lng}`
          console.log(`Fetching weather for ${city.name}:`, weatherUrl)
          
          const response = await fetch(weatherUrl)
          console.log(`Weather response for ${city.name}:`, response.status, response.statusText)
          
          if (response.ok) {
            const data = await response.json()
            console.log(`Weather data for ${city.name}:`, data)
            return { cityId: city.id, weather: data.current }
          } else {
            const error = await response.text()
            console.error(`Weather API error for ${city.name}:`, response.status, error)
          }
        } catch (error) {
          console.error(`Error fetching weather for ${city.name}:`, error)
        }
        return { cityId: city.id, weather: null }
      })
      
      const weatherResults = await Promise.all(weatherPromises)
      console.log('All weather results:', weatherResults)
      
      // Update state with weather data
      setState(prev => ({
        ...prev,
        cityTimezones: prev.cityTimezones.map(tz => {
          const weatherResult = weatherResults.find(w => w.cityId === tz.id)
          console.log(`Updating weather for ${tz.name}:`, weatherResult?.weather)
          return {
            ...tz,
            weather: weatherResult?.weather || null,
            isLoadingWeather: false
          }
        })
      }))
    }, [isPremiumUser, state.selectedCities]),

    copyTimeToClipboard: useCallback(async (cityId: string): Promise<boolean> => {
      const cityTimezone = state.cityTimezones.find(tz => tz.id === cityId)
      if (!cityTimezone) return false

      try {
        const text = `${cityTimezone.name}, ${cityTimezone.country}: ${cityTimezone.currentTime.toLocaleString()} ${cityTimezone.abbreviation}`
        await navigator.clipboard.writeText(text)
        return true
      } catch (error) {
        console.error('Failed to copy to clipboard:', error)
        return false
      }
    }, [state.cityTimezones]),

    exportAsJSON: useCallback((): string => {
      const exportData = {
        exportDate: new Date().toISOString(),
        selectedCities: state.selectedCities,
        currentTime: state.selectedDate.toISOString(),
        timeOffset: state.timeOffset,
        timezones: state.cityTimezones.map(tz => ({
          id: tz.id,
          name: tz.name,
          country: tz.country,
          timezone: tz.timezone,
          currentTime: tz.currentTime.toISOString(),
          utcOffset: tz.utcOffset,
          abbreviation: tz.abbreviation,
          isBusinessHours: tz.isBusinessHours,
          timeOfDay: tz.timeOfDay
        }))
      }
      
      return JSON.stringify(exportData, null, 2)
    }, [state]),

    setTemperatureUnit: useCallback(async (unit: 'C' | 'F') => {
      setState(prev => ({ ...prev, temperatureUnit: unit }))
      try {
        if (userId) {
          // Fetch current preferences to avoid overwriting with undefineds
          const res = await fetch('/api/settings/profile')
          if (res.ok) {
            const data = await res.json()
            const prefs = data?.preferences || {}
            await fetch('/api/settings/profile', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                preferences: {
                  timezone: prefs.timezone || 'UTC',
                  theme: prefs.theme || 'system',
                  language: prefs.language || 'en',
                  temperature_unit: unit,
                  email_notifications: prefs.email_notifications || {},
                  developer_preferences: prefs.developer_preferences || {},
                  bio: prefs.bio || ''
                }
              })
            })
          }
        } else {
          localStorage.setItem('worldClockTemperatureUnit', unit)
        }
      } catch (e) {
        console.error('Failed to persist temperature unit', e)
      }
    }, [userId])
  }

  return [state, actions]
}

// Keyboard shortcuts hook
export const useWorldClockKeyboard = (actions: WorldClockActions) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip shortcuts if user is typing in an input field
      const target = event.target as HTMLElement
      const isTyping = target.tagName === 'INPUT' || 
                       target.tagName === 'TEXTAREA' || 
                       target.contentEditable === 'true' ||
                       target.closest('[contenteditable="true"]')
      
      if (isTyping) {
        return // Let normal typing work in input fields
      }

      // Help panel (always available)
      if (event.key === 'F1') {
        event.preventDefault()
        // Toggle help panel (implement in component)
        return
      }

      // Search cities (always available with modifier)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        // Focus search input (implement in component)
        return
      }

      // Only activate letter shortcuts when NOT typing
      // Reset to current time
      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault()
        actions.resetToCurrentTime()
        return
      }

      // Navigate time (arrow keys are less intrusive)
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        actions.navigateTime('backward', 1)
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        actions.navigateTime('forward', 1)
        return
      }

      // Toggle meeting mode
      if (event.key === 'm' || event.key === 'M') {
        event.preventDefault()
        actions.setViewMode('meeting')
        return
      }

      // Toggle grid mode
      if (event.key === 'g' || event.key === 'G') {
        event.preventDefault()
        actions.setViewMode('grid')
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [actions])
}