'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User as UserIcon, Camera, Save, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Profile {
  id: string
  email: string
  name: string
  avatar_url?: string
  plan: 'free' | 'premium'
  created_at: string
  updated_at: string
}

interface UserPreferences {
  id: string
  user_id: string
  timezone: string
  theme: 'light' | 'dark' | 'system'
  language: string
  email_notifications: Record<string, boolean>
  developer_preferences: Record<string, any>
  bio?: string
  created_at: string
  updated_at: string
}

interface ProfileFormProps {
  user: User
  profile: Profile | null
  preferences: UserPreferences | null
  isPremiumUser: boolean
}

interface FormData {
  name: string
  bio: string
  timezone: string
  theme: 'light' | 'dark' | 'system'
  language: string
}

interface FormErrors {
  name?: string
  bio?: string
  timezone?: string
  theme?: string
  language?: string
}

export default function ProfileForm({ user, profile, preferences, isPremiumUser }: ProfileFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: profile?.name || '',
    bio: preferences?.bio || '',
    timezone: preferences?.timezone || 'UTC',
    theme: preferences?.theme || 'system',
    language: preferences?.language || 'en'
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Update form data when props change
  useEffect(() => {
    setFormData({
      name: profile?.name || '',
      bio: preferences?.bio || '',
      timezone: preferences?.timezone || 'UTC',
      theme: preferences?.theme || 'system',
      language: preferences?.language || 'en'
    })
  }, [profile, preferences])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters'
    }

    // Bio validation
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters'
    }

    // Timezone validation
    if (!formData.timezone) {
      newErrors.timezone = 'Timezone is required'
    }

    // Theme validation
    if (!['light', 'dark', 'system'].includes(formData.theme)) {
      newErrors.theme = 'Invalid theme selection'
    }

    // Language validation
    if (!formData.language) {
      newErrors.language = 'Language is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setIsLoading(true)
    setIsSuccess(false)

    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: {
            name: formData.name.trim(),
            avatar_url: profile?.avatar_url
          },
          preferences: {
            timezone: formData.timezone,
            theme: formData.theme,
            language: formData.language,
            bio: formData.bio.trim(),
            email_notifications: preferences?.email_notifications || {},
            developer_preferences: preferences?.developer_preferences || {}
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      setIsSuccess(true)
      toast.success('Profile updated successfully!')
      
      // Clear success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000)
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Alert */}
      {isSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Profile updated successfully! Your changes have been saved.
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserIcon className="w-5 h-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url} />
              <AvatarFallback>
                {profile?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button 
                type="button"
                variant="outline" 
                size="sm" 
                className="flex items-center space-x-2"
                disabled
              >
                <Camera className="w-4 h-4" />
                <span>Change Avatar</span>
              </Button>
              <p className="text-sm text-muted-foreground">
                Avatar upload coming soon
              </p>
            </div>
          </div>

          <Separator />

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input 
                id="name" 
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email"
                value={user.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed from this interface
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio" 
              placeholder="Tell us about yourself..."
              rows={3}
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className={errors.bio ? 'border-red-500' : ''}
            />
            {errors.bio && (
              <p className="text-sm text-red-500 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.bio}</span>
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.bio.length}/500 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone *</Label>
              <Select 
                value={formData.timezone} 
                onValueChange={(value) => handleInputChange('timezone', value)}
              >
                <SelectTrigger className={errors.timezone ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                </SelectContent>
              </Select>
              {errors.timezone && (
                <p className="text-sm text-red-500 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.timezone}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme *</Label>
              <Select 
                value={formData.theme} 
                onValueChange={(value) => handleInputChange('theme', value as 'light' | 'dark' | 'system')}
              >
                <SelectTrigger className={errors.theme ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              {errors.theme && (
                <p className="text-sm text-red-500 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.theme}</span>
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language *</Label>
            <Select 
              value={formData.language} 
              onValueChange={(value) => handleInputChange('language', value)}
            >
              <SelectTrigger className={errors.language ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="ko">한국어</SelectItem>
              </SelectContent>
            </Select>
            {errors.language && (
              <p className="text-sm text-red-500 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.language}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          className="flex items-center space-x-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
