"use client"

import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth"

interface ProfileSyncWrapperProps {
  children: React.ReactNode
}

export function ProfileSyncWrapper({ children }: ProfileSyncWrapperProps) {
  const [hasCheckedSync, setHasCheckedSync] = useState(false)

  useEffect(() => {
    const syncProfileIfNeeded = async () => {
      try {
        // Check if this might be right after OAuth (look for signs of recent auth)
        const session = await authClient.getSession()
        
        if (session?.user && !hasCheckedSync) {
          console.log('🔍 Dashboard loaded - checking if profile sync needed...')
          
          // Create a unique key for this auth session
          const authSessionKey = `profile_synced_${session.user.id}_${session.user.last_sign_in_at}`
          const alreadySynced = localStorage.getItem(authSessionKey)
          
          if (alreadySynced) {
            console.log('✅ Profile already synced for this session - skipping')
            setHasCheckedSync(true)
            return
          }
          
          // Check if this user's authentication is recent
          const isRecentAuth = session.user.last_sign_in_at && 
            new Date(session.user.last_sign_in_at).getTime() > Date.now() - (5 * 60 * 1000) // 5 minutes

          if (isRecentAuth) {
            console.log('🔄 Recent authentication detected - syncing profile...')
            
            try {
              const result = await authClient.syncUserProfile()
              if (result) {
                console.log('✅ Profile sync completed - marking as synced and refreshing...')
                
                // Mark this session as synced to prevent infinite loops
                localStorage.setItem(authSessionKey, 'true')
                
                // Refresh the page to show updated profile
                window.location.reload()
              } else {
                console.log('❌ Profile sync returned no result - skipping refresh')
                setHasCheckedSync(true)
              }
            } catch (error) {
              console.error('❌ Profile sync failed:', error)
              setHasCheckedSync(true)
            }
          } else {
            console.log('✅ No recent auth detected - skipping profile sync')
            setHasCheckedSync(true)
          }
        }
      } catch (error) {
        console.error('🚨 Error checking profile sync:', error)
        setHasCheckedSync(true)
      }
    }

    // Small delay to ensure auth state is settled
    const timeout = setTimeout(syncProfileIfNeeded, 100)
    
    return () => clearTimeout(timeout)
  }, [hasCheckedSync])

  // Clean up old sync markers (older than 1 hour) to prevent localStorage bloat
  useEffect(() => {
    const cleanupOldSyncMarkers = () => {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('profile_synced_')) {
          // Extract timestamp from key and check if older than 1 hour
          const parts = key.split('_')
          if (parts.length >= 3) {
            const timestamp = parts[parts.length - 1]
            const authTime = new Date(timestamp).getTime()
            if (Date.now() - authTime > 60 * 60 * 1000) { // 1 hour
              localStorage.removeItem(key)
            }
          }
        }
      })
    }
    
    cleanupOldSyncMarkers()
  }, [])

  return <>{children}</>
} 