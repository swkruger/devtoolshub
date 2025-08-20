'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Search, MapPin, Globe, Clock, Crown, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { City } from '../lib/cities-data'

interface TimezoneSelectorProps {
  searchQuery: string
  searchResults: City[]
  isSearching: boolean
  onSearchChange: (query: string) => void
  onCitySelect: (city: City) => void
  onClearSearch: () => void
  selectedCitiesCount: number
  maxCities: number
  isPremiumUser: boolean
  disabled?: boolean
}

export default function TimezoneSelector({
  searchQuery,
  searchResults,
  isSearching,
  onSearchChange,
  onCitySelect,
  onClearSearch,
  selectedCitiesCount,
  maxCities,
  isPremiumUser,
  disabled = false
}: TimezoneSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const canAddMore = selectedCitiesCount < maxCities
  const isAtLimit = selectedCitiesCount >= maxCities

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isDropdownOpen || searchResults.length === 0) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setHighlightedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : searchResults.length - 1
          )
          break
        case 'Enter':
          event.preventDefault()
          if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
            handleCitySelect(searchResults[highlightedIndex])
          }
          break
        case 'Escape':
          event.preventDefault()
          handleCloseDropdown()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDropdownOpen, searchResults, highlightedIndex])

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Open dropdown when there are search results
  useEffect(() => {
    if (searchResults.length > 0 || isSearching) {
      setIsDropdownOpen(true)
      setHighlightedIndex(-1)
    } else {
      setIsDropdownOpen(false)
    }
  }, [searchResults, isSearching])

  const handleSearchChange = (value: string) => {
    onSearchChange(value)
    if (value.trim()) {
      setIsDropdownOpen(true)
    }
  }

  const handleCitySelect = (city: City) => {
    if (canAddMore) {
      onCitySelect(city)
      setIsDropdownOpen(false)
      setHighlightedIndex(-1)
    }
  }

  const handleCloseDropdown = () => {
    setIsDropdownOpen(false)
    setHighlightedIndex(-1)
    searchInputRef.current?.blur()
  }

  const handleClearSearch = () => {
    onClearSearch()
    setIsDropdownOpen(false)
    setHighlightedIndex(-1)
  }

  const formatTimezoneName = (timezone: string): string => {
    return timezone.replace('_', ' ').split('/').pop() || timezone
  }

  return (
    <div className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        
        <Input
          ref={searchInputRef}
          type="text"
          placeholder={
            isAtLimit 
              ? isPremiumUser 
                ? "Search cities..." 
                : `City limit reached (${maxCities})`
              : "Search cities..."
          }
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => {
            if (searchResults.length > 0) {
              setIsDropdownOpen(true)
            }
          }}
          disabled={disabled || (isAtLimit && !isPremiumUser)}
          className={`pl-10 pr-10 ${
            isAtLimit && !isPremiumUser 
              ? 'bg-gray-50 dark:bg-gray-900 text-gray-400 cursor-not-allowed' 
              : ''
          }`}
          aria-label="Search for cities to add to world clock"
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />

        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0"
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* City Limit Warning */}
      {isAtLimit && !isPremiumUser && (
        <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                City Limit Reached
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Free users can add up to {maxCities} cities. Upgrade to premium for unlimited cities.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="mt-2 w-full bg-orange-600 hover:bg-orange-700 text-white"
            asChild
          >
            <Link href="/go-premium">
              <Crown className="w-3 h-3 mr-1" />
              Upgrade to Premium
            </Link>
          </Button>
        </div>
      )}

      {/* Search Results Dropdown */}
      {isDropdownOpen && (
        <Card 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-hidden shadow-lg border-2"
        >
          <CardContent className="p-0">
            {isSearching ? (
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Searching cities...
                </span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((city, index) => (
                  <button
                    key={city.id}
                    onClick={() => handleCitySelect(city)}
                    disabled={!canAddMore}
                    className={`
                      w-full text-left p-3 border-b last:border-b-0 transition-colors
                      ${highlightedIndex === index 
                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }
                      ${!canAddMore ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    aria-selected={highlightedIndex === index}
                    role="option"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {city.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {city.countryCode}
                          </Badge>
                          {city.isPopular && (
                            <Badge variant="secondary" className="text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Globe className="w-3 h-3" />
                          <span className="truncate">{city.country}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span className="truncate">
                            {formatTimezoneName(city.timezone)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="p-4 text-center">
                <Globe className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No cities found for &quot;{searchQuery}&quot;
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Try searching for a major city or country name
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* City Counter */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {selectedCitiesCount} of {isPremiumUser ? '∞' : maxCities} cities
        </span>
        {!isPremiumUser && selectedCitiesCount >= Math.floor(maxCities * 0.8) && (
          <Badge variant="outline" className="text-xs">
            <Crown className="w-3 h-3 mr-1" />
            Upgrade for unlimited
          </Badge>
        )}
      </div>
    </div>
  )
}