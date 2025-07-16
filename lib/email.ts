import { Resend } from 'resend'
import NewUserNotification from '@/components/emails/new-user-notification'

// Initialize Resend with API key (conditional)
const RESEND_API_KEY = process.env.RESEND_API_KEY
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

// Email configuration - Use Resend's testing domain for development
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'

// Helper function to check if email service is available
const isEmailServiceAvailable = (): boolean => {
  return !!resend && !!RESEND_API_KEY
}

export interface UserData {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  signup_method: 'google' | 'github'
  created_at: string
}

export const sendNewUserNotification = async (userData: UserData): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if email service is available
    if (!isEmailServiceAvailable()) {
      console.warn('Email service not available - missing RESEND_API_KEY. Skipping email notification.')
      return { success: false, error: 'Email service not configured' }
    }

    // For testing, send to the user's own email instead of devtoolshub8@gmail.com
    const adminEmail = process.env.NODE_ENV === 'development' ? userData.email : 'devtoolshub8@gmail.com'

    // Send notification to admin (or user's email in development)
    const { data, error } = await resend!.emails.send({
      from: FROM_EMAIL,
      to: [adminEmail],
      subject: '🎉 New User Signup - DevToolsHub',
      react: NewUserNotification({ userData }),
    })

    if (error) {
      console.error('Failed to send new user notification:', error)
      return { success: false, error: error.message }
    }

    console.log('New user notification sent successfully:', data?.id)
    return { success: true }
  } catch (error) {
    console.error('Error sending new user notification:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export const sendWelcomeEmail = async (userData: UserData): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if email service is available
    if (!isEmailServiceAvailable()) {
      console.warn('Email service not available - missing RESEND_API_KEY. Skipping welcome email.')
      return { success: false, error: 'Email service not configured' }
    }

    // Send welcome email to new user
    const { data, error } = await resend!.emails.send({
      from: FROM_EMAIL,
      to: [userData.email],
      subject: 'Welcome to DevToolsHub! 🚀',
      react: NewUserNotification({ userData, isWelcomeEmail: true }),
    })

    if (error) {
      console.error('Failed to send welcome email:', error)
      return { success: false, error: error.message }
    }

    console.log('Welcome email sent successfully:', data?.id)
    return { success: true }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Test email function for verification
export const sendTestEmail = async (testUserEmail?: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if email service is available
    if (!isEmailServiceAvailable()) {
      console.warn('Email service not available - missing RESEND_API_KEY. Skipping test email.')
      return { success: false, error: 'Email service not configured' }
    }

    // Use provided email or default to a safe testing email
    const toEmail = testUserEmail || 'kruger.sw@gmail.com'

    const { data, error } = await resend!.emails.send({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: '🧪 DevToolsHub Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4f46e5;">🧪 Email Test Successful!</h1>
          <p>This is a test email from DevToolsHub to verify your email configuration.</p>
          <p><strong>Configuration Details:</strong></p>
          <ul>
            <li>From: ${FROM_EMAIL}</li>
            <li>To: ${toEmail}</li>
            <li>Environment: ${process.env.NODE_ENV || 'development'}</li>
            <li>Timestamp: ${new Date().toISOString()}</li>
          </ul>
          <p>If you're seeing this email, your Resend integration is working correctly! 🎉</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            This email was sent from DevToolsHub for testing purposes.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Failed to send test email:', error)
      return { success: false, error: error.message }
    }

    console.log('Test email sent successfully:', data?.id)
    return { success: true }
  } catch (error) {
    console.error('Error sending test email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
} 