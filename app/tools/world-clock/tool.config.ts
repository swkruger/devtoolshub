import { Globe } from "lucide-react"

export const toolConfig = {
  id: 'world-clock',
  name: 'World Clock & Time Zones',
  description: 'Compare time zones across cities worldwide with meeting planner, weather data, and business hours visualization',
  shortDescription: 'World clock with meeting planner & weather integration',
  icon: Globe,
  emoji: '🌍',
  isPremium: false,
  category: 'utility' as const,
  tags: ['time', 'timezone', 'clock', 'world', 'meeting', 'weather', 'cities'],
  path: '/tools/world-clock',
  features: {
    free: [
      'Up to 5 city timezones',
      'Real-time clock display with seconds',
      'Time zone conversion and comparison',
      'Date/time scrubbing (±7 days)',
      'Basic meeting time finder',
      'Copy time/date to clipboard',
      'Export timezone list as JSON',
      'Business hours visualization',
      'Keyboard shortcuts and accessibility'
    ],
    premium: [
      'Unlimited cities with collections',
      'Live weather data with current conditions',
      'Advanced meeting planner with business hours',
      'Custom timezone groups and favorites',
      'Extended date range (±30 days)',
      '3-day weather forecasts',
      'Custom business hours per timezone',
      'Calendar export (iCal/Google Calendar)',
      'Sharing capabilities with public links'
    ]
  }
}