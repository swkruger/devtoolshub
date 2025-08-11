"use client"

import { useState, useEffect } from "react"
import { format, parseISO, isValid, startOfDay, endOfDay } from "date-fns"
import { Calendar, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"

interface DatePickerProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
}

export function DatePicker({
  selectedDate,
  onDateChange,
  disabled = false,
  minDate,
  maxDate,
  className = ""
}: DatePickerProps) {
  const [inputValue, setInputValue] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()
  const showSuccess = (title: string, description?: string) => toast({ type: 'success', title, description })
  const showWarning = (title: string, description?: string) => toast({ type: 'warning', title, description })

  // Update input value when selectedDate changes
  useEffect(() => {
    if (!isEditing) {
      setInputValue(format(selectedDate, 'yyyy-MM-dd'))
    }
  }, [selectedDate, isEditing])

  const handleInputChange = (value: string) => {
    setInputValue(value)
  }

  const handleInputBlur = () => {
    setIsEditing(false)
    
    if (!inputValue.trim()) {
      setInputValue(format(selectedDate, 'yyyy-MM-dd'))
      return
    }

    try {
      const parsedDate = parseISO(inputValue + 'T12:00:00') // Set to noon to avoid timezone issues
      
      if (!isValid(parsedDate)) {
        showWarning('Invalid Date', 'Please enter a valid date in YYYY-MM-DD format')
        setInputValue(format(selectedDate, 'yyyy-MM-dd'))
        return
      }

      // Check date bounds
      if (minDate && parsedDate < startOfDay(minDate)) {
        showWarning('Date Too Early', `Date cannot be earlier than ${format(minDate, 'MMM d, yyyy')}`)
        setInputValue(format(selectedDate, 'yyyy-MM-dd'))
        return
      }

      if (maxDate && parsedDate > endOfDay(maxDate)) {
        showWarning('Date Too Late', `Date cannot be later than ${format(maxDate, 'MMM d, yyyy')}`)
        setInputValue(format(selectedDate, 'yyyy-MM-dd'))
        return
      }

      onDateChange(parsedDate)
      showSuccess('Date Updated', `Changed to ${format(parsedDate, 'EEEE, MMMM d, yyyy')}`)
    } catch (error) {
      showWarning('Invalid Date', 'Please enter a valid date in YYYY-MM-DD format')
      setInputValue(format(selectedDate, 'yyyy-MM-dd'))
    }
  }

  const handleInputFocus = () => {
    setIsEditing(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setInputValue(format(selectedDate, 'yyyy-MM-dd'))
    }
  }

  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate)
    previousDay.setDate(previousDay.getDate() - 1)
    
    if (minDate && previousDay < startOfDay(minDate)) {
      showWarning('Cannot Go Earlier', `Minimum date is ${format(minDate, 'MMM d, yyyy')}`)
      return
    }
    
    onDateChange(previousDay)
  }

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate)
    nextDay.setDate(nextDay.getDate() + 1)
    
    if (maxDate && nextDay > endOfDay(maxDate)) {
      showWarning('Cannot Go Later', `Maximum date is ${format(maxDate, 'MMM d, yyyy')}`)
      return
    }
    
    onDateChange(nextDay)
  }

  const goToToday = () => {
    const today = new Date()
    onDateChange(today)
    showSuccess('Returned to Today', format(today, 'EEEE, MMMM d, yyyy'))
  }

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Compare Timezones for Date
          </Label>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousDay}
              disabled={disabled || (minDate && selectedDate <= startOfDay(minDate))}
              className="px-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex-1">
              <Input
                type="date"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={handleInputBlur}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className="text-center font-mono"
                min={minDate ? format(minDate, 'yyyy-MM-dd') : undefined}
                max={maxDate ? format(maxDate, 'yyyy-MM-dd') : undefined}
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextDay}
              disabled={disabled || (maxDate && selectedDate >= endOfDay(maxDate))}
              className="px-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              {isToday && (
                <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
            </div>
            
            {!isToday && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                disabled={disabled}
                className="text-xs h-auto py-1 px-2"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Today
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
