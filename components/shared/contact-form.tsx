'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, Shield } from 'lucide-react'
import { toast } from 'sonner'

// Global Turnstile state
let turnstileLoaded = false
let turnstileLoading = false

interface ContactFormProps {
  type: 'support' | 'feedback'
  onSubmit: (data: FormData) => Promise<{ success: boolean; error?: string }>
}

interface FormData {
  name: string
  email: string
  subject?: string
  message: string
  priority?: 'low' | 'medium' | 'high'
  category?: 'bug' | 'feature' | 'general' | 'other'
  rating?: number
  honeypot?: string
  turnstileToken?: string
}

export function ContactForm({ type, onSubmit }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitCount, setSubmitCount] = useState(0)
  const [lastSubmitTime, setLastSubmitTime] = useState(0)
  const [turnstileToken, setTurnstileToken] = useState<string>('')
  const [turnstileReady, setTurnstileReady] = useState(false)
  const [turnstileError, setTurnstileError] = useState<string>('')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general',
    rating: 5,
    honeypot: ''
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const formRef = useRef<HTMLFormElement>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)
  const turnstileRef = useRef<HTMLDivElement>(null)

  // Rate limiting: max 3 submissions per hour
  const RATE_LIMIT = 3
  const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds

  // Cooldown period between submissions (5 minutes)
  const COOLDOWN_PERIOD = 5 * 60 * 1000 // 5 minutes in milliseconds

  // Load Turnstile script
  useEffect(() => {
    const loadTurnstile = async () => {
      if (turnstileLoaded) {
        setTurnstileReady(true)
        return
      }

      if (turnstileLoading) {
        // Wait for existing loading to complete
        const checkLoaded = () => {
          if (turnstileLoaded) {
            setTurnstileReady(true)
          } else {
            setTimeout(checkLoaded, 100)
          }
        }
        checkLoaded()
        return
      }

      turnstileLoading = true
      setTurnstileError('')

      try {
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="turnstile"]')
        if (existingScript) {
          // Script exists, wait for it to load
          existingScript.addEventListener('load', () => {
            turnstileLoaded = true
            setTurnstileReady(true)
          })
          return
        }

        // Load script
        const script = document.createElement('script')
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
        script.async = true
        script.defer = true
        
        script.onload = () => {
          turnstileLoaded = true
          turnstileLoading = false
          setTurnstileReady(true)
        }
        
        script.onerror = () => {
          turnstileLoading = false
          setTurnstileError('Failed to load security check. Please refresh the page.')
        }

        document.head.appendChild(script)
      } catch (error) {
        turnstileLoading = false
        setTurnstileError('Failed to load security check. Please refresh the page.')
        console.error('Turnstile script loading error:', error)
      }
    }

    loadTurnstile()
  }, [])

  // Initialize Turnstile widget
  useEffect(() => {
    if (!turnstileReady || !turnstileRef.current) return

    const initializeWidget = () => {
      const turnstile = (window as any).turnstile
      if (!turnstile) {
        setTimeout(initializeWidget, 100)
        return
      }

      try {
        // Clear container and any existing widgets
        turnstileRef.current!.innerHTML = ''
        
        // Remove any existing Turnstile widgets from this container
        const existingWidgets = turnstileRef.current!.querySelectorAll('[data-turnstile-widget-id]')
        existingWidgets.forEach(widget => widget.remove())
        
        // Render widget with unique ID
        const widgetId = `turnstile-${type}-${Math.random().toString(36).substr(2, 9)}`
        
        turnstile.render(turnstileRef.current!, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
          theme: 'light',
          'data-widget-id': widgetId,
          callback: (token: string) => {
            setTurnstileToken(token)
            setTurnstileError('')
          },
          'expired-callback': () => {
            setTurnstileToken('')
            setTurnstileError('Security check expired. Please try again.')
          },
          'error-callback': () => {
            setTurnstileToken('')
            setTurnstileError('Security check failed. Please try again.')
          }
        })
      } catch (error) {
        console.error('Turnstile widget initialization error:', error)
        setTurnstileError('Failed to initialize security check. Please refresh the page.')
      }
    }

    // Small delay to ensure DOM is ready
    setTimeout(initializeWidget, 100)

    // Cleanup function
    return () => {
      // Clean up any existing widgets when component unmounts
      if (turnstileRef.current) {
        const existingWidgets = turnstileRef.current.querySelectorAll('[data-turnstile-widget-id]')
        existingWidgets.forEach(widget => widget.remove())
      }
    }
  }, [turnstileReady, type])

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }

    if (type === 'support' && !formData.subject?.trim()) {
      newErrors.subject = 'Subject is required'
    }

    // Honeypot validation (should be empty)
    if (formData.honeypot) {
      newErrors.honeypot = 'Invalid submission'
    }

    // Turnstile validation
    if (!turnstileToken) {
      newErrors.turnstileToken = 'Please complete the security check'
    }

    // Rate limiting validation
    const now = Date.now()
    if (submitCount >= RATE_LIMIT && (now - lastSubmitTime) < RATE_LIMIT_WINDOW) {
      newErrors.message = `Too many submissions. Please wait before submitting again.`
    }

    // Cooldown validation
    if (lastSubmitTime && (now - lastSubmitTime) < COOLDOWN_PERIOD) {
      newErrors.message = `Please wait 5 minutes between submissions.`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Add turnstile token to form data
      const submissionData = {
        ...formData,
        turnstileToken
      }

      const result = await onSubmit(submissionData)

      if (result.success) {
        toast.success(
          type === 'support' 
            ? 'Support request sent successfully! We\'ll get back to you soon.' 
            : 'Feedback submitted successfully! Thank you for your input.'
        )
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          priority: 'medium',
          category: 'general',
          rating: 5,
          honeypot: ''
        })
        
        // Reset turnstile
        setTurnstileToken('')
        if (turnstileRef.current) {
          try {
            const turnstile = (window as any).turnstile
            if (turnstile) {
              turnstile.reset(turnstileRef.current)
            }
          } catch (error) {
            console.error('Turnstile reset error:', error)
          }
        }
        
        // Update rate limiting
        setSubmitCount(prev => prev + 1)
        setLastSubmitTime(Date.now())
        
        // Reset form ref
        if (formRef.current) {
          formRef.current.reset()
        }
      } else {
        toast.error(result.error || 'Failed to submit. Please try again.')
        // Reset turnstile on error
        setTurnstileToken('')
        if (turnstileRef.current) {
          try {
            const turnstile = (window as any).turnstile
            if (turnstile) {
              turnstile.reset(turnstileRef.current)
            }
          } catch (error) {
            console.error('Turnstile reset error:', error)
          }
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.')
      console.error('Form submission error:', error)
      // Reset turnstile on error
      setTurnstileToken('')
      if (turnstileRef.current) {
        try {
          const turnstile = (window as any).turnstile
          if (turnstile) {
            turnstile.reset(turnstileRef.current)
          }
        } catch (error) {
          console.error('Turnstile reset error:', error)
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Auto-hide honeypot field
  useEffect(() => {
    if (honeypotRef.current) {
      honeypotRef.current.style.display = 'none'
    }
  }, [])

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot field for spam detection */}
      <input
        ref={honeypotRef}
        type="text"
        name="website"
        value={formData.honeypot}
        onChange={(e) => handleInputChange('honeypot', e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Your name"
            disabled={isSubmitting}
            className={`${errors.name ? 'border-red-500' : ''} text-gray-900 dark:text-gray-100`}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your.email@example.com"
            disabled={isSubmitting}
            className={`${errors.email ? 'border-red-500' : ''} text-gray-900 dark:text-gray-100`}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      {type === 'support' && (
        <div>
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            type="text"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            placeholder="Brief description of your issue"
            disabled={isSubmitting}
            className={`${errors.subject ? 'border-red-500' : ''} text-gray-900 dark:text-gray-100`}
          />
          {errors.subject && (
            <p className="text-sm text-red-500 mt-1">{errors.subject}</p>
          )}
        </div>
      )}

      {type === 'feedback' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="general">General Feedback</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="rating">Rating</Label>
            <Select
              value={formData.rating?.toString()}
              onValueChange={(value) => handleInputChange('rating', parseInt(value))}
              disabled={isSubmitting}
            >
              <SelectTrigger className="text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ Very Good</SelectItem>
                <SelectItem value="3">⭐⭐⭐ Good</SelectItem>
                <SelectItem value="2">⭐⭐ Fair</SelectItem>
                <SelectItem value="1">⭐ Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {type === 'support' && (
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleInputChange('priority', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger className="text-gray-900 dark:text-gray-100">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low - General question</SelectItem>
              <SelectItem value="medium">Medium - Minor issue</SelectItem>
              <SelectItem value="high">High - Critical issue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          placeholder={
            type === 'support' 
              ? 'Please describe your issue in detail...' 
              : 'Share your feedback with us...'
          }
          rows={6}
          disabled={isSubmitting}
          className={`${errors.message ? 'border-red-500' : ''} text-gray-900 dark:text-gray-100`}
        />
        {errors.message && (
          <p className="text-sm text-red-500 mt-1">{errors.message}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          {formData.message.length}/1000 characters
        </p>
      </div>

      {/* Turnstile CAPTCHA */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Security Check *
        </Label>
                 <div 
           ref={turnstileRef} 
           className="flex justify-center"
         >
          {!turnstileReady && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading security check...
            </div>
          )}
          {turnstileError && (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />
              {turnstileError}
            </div>
          )}
        </div>
        {errors.turnstileToken && (
          <p className="text-sm text-red-500 mt-1">{errors.turnstileToken}</p>
        )}
        <p className="text-xs text-gray-500">
          This helps us protect against automated spam and abuse.
        </p>
      </div>

      {/* Rate limiting warning */}
      {submitCount > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have submitted {submitCount}/{RATE_LIMIT} forms in the last hour.
            {submitCount >= RATE_LIMIT && ' Please wait before submitting again.'}
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || submitCount >= RATE_LIMIT || !turnstileToken}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            {type === 'support' ? 'Send Support Request' : 'Submit Feedback'}
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        By submitting this form, you agree to our privacy policy and terms of service.
      </p>
    </form>
  )
}
