'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { X, Copy, Clock, MapPin, Sun, Moon, Briefcase, CheckCircle2, Edit3, Check, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'
import { CityTimezone, getTimeOfDay, formatDisplayTime, formatDisplayDate } from '../lib/timezone-utils'

interface TimezoneCardProps {
  cityTimezone: CityTimezone
  onRemove: (cityId: string) => void
  onCopy: (cityId: string) => Promise<boolean>
  onUpdateLabel?: (cityId: string, label: string) => Promise<boolean>
  onMoveUp?: (cityId: string) => Promise<boolean>
  onMoveDown?: (cityId: string) => Promise<boolean>
  isPremiumUser: boolean
  showWeather?: boolean
  className?: string
  canMoveUp?: boolean
  canMoveDown?: boolean
}

export default function TimezoneCard({
  cityTimezone,
  onRemove,
  onCopy,
  onUpdateLabel,
  onMoveUp,
  onMoveDown,
  isPremiumUser,
  showWeather = false,
  className = '',
  canMoveUp = false,
  canMoveDown = false
}: TimezoneCardProps) {
  const [isEditingLabel, setIsEditingLabel] = useState(false)
  const [editLabel, setEditLabel] = useState(cityTimezone.name)
  const [isUpdatingLabel, setIsUpdatingLabel] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const timeOfDay = getTimeOfDay(cityTimezone.currentTime)
  const isWeekend = cityTimezone.currentTime.getDay() === 0 || cityTimezone.currentTime.getDay() === 6

  const handleCopy = async () => {
    const success = await onCopy(cityTimezone.id)
    if (success) {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handleLabelSave = async () => {
    if (!onUpdateLabel) return
    
    setIsUpdatingLabel(true)
    try {
      const success = await onUpdateLabel(cityTimezone.id, editLabel.trim())
      if (success) {
        setIsEditingLabel(false)
      }
    } catch (error) {
      console.error('Error updating label:', error)
    } finally {
      setIsUpdatingLabel(false)
    }
  }

  const handleLabelCancel = () => {
    setEditLabel(cityTimezone.name)
    setIsEditingLabel(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelSave()
    } else if (e.key === 'Escape') {
      handleLabelCancel()
    }
  }

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => {
      onRemove(cityTimezone.id)
    }, 150)
  }

  const getTimeIcon = () => {
    switch (timeOfDay.period) {
      case 'morning':
        return <Sun className="w-4 h-4 text-yellow-500" />
      case 'afternoon':
        return <Sun className="w-4 h-4 text-orange-500" />
      case 'evening':
        return <Sun className="w-4 h-4 text-red-500" />
      case 'night':
        return <Moon className="w-4 h-4 text-purple-500" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <Card 
      className={`
        relative group transition-all duration-300 hover:shadow-lg border-2
        ${timeOfDay.gradient} 
        ${cityTimezone.isBusinessHours ? 'border-green-200 dark:border-green-800' : 'border-gray-200 dark:border-gray-800'}
        ${isWeekend ? 'opacity-90' : ''}
        ${isRemoving ? 'scale-95 opacity-50' : 'hover:scale-[1.02]'}
        ${className}
      `}
    >
      {/* Remove button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
        aria-label={`Remove ${cityTimezone.name}`}
      >
        <X className="w-3 h-3" />
      </Button>

      <CardContent className="p-4">
        {/* City Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-3 h-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              {isEditingLabel ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="font-semibold h-7 text-sm"
                    placeholder="Enter custom label..."
                    disabled={isUpdatingLabel}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleLabelSave}
                    disabled={isUpdatingLabel}
                    className="p-1 h-7 w-7"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleLabelCancel}
                    disabled={isUpdatingLabel}
                    className="p-1 h-7 w-7"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {cityTimezone.name}
                  </h3>
                  {onUpdateLabel && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingLabel(true)}
                      className="p-1 h-5 w-5 opacity-60 hover:opacity-100"
                      title="Edit city label"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {cityTimezone.countryCode}
                  </Badge>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {cityTimezone.country}
            </p>
          </div>
        </div>

        {/* Time Display */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            {getTimeIcon()}
            <span className="text-2xl font-mono font-bold text-gray-900 dark:text-gray-100">
              {formatDisplayTime(cityTimezone.currentTime, true)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {formatDisplayDate(cityTimezone.currentTime)}
            </span>
            <span className="font-mono text-gray-500 dark:text-gray-500">
              {cityTimezone.abbreviation}
            </span>
          </div>
        </div>

        {/* Time Zone Info */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">UTC Offset:</span>
            <span className="font-mono text-gray-700 dark:text-gray-300">
              {cityTimezone.utcOffset >= 0 ? '+' : ''}{cityTimezone.utcOffset}h
            </span>
          </div>
          
          {cityTimezone.isDST && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-blue-600 dark:text-blue-400">
                Daylight Saving Time
              </span>
            </div>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Time of Day */}
          <Badge 
            variant="secondary" 
            className={`text-xs ${timeOfDay.color}`}
          >
            {timeOfDay.description}
          </Badge>

          {/* Business Hours */}
          {cityTimezone.isBusinessHours && (
            <Badge variant="secondary" className="text-xs text-green-700 dark:text-green-300">
              <Briefcase className="w-3 h-3 mr-1" />
              Business Hours
            </Badge>
          )}

          {/* Weekend */}
          {isWeekend && (
            <Badge variant="outline" className="text-xs">
              Weekend
            </Badge>
          )}
        </div>

        {/* Weather Widget (Premium Feature) */}
        {showWeather && isPremiumUser && (
          <div className="mb-4 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            {cityTimezone.isLoadingWeather ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading weather...</span>
              </div>
            ) : cityTimezone.weather ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <img 
                      src={`https://openweathermap.org/img/wn/${cityTimezone.weather.icon}@2x.png`}
                      alt={cityTimezone.weather.description}
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {cityTimezone.weather.temperature}°C
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {cityTimezone.weather.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Humidity: {cityTimezone.weather.humidity}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Wind: {cityTimezone.weather.windSpeed} km/h
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Weather data unavailable</span>
              </div>
            )}
          </div>
        )}

        {/* Weather Teaser (Free Users) */}
        {showWeather && !isPremiumUser && (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg border border-blue-200/50 dark:border-blue-800/50 opacity-75">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Sun className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Weather Data
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Premium Feature
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                ✨ Premium
              </Badge>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Reorder buttons */}
          {(onMoveUp || onMoveDown) && (
            <div className="flex">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMoveUp?.(cityTimezone.id)}
                disabled={!canMoveUp}
                className="h-8 w-8 p-0 rounded-r-none border-r-0 disabled:opacity-30"
                title="Move up"
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMoveDown?.(cityTimezone.id)}
                disabled={!canMoveDown}
                className="h-8 w-8 p-0 rounded-l-none disabled:opacity-30"
                title="Move down"
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-1 h-8 text-xs"
            disabled={isCopied}
          >
            {isCopied ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy Time
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
            disabled={isRemoving}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}