import { format, addHours, addDays, isWeekend } from 'date-fns'
import { toZonedTime, fromZonedTime, format as formatTz } from 'date-fns-tz'
import { City } from './cities-data'
import { getClientApplicationName } from '@/lib/app-config'

import { WeatherData } from './weather-utils'

export interface CityTimezone {
  id: string
  name: string
  country: string
  countryCode: string
  timezone: string
  coordinates: { lat: number; lng: number }
  currentTime: Date
  utcOffset: number
  isDST: boolean
  abbreviation: string
  isBusinessHours: boolean
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  weather?: WeatherData | null
  isLoadingWeather?: boolean
}

export interface TimeOfDayInfo {
  period: 'morning' | 'afternoon' | 'evening' | 'night'
  color: string
  gradient: string
  description: string
}

// Get time of day classification and styling
export const getTimeOfDay = (date: Date): TimeOfDayInfo => {
  const hour = date.getHours()
  
  if (hour >= 6 && hour < 12) {
    return {
      period: 'morning',
      color: 'text-blue-700 dark:text-blue-300',
      gradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      description: 'Morning'
    }
  } else if (hour >= 12 && hour < 18) {
    return {
      period: 'afternoon',
      color: 'text-yellow-700 dark:text-yellow-300',
      gradient: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
      description: 'Afternoon'
    }
  } else if (hour >= 18 && hour < 22) {
    return {
      period: 'evening',
      color: 'text-orange-700 dark:text-orange-300',
      gradient: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
      description: 'Evening'
    }
  } else {
    return {
      period: 'night',
      color: 'text-purple-700 dark:text-purple-300',
      gradient: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
      description: 'Night'
    }
  }
}

// Check if time falls within business hours (9 AM - 5 PM)
export const isBusinessHours = (date: Date): boolean => {
  const hour = date.getHours()
  const isWeekday = !isWeekend(date)
  return isWeekday && hour >= 9 && hour < 17
}

// Get timezone abbreviation (simplified)
export const getTimezoneAbbreviation = (timezone: string, date: Date): string => {
  try {
    const zonedDate = toZonedTime(date, timezone)
    const formatted = formatTz(zonedDate, 'zzz', { timeZone: timezone })
    return formatted
  } catch {
    // Fallback to UTC offset
    const utcOffset = getUTCOffset(timezone, date)
    const sign = utcOffset >= 0 ? '+' : '-'
    const hours = Math.abs(Math.floor(utcOffset))
    const minutes = Math.abs((utcOffset % 1) * 60)
    return `UTC${sign}${hours.toString().padStart(2, '0')}${minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : ''}`
  }
}

// Get UTC offset in hours for a timezone
export const getUTCOffset = (timezone: string, date: Date): number => {
  try {
    // Use Intl API for accurate timezone offset, including DST
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    const parts = dtf.formatToParts(date)
    const map: Record<string, string> = {}
    for (const p of parts) {
      if (p.type !== 'literal') map[p.type] = p.value
    }
    const localAsUTC = Date.UTC(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      Number(map.hour),
      Number(map.minute),
      Number(map.second)
    )
    const offsetMs = localAsUTC - date.getTime()
    const hours = offsetMs / (1000 * 60 * 60)
    // Round to 1 decimal place to capture half/quarter-hour offsets cleanly
    return Math.round(hours * 10) / 10
  } catch {
    return 0
  }
}

// Check if timezone is currently observing DST
export const isDaylightSaving = (timezone: string, date: Date): boolean => {
  try {
    // Compare current offset with January offset (non-DST reference)
    const januaryDate = new Date(date.getFullYear(), 0, 1)
    const currentOffset = getUTCOffset(timezone, date)
    const januaryOffset = getUTCOffset(timezone, januaryDate)
    return currentOffset !== januaryOffset
  } catch {
    return false
  }
}

// Convert City to CityTimezone with current time data
export const cityToCityTimezone = (city: City, baseDate: Date = new Date()): CityTimezone => {
  const zonedTime = toZonedTime(baseDate, city.timezone)
  const utcOffset = getUTCOffset(city.timezone, baseDate)
  const isDST = isDaylightSaving(city.timezone, baseDate)
  const abbreviation = getTimezoneAbbreviation(city.timezone, baseDate)
  const timeOfDay = getTimeOfDay(zonedTime)
  
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    countryCode: city.countryCode,
    timezone: city.timezone,
    coordinates: city.coordinates,
    currentTime: zonedTime,
    utcOffset,
    isDST,
    abbreviation,
    isBusinessHours: isBusinessHours(zonedTime),
    timeOfDay: timeOfDay.period
  }
}

// Update all city timezones with new base time (for time scrubbing)
export const updateCityTimezones = (cities: City[], baseDate: Date, existingTimezones?: CityTimezone[]): CityTimezone[] => {
  return cities.map(city => {
    const newTimezone = cityToCityTimezone(city, baseDate)
    
    // Preserve weather data from existing timezones if available
    if (existingTimezones) {
      const existingTz = existingTimezones.find(tz => tz.id === city.id)
      if (existingTz) {
        newTimezone.weather = existingTz.weather
        newTimezone.isLoadingWeather = existingTz.isLoadingWeather
      }
    }
    
    return newTimezone
  })
}

// Format time for display
export const formatDisplayTime = (date: Date, includeSeconds: boolean = true): string => {
  if (includeSeconds) {
    return format(date, 'h:mm:ss aa')
  }
  return format(date, 'h:mm aa')
}

// Format date for display
export const formatDisplayDate = (date: Date): string => {
  return format(date, 'EEE, MMM d')
}

// Format full date and time
export const formatFullDateTime = (date: Date): string => {
  return format(date, 'PPpp')
}

// Get time difference in hours between two timezones
export const getTimeDifference = (timezone1: string, timezone2: string, baseDate: Date = new Date()): number => {
  const offset1 = getUTCOffset(timezone1, baseDate)
  const offset2 = getUTCOffset(timezone2, baseDate)
  return offset1 - offset2
}

// Find best meeting times across multiple timezones
export interface MeetingTimeSlot {
  utcTime: Date
  localTimes: { [cityId: string]: Date }
  businessHoursCount: number
  score: number
  isWeekend: boolean
}

export const findMeetingTimes = (
  cityTimezones: CityTimezone[],
  duration: number = 60, // minutes
  dateRange: { start: Date; end: Date } = {
    start: new Date(),
    end: addDays(new Date(), 7)
  }
): MeetingTimeSlot[] => {
  const meetingSlots: MeetingTimeSlot[] = []
  const current = new Date(dateRange.start)
  
  while (current <= dateRange.end) {
    // Check every hour
    for (let hour = 0; hour < 24; hour++) {
      const testTime = new Date(current)
      testTime.setHours(hour, 0, 0, 0)
      
      const localTimes: { [cityId: string]: Date } = {}
      let businessHoursCount = 0
      let score = 0
      
      cityTimezones.forEach(cityTz => {
        const localTime = toZonedTime(testTime, cityTz.timezone)
        localTimes[cityTz.id] = localTime
        
        if (isBusinessHours(localTime)) {
          businessHoursCount++
          score += 10
        }
        
        // Bonus for not being too early or too late
        const localHour = localTime.getHours()
        if (localHour >= 8 && localHour <= 20) {
          score += 5
        }
        
        // Penalty for very early or very late hours
        if (localHour < 6 || localHour > 22) {
          score -= 5
        }
      })
      
      meetingSlots.push({
        utcTime: testTime,
        localTimes,
        businessHoursCount,
        score,
        isWeekend: isWeekend(testTime)
      })
    }
    
    current.setDate(current.getDate() + 1)
  }
  
  // Sort by score (best first)
  return meetingSlots.sort((a, b) => b.score - a.score)
}

// Export timezone data as JSON
export const exportTimezonesAsJSON = (cityTimezones: CityTimezone[]): string => {
  const exportData = {
    exportDate: new Date().toISOString(),
    timezones: cityTimezones.map(tz => ({
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
}

// Generate iCal event for meeting time
export const generateICalEvent = (
  meetingTime: MeetingTimeSlot,
  duration: number,
  title: string = 'Team Meeting'
): string => {
  const startTime = meetingTime.utcTime
  const endTime = addHours(startTime, duration / 60)
  
  const formatICalDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//DevToolsKitHub//World Clock//EN
BEGIN:VEVENT
UID:${Date.now()}@devtoolskithub.com
DTSTAMP:${formatICalDate(new Date())}
DTSTART:${formatICalDate(startTime)}
DTEND:${formatICalDate(endTime)}
SUMMARY:${title}
DESCRIPTION:Meeting scheduled across multiple timezones using ${getClientApplicationName()} World Clock
END:VEVENT
END:VCALENDAR`
}

// Copy time to clipboard format
export const formatForClipboard = (cityTimezone: CityTimezone): string => {
  return `${cityTimezone.name}, ${cityTimezone.country}: ${formatDisplayTime(cityTimezone.currentTime)} ${cityTimezone.abbreviation} (${formatDisplayDate(cityTimezone.currentTime)})`
}