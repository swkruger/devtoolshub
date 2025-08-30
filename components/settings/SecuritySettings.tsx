'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Smartphone, Monitor, AlertTriangle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface SecuritySettingsProps {
  user: User
  isBackerUser: boolean
}



interface Session {
  id: string
  userAgent: string
  ipAddress: string
  createdAt: string
  lastActive: string
  isCurrent: boolean
}

interface SecurityNotifications {
  loginAlerts: boolean
  newDeviceLogins: boolean
}

export default function SecuritySettings({ user, isBackerUser }: SecuritySettingsProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [isRevokingSession, setIsRevokingSession] = useState<string | null>(null)
  
  const [securityNotifications, setSecurityNotifications] = useState<SecurityNotifications>({
    loginAlerts: true,
    newDeviceLogins: true
  })
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true)



  // Fetch sessions and preferences on component mount
  useEffect(() => {
    fetchSessions()
    fetchNotificationPreferences()
  }, [])

  const fetchSessions = async () => {
    try {
      setIsLoadingSessions(true)
      const response = await fetch('/api/settings/sessions')
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions')
      }

      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
      toast.error('Failed to load sessions')
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setIsRevokingSession(sessionId)
      
      const response = await fetch('/api/settings/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke session')
      }

      toast.success('Session revoked successfully!')
      
      // Refresh sessions list
      await fetchSessions()
    } catch (error) {
      console.error('Session revocation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to revoke session')
    } finally {
      setIsRevokingSession(null)
    }
  }

  const handleClearAllSessions = async () => {
    try {
      setIsRevokingSession('all')
      
      // Revoke all sessions except the current one
      const nonCurrentSessions = sessions.filter(session => !session.isCurrent)
      
      for (const session of nonCurrentSessions) {
        const response = await fetch('/api/settings/sessions', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId: session.id })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to revoke session')
        }
      }

      toast.success('All other sessions revoked successfully!')
      
      // Refresh sessions list
      await fetchSessions()
    } catch (error) {
      console.error('Clear all sessions error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to clear all sessions')
    } finally {
      setIsRevokingSession(null)
    }
  }

  const parseUserAgent = (userAgent: string) => {
    if (!userAgent) return 'Unknown Browser'
    
    // Simple parsing for common browsers
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    if (userAgent.includes('Opera')) return 'Opera'
    
    return 'Unknown Browser'
  }

  const parseDevice = (userAgent: string) => {
    if (!userAgent) return 'Unknown Device'
    
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return 'Mobile Device'
    }
    if (userAgent.includes('Windows')) return 'Windows'
    if (userAgent.includes('Mac')) return 'macOS'
    if (userAgent.includes('Linux')) return 'Linux'
    
    return 'Unknown Device'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    
    return date.toLocaleDateString()
  }

  const fetchNotificationPreferences = async () => {
    try {
      setIsLoadingPreferences(true)
      const response = await fetch('/api/settings/notifications')
      
      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences')
      }

      const data = await response.json()
      setSecurityNotifications({
        loginAlerts: data.preferences.login_alerts,
        newDeviceLogins: data.preferences.new_device_logins
      })
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
      toast.error('Failed to load notification preferences')
    } finally {
      setIsLoadingPreferences(false)
    }
  }

  const handleNotificationToggle = async (key: keyof SecurityNotifications) => {
    try {
      const newValue = !securityNotifications[key]
      
      // Optimistically update UI
      setSecurityNotifications(prev => ({
        ...prev,
        [key]: newValue
      }))

      // Save to database
      const response = await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login_alerts: key === 'loginAlerts' ? newValue : securityNotifications.loginAlerts,
          new_device_logins: key === 'newDeviceLogins' ? newValue : securityNotifications.newDeviceLogins
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update notification preferences')
      }

      toast.success(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${newValue ? 'enabled' : 'disabled'}`)
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      toast.error('Failed to update notification preferences')
      
      // Revert optimistic update
      setSecurityNotifications(prev => ({
        ...prev,
        [key]: !prev[key]
      }))
    }
  }



  return (
    <div className="space-y-6">


      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5" />
            <span>Two-Factor Authentication</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">2FA Status</p>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary">Disabled</Badge>
              <Button variant="outline" size="sm" disabled>
                Enable 2FA
              </Button>
            </div>
          </div>
          <Separator />
          <div className="text-sm text-muted-foreground">
            <p>Two-factor authentication adds an extra layer of security by requiring a verification code in addition to your password.</p>
            <p className="mt-2 text-xs">Coming soon: TOTP-based 2FA with authenticator apps</p>
          </div>
        </CardContent>
      </Card>

             {/* Active Sessions */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center space-x-2">
             <Monitor className="w-5 h-5" />
             <span>Active Sessions</span>
           </CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           {isLoadingSessions ? (
             <div className="flex items-center justify-center py-8">
               <Loader2 className="w-6 h-6 animate-spin" />
               <span className="ml-2">Loading sessions...</span>
             </div>
           ) : sessions.length === 0 ? (
             <div className="text-center py-8">
               <p className="text-muted-foreground">No active sessions found</p>
             </div>
           ) : (
             <>
               <div className="space-y-3">
                 {sessions.map((session) => (
                   <div 
                     key={session.id} 
                     className={`flex items-center justify-between p-3 border rounded-lg ${
                       session.isCurrent ? 'bg-muted/50' : ''
                     }`}
                   >
                     <div className="flex items-center space-x-3">
                       <div className={`w-3 h-3 rounded-full ${
                         session.isCurrent ? 'bg-green-500' : 'bg-blue-500'
                       }`} />
                       <div>
                         <p className="font-medium">
                           {parseDevice(session.userAgent)} • {parseUserAgent(session.userAgent)}
                         </p>
                         <p className="text-sm text-muted-foreground">
                           IP: {session.ipAddress} • {user.email}
                         </p>
                         <p className="text-xs text-muted-foreground">
                           Last active: {formatTimeAgo(session.lastActive)}
                         </p>
                       </div>
                     </div>
                     <div className="flex items-center space-x-2">
                       {session.isCurrent && (
                         <Badge variant="default">Current</Badge>
                       )}
                       {!session.isCurrent && (
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => handleRevokeSession(session.id)}
                           disabled={isRevokingSession === session.id}
                         >
                           {isRevokingSession === session.id ? (
                             <>
                               <Loader2 className="w-3 h-3 animate-spin mr-1" />
                               Revoking...
                             </>
                           ) : (
                             'Revoke'
                           )}
                         </Button>
                       )}
                     </div>
                   </div>
                 ))}
               </div>

                               <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-muted-foreground">
                    {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchSessions}
                      disabled={isLoadingSessions}
                    >
                      Refresh
                    </Button>
                    {sessions.length > 1 && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleClearAllSessions}
                        disabled={isRevokingSession === 'all'}
                      >
                        {isRevokingSession === 'all' ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            Clearing...
                          </>
                        ) : (
                          'Clear All Others'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
             </>
           )}
         </CardContent>
       </Card>

      {/* Security Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Security Notifications</span>
          </CardTitle>
        </CardHeader>
                 <CardContent className="space-y-4">
           {isLoadingPreferences ? (
             <div className="flex items-center justify-center py-8">
               <Loader2 className="w-6 h-6 animate-spin" />
               <span className="ml-2">Loading notification preferences...</span>
             </div>
           ) : (
             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="font-medium">Login Alerts</p>
                   <p className="text-sm text-muted-foreground">
                     Get notified when someone logs into your account
                   </p>
                 </div>
                 <Switch 
                   checked={securityNotifications.loginAlerts}
                   onCheckedChange={() => handleNotificationToggle('loginAlerts')}
                 />
               </div>
               <Separator />
               <div className="flex items-center justify-between">
                 <div>
                   <p className="font-medium">New Device Logins</p>
                   <p className="text-sm text-muted-foreground">
                     Alert when logging in from a new device
                   </p>
                 </div>
                 <Switch 
                   checked={securityNotifications.newDeviceLogins}
                   onCheckedChange={() => handleNotificationToggle('newDeviceLogins')}
                 />
               </div>
             </div>
           )}
          </CardContent>
      </Card>
    </div>
  )
}
