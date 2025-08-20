import { useEffect } from 'react'
import { User } from '@supabase/supabase-js'

export function useSessionTracking(user: User | null) {
  useEffect(() => {
    if (!user) return

      const trackSession = async () => {
    try {
      // Get user agent and IP
      const userAgent = navigator.userAgent
      
      // Create a consistent session ID based on user ID and browser fingerprint
      const sessionId = `${user.id}-${btoa(userAgent).slice(0, 16)}`
      
      // Try to get IP address (this is a simplified approach)
      let ipAddress = 'Unknown IP'
      try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        ipAddress = data.ip
      } catch (error) {
        console.log('Could not fetch IP address')
      }

      // Send session data to our API
      await fetch('/api/settings/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userAgent,
          ipAddress
        })
      })
    } catch (error) {
      console.error('Error tracking session:', error)
    }
  }

    // Track session on mount
    trackSession()

    // Set up periodic session updates (every 15 minutes instead of 5 to reduce API calls)
    const interval = setInterval(trackSession, 15 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user])
}
