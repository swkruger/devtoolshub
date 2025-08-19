'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Lock, Smartphone, Monitor, AlertTriangle, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface SecuritySettingsProps {
  user: User
  isPremiumUser: boolean
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface PasswordErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

interface SecurityNotifications {
  loginAlerts: boolean
  passwordChanges: boolean
  newDeviceLogins: boolean
  suspiciousActivity: boolean
}

export default function SecuritySettings({ user, isPremiumUser }: SecuritySettingsProps) {
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({})
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  const [securityNotifications, setSecurityNotifications] = useState<SecurityNotifications>({
    loginAlerts: true,
    passwordChanges: true,
    newDeviceLogins: true,
    suspiciousActivity: true
  })

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('At least 8 characters')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter')
    }
    if (!/\d/.test(password)) {
      errors.push('One number')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('One special character')
    }
    
    return errors
  }

  const validatePasswordForm = (): boolean => {
    const errors: PasswordErrors = {}

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required'
    } else {
      const passwordErrors = validatePassword(passwordForm.newPassword)
      if (passwordErrors.length > 0) {
        errors.newPassword = `Password must contain: ${passwordErrors.join(', ')}`
      }
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password'
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePasswordForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetch('/api/settings/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'change_password',
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      toast.success('Password changed successfully!')
      
      // Clear form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setPasswordErrors({})
    } catch (error) {
      console.error('Password change error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/settings/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'revoke_session',
          sessionId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke session')
      }

      toast.success('Session revoked successfully!')
    } catch (error) {
      console.error('Session revocation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to revoke session')
    }
  }

  const handleNotificationToggle = (key: keyof SecurityNotifications) => {
    setSecurityNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    
    // In a real app, you would save this to the database
    toast.success(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${!securityNotifications[key] ? 'enabled' : 'disabled'}`)
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Password Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="w-5 h-5" />
            <span>Password</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password *</Label>
                <div className="relative">
                  <Input 
                    id="currentPassword" 
                    type={showPasswords.current ? "text" : "password"}
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className={passwordErrors.currentPassword ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{passwordErrors.currentPassword}</span>
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password *</Label>
                <div className="relative">
                  <Input 
                    id="newPassword" 
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Enter new password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className={passwordErrors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{passwordErrors.newPassword}</span>
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password *</Label>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={passwordErrors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-red-500 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{passwordErrors.confirmPassword}</span>
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Password must be at least 8 characters with uppercase, lowercase, number, and special character
              </div>
              <Button 
                type="submit"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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
          <div className="space-y-3">
            {/* Current Session */}
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-muted-foreground">
                    Chrome on Windows • {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last active: Just now
                  </p>
                </div>
              </div>
              <Badge variant="default">Current</Badge>
            </div>

            {/* Other Sessions */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <div>
                  <p className="font-medium">Mobile Device</p>
                  <p className="text-sm text-muted-foreground">
                    Safari on iPhone • {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last active: 2 hours ago
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleRevokeSession('mobile-session')}
              >
                Revoke
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-400 rounded-full" />
                <div>
                  <p className="font-medium">Work Computer</p>
                  <p className="text-sm text-muted-foreground">
                    Firefox on macOS • {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last active: 1 day ago
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleRevokeSession('work-session')}
              >
                Revoke
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              3 active sessions
            </p>
            <Button variant="outline" size="sm" disabled>
              Revoke All Other Sessions
            </Button>
          </div>
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
                <p className="font-medium">Password Changes</p>
                <p className="text-sm text-muted-foreground">
                  Notify when your password is changed
                </p>
              </div>
              <Switch 
                checked={securityNotifications.passwordChanges}
                onCheckedChange={() => handleNotificationToggle('passwordChanges')}
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
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Suspicious Activity</p>
                <p className="text-sm text-muted-foreground">
                  Get alerts for unusual account activity
                </p>
              </div>
              <Switch 
                checked={securityNotifications.suspiciousActivity}
                onCheckedChange={() => handleNotificationToggle('suspiciousActivity')}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
