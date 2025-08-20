'use client'

import { useSessionTracking } from '@/lib/useSessionTracking'
import { useUser } from '@/lib/useUser'

export default function SessionTracker() {
  const { user, loading } = useUser()
  
  // Track user sessions only when user is loaded and authenticated
  useSessionTracking(loading ? null : user)
  
  // This component doesn't render anything
  return null
}
