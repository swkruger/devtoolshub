'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, Download, AlertTriangle, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface AccountDeletionProps {
  user: User
  isPremiumUser: boolean
}

interface DeletionForm {
  confirmEmail: string
  confirmPassword: string
  deletionReason: string
  confirmDeletion: boolean
  confirmDataLoss: boolean
}

interface DeletionErrors {
  confirmEmail?: string
  confirmPassword?: string
  deletionReason?: string
  confirmDeletion?: string
  confirmDataLoss?: string
}

interface DeletionStatus {
  id: string
  user_id: string
  deletion_requested_at: string
  deletion_scheduled_at: string
  deletion_reason?: string
  data_exported: boolean
  recovery_token: string
  is_cancelled: boolean
  cancelled_at?: string
}

export default function AccountDeletion({ user, isPremiumUser }: AccountDeletionProps) {
  const [deletionForm, setDeletionForm] = useState<DeletionForm>({
    confirmEmail: '',
    confirmPassword: '',
    deletionReason: '',
    confirmDeletion: false,
    confirmDataLoss: false
  })

  const [errors, setErrors] = useState<DeletionErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [deletionStatus, setDeletionStatus] = useState<DeletionStatus | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  // Check for existing deletion request on component mount
  useEffect(() => {
    checkDeletionStatus()
  }, [])

  const checkDeletionStatus = async () => {
    try {
      const response = await fetch('/api/settings/account-deletion')
      const data = await response.json()
      
      if (response.ok && data.deletion) {
        setDeletionStatus(data.deletion)
      }
    } catch (error) {
      console.error('Error checking deletion status:', error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: DeletionErrors = {}

    // Email validation
    if (!deletionForm.confirmEmail) {
      newErrors.confirmEmail = 'Email confirmation is required'
    } else if (deletionForm.confirmEmail !== user.email) {
      newErrors.confirmEmail = 'Email must match your account email'
    }

    // Password validation
    if (!deletionForm.confirmPassword) {
      newErrors.confirmPassword = 'Password confirmation is required'
    }

    // Reason validation (optional but recommended)
    if (deletionForm.deletionReason && deletionForm.deletionReason.length > 1000) {
      newErrors.deletionReason = 'Reason must be less than 1000 characters'
    }

    // Checkbox validations
    if (!deletionForm.confirmDeletion) {
      newErrors.confirmDeletion = 'You must confirm that you understand this action is permanent'
    }

    if (!deletionForm.confirmDataLoss) {
      newErrors.confirmDataLoss = 'You must confirm that you understand you will lose all data'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof DeletionForm, value: string | boolean) => {
    setDeletionForm(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleExportData = async () => {
    setIsExporting(true)
    
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, this would generate and download a JSON file
      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        profile: {
          // Add profile data here
        },
        preferences: {
          // Add preferences data here
        },
        // Add other user data here
        exported_at: new Date().toISOString()
      }
      
      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `devtoolshub-data-${user.id}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Data exported successfully!')
    } catch (error) {
      console.error('Data export error:', error)
      toast.error('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  const handleInitiateDeletion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/settings/account-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'initiate_deletion',
          password: deletionForm.confirmPassword,
          reason: deletionForm.deletionReason || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate account deletion')
      }

      toast.success('Account deletion scheduled successfully! You have 30 days to cancel.')
      
      // Refresh deletion status
      await checkDeletionStatus()
      
      // Clear form
      setDeletionForm({
        confirmEmail: '',
        confirmPassword: '',
        deletionReason: '',
        confirmDeletion: false,
        confirmDataLoss: false
      })
      setErrors({})
    } catch (error) {
      console.error('Account deletion error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to initiate account deletion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelDeletion = async () => {
    setIsCancelling(true)

    try {
      const response = await fetch('/api/settings/account-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel_deletion'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel account deletion')
      }

      toast.success('Account deletion cancelled successfully!')
      setDeletionStatus(null)
    } catch (error) {
      console.error('Cancel deletion error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to cancel account deletion')
    } finally {
      setIsCancelling(false)
    }
  }

  // If there's an active deletion request, show status
  if (deletionStatus && !deletionStatus.is_cancelled) {
    const scheduledDate = new Date(deletionStatus.deletion_scheduled_at)
    const daysLeft = Math.ceil((scheduledDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    
    return (
      <div className="space-y-6">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Account Deletion Scheduled:</strong> Your account will be permanently deleted on{' '}
            {scheduledDate.toLocaleDateString()} ({daysLeft} days remaining).
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-600">
              <Shield className="w-5 h-5" />
              <span>Deletion Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Scheduled Date:</span>
                <span className="text-sm">{scheduledDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Days Remaining:</span>
                <span className="text-sm">{daysLeft}</span>
              </div>
              {deletionStatus.deletion_reason && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Reason:</span>
                  <span className="text-sm text-muted-foreground">{deletionStatus.deletion_reason}</span>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline"
                onClick={handleCancelDeletion}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Deletion'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Export Your Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Before deleting your account, you can export all your data including:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Profile information and preferences</li>
              <li>Saved tool data and history</li>
              <li>Subscription and billing information</li>
              <li>Account activity and security logs</li>
            </ul>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center space-x-2"
            onClick={handleExportData}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export All Data (JSON)</span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Account Deletion Warning */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Warning:</strong> Account deletion is permanent and cannot be undone. 
          All your data, including saved items, preferences, and subscription information will be permanently removed.
        </AlertDescription>
      </Alert>

      {/* Deletion Form */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            <span>Delete Account</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleInitiateDeletion} className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>To delete your account, please confirm the following:</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="confirmEmail">Confirm Email Address *</Label>
                <Input 
                  id="confirmEmail" 
                  type="email"
                  placeholder="Enter your email address to confirm"
                  value={deletionForm.confirmEmail}
                  onChange={(e) => handleInputChange('confirmEmail', e.target.value)}
                  className={errors.confirmEmail ? 'border-red-500' : ''}
                />
                {errors.confirmEmail && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.confirmEmail}</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Type your email address to confirm account deletion
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input 
                  id="confirmPassword" 
                  type="password"
                  placeholder="Enter your password to confirm"
                  value={deletionForm.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter your current password to confirm account deletion
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deletionReason">Reason for Deletion (Optional)</Label>
                <Textarea 
                  id="deletionReason" 
                  placeholder="Please let us know why you're leaving..."
                  rows={3}
                  value={deletionForm.deletionReason}
                  onChange={(e) => handleInputChange('deletionReason', e.target.value)}
                  className={errors.deletionReason ? 'border-red-500' : ''}
                />
                {errors.deletionReason && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.deletionReason}</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Your feedback helps us improve our service
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                     <Checkbox 
                     id="confirmDeletion"
                     checked={deletionForm.confirmDeletion}
                     onCheckedChange={(checked: boolean) => handleInputChange('confirmDeletion', checked)}
                   />
                  <Label htmlFor="confirmDeletion" className="text-sm text-red-800 leading-relaxed">
                    I understand that this action is permanent and cannot be undone. 
                    All my data will be permanently deleted after a 30-day grace period.
                  </Label>
                </div>
                {errors.confirmDeletion && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.confirmDeletion}</span>
                  </p>
                )}

                <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                     <Checkbox 
                     id="confirmDataLoss"
                     checked={deletionForm.confirmDataLoss}
                     onCheckedChange={(checked: boolean) => handleInputChange('confirmDataLoss', checked)}
                   />
                  <Label htmlFor="confirmDataLoss" className="text-sm text-red-800 leading-relaxed">
                    I have exported my data and understand that I will lose access to all my saved items, 
                    preferences, and account information.
                  </Label>
                </div>
                {errors.confirmDataLoss && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.confirmDataLoss}</span>
                  </p>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <p>Account will be permanently deleted after 30 days</p>
                <p>You can cancel deletion during the grace period</p>
              </div>
              <Button 
                type="submit"
                variant="destructive" 
                className="flex items-center space-x-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recovery Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Account Recovery</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>30-Day Grace Period:</strong> After requesting deletion, your account will be marked for deletion but remain accessible for 30 days.</p>
            <p className="mt-2"><strong>Recovery:</strong> You can cancel the deletion request at any time during this period by logging in and clicking &quot;Cancel Deletion&quot;.</p>
            <p className="mt-2"><strong>Permanent Deletion:</strong> After 30 days, your account and all associated data will be permanently removed and cannot be recovered.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
