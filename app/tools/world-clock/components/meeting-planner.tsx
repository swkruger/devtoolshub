'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { 
  Users, 
  Clock, 
  Calendar, 
  Download, 
  Crown, 
  CheckCircle2,
  AlertCircle,
  Globe,
  Briefcase
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { CityTimezone, MeetingTimeSlot, formatDisplayTime, generateICalEvent } from '../lib/timezone-utils'

interface MeetingPlannerProps {
  cityTimezones: CityTimezone[]
  meetingTimes: MeetingTimeSlot[]
  meetingDuration: number
  onDurationChange: (minutes: number) => void
  onFindMeetingTimes: () => void
  isLoading: boolean
  isPremiumUser: boolean
}

export default function MeetingPlanner({
  cityTimezones,
  meetingTimes,
  meetingDuration,
  onDurationChange,
  onFindMeetingTimes,
  isLoading,
  isPremiumUser
}: MeetingPlannerProps) {
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingTimeSlot | null>(null)
  const [meetingTitle, setMeetingTitle] = useState('Team Meeting')

  const handleDownloadICal = (meeting: MeetingTimeSlot) => {
    const iCalData = generateICalEvent(meeting, meetingDuration, meetingTitle)
    const blob = new Blob([iCalData], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meeting-${format(meeting.utcTime, 'yyyy-MM-dd-HHmm')}.ics`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getMeetingScore = (meeting: MeetingTimeSlot): { score: number; color: string; label: string } => {
    const maxParticipants = cityTimezones.length
    const businessHoursRatio = meeting.businessHoursCount / maxParticipants
    
    if (businessHoursRatio >= 0.8) {
      return { score: meeting.score, color: 'text-green-600 dark:text-green-400', label: 'Excellent' }
    } else if (businessHoursRatio >= 0.6) {
      return { score: meeting.score, color: 'text-yellow-600 dark:text-yellow-400', label: 'Good' }
    } else if (businessHoursRatio >= 0.4) {
      return { score: meeting.score, color: 'text-orange-600 dark:text-orange-400', label: 'Fair' }
    } else {
      return { score: meeting.score, color: 'text-red-600 dark:text-red-400', label: 'Poor' }
    }
  }

  if (!isPremiumUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Meeting Planner
            <Badge variant="outline">
              <Crown className="w-3 h-3 mr-1" />
              Premium Feature
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <Crown className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Premium Feature
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Find optimal meeting times across multiple timezones with business hours consideration
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Smart Scheduling
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-powered meeting time suggestions based on business hours
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                <Download className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Calendar Export
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Export to Google Calendar, Outlook, and iCal formats
                </p>
              </div>
            </div>
            
            <Button size="lg" asChild>
              <Link href="/go-premium">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Meeting Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Meeting Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="meeting-title">Meeting Title</Label>
              <Input
                id="meeting-title"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="Enter meeting title"
              />
            </div>
            
            <div>
              <Label>Duration: {meetingDuration} minutes</Label>
              <Slider
                value={[meetingDuration]}
                onValueChange={(values) => onDurationChange(values[0])}
                min={15}
                max={480}
                step={15}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>15 min</span>
                <span>8 hours</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Finding meetings for {cityTimezones.length} timezone{cityTimezones.length !== 1 ? 's' : ''}
            </div>
            
            <Button 
              onClick={onFindMeetingTimes}
              disabled={isLoading || cityTimezones.length < 2}
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Finding Times...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Find Meeting Times
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Participant Timezones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Participants ({cityTimezones.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cityTimezones.map((tz) => (
              <div
                key={tz.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {tz.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDisplayTime(tz.currentTime, false)} {tz.abbreviation}
                  </p>
                </div>
                {tz.isBusinessHours && (
                  <Badge variant="secondary" className="text-xs">
                    <Briefcase className="w-3 h-3 mr-1" />
                    Business
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Meeting Suggestions */}
      {meetingTimes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Suggested Meeting Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {meetingTimes.slice(0, 10).map((meeting, index) => {
                const { score, color, label } = getMeetingScore(meeting)
                const isSelected = selectedMeeting?.utcTime.getTime() === meeting.utcTime.getTime()
                
                return (
                  <div
                    key={index}
                    className={`
                      p-4 border rounded-lg cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                    onClick={() => setSelectedMeeting(meeting)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {score >= 80 ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : score >= 60 ? (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`font-medium ${color}`}>
                            {label}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {meeting.businessHoursCount}/{cityTimezones.length} business hours
                        </Badge>
                        {meeting.isWeekend && (
                          <Badge variant="outline" className="text-xs">
                            Weekend
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      {format(meeting.utcTime, 'EEEE, MMMM d, yyyy')}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {Object.entries(meeting.localTimes).map(([cityId, localTime]) => {
                        const city = cityTimezones.find(tz => tz.id === cityId)
                        if (!city) return null
                        
                        const hour = localTime.getHours()
                        const isBusinessTime = hour >= 9 && hour < 17 && !meeting.isWeekend
                        
                        return (
                          <div
                            key={cityId}
                            className={`
                              p-2 rounded text-sm
                              ${isBusinessTime 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                              }
                            `}
                          >
                            <div className="font-medium">{city.name}</div>
                            <div className="flex items-center justify-between">
                              <span>{formatDisplayTime(localTime, false)}</span>
                              {isBusinessTime && (
                                <Briefcase className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownloadICal(meeting)
                            }}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download iCal
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigator.clipboard.writeText(
                                `Meeting: ${meetingTitle}\nDate: ${format(meeting.utcTime, 'PPpp')} UTC\nDuration: ${meetingDuration} minutes`
                              )
                            }}
                          >
                            Copy Details
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}