import { Resend } from 'resend'
import NewUserNotification from '@/components/emails/new-user-notification'
import LoginAlertEmail from '@/components/emails/login-alert'
import NewDeviceAlertEmail from '@/components/emails/new-device-alert'
import { getEmailApplicationName } from '@/lib/app-config'

// Initialize Resend with API key (conditional)
const RESEND_API_KEY = process.env.RESEND_API_KEY
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

// Email configuration - Use the correct domain
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourdomain.com'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL || 'admin@yourdomain.com'

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

export interface LoginData {
  timestamp: string
  ipAddress: string
  userAgent: string
  location?: string
  deviceType: string
  browser: string
}

export const sendNewUserNotification = async (userData: UserData): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if email service is available
    if (!isEmailServiceAvailable()) {
      console.warn('Email service not available - missing RESEND_API_KEY. Skipping email notification.')
      return { success: false, error: 'Email service not configured' }
    }

    // Send notification to admin using verified domain
    const { data, error } = await resend!.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
              subject: `🎉 New User Signup - ${getEmailApplicationName()}`,
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
              subject: `Welcome to ${getEmailApplicationName()}! 🚀`,
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
export async function sendTestEmail(toEmail: string, testType: string) {
  if (!resend || !FROM_EMAIL) return
  await resend.emails.send({
    from: FROM_EMAIL,
    to: [toEmail],
    subject: `🧪 ${getEmailApplicationName()} Email Test`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4f46e5;">🧪 Email Test Successful!</h1>
        <p>This is a test email from ${getEmailApplicationName()} to verify your email configuration.</p>
        <p><strong>Configuration Details:</strong></p>
        <ul>
          <li>From: ${FROM_EMAIL}</li>
          <li>To: ${toEmail}</li>
          <li>Environment: ${process.env.NODE_ENV || 'development'}</li>
          <li>Timestamp: ${new Date().toISOString()}</li>
        </ul>
        <p>If you received this email, your email configuration is working correctly!</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280;">
          This email was sent from ${getEmailApplicationName()} for testing purposes.
        </p>
      </div>
    `,
  })
}

// Security notification functions
export const sendLoginAlert = async (
  userData: Pick<UserData, 'id' | 'email' | 'name' | 'avatar_url'>,
  loginData: LoginData
): Promise<{ success: boolean; error?: string }> => {
  // Convert null to undefined for email components
  const emailUserData = {
    ...userData,
    name: userData.name || undefined,
    avatar_url: userData.avatar_url || undefined
  }
  try {
    // Check if email service is available
    if (!isEmailServiceAvailable()) {
      console.warn('Email service not available - missing RESEND_API_KEY. Skipping login alert.')
      return { success: false, error: 'Email service not configured' }
    }

    // Send login alert email to user
    const { data, error } = await resend!.emails.send({
      from: FROM_EMAIL,
      to: [userData.email],
              subject: `🔐 Welcome Back to ${getEmailApplicationName()}!`,
      react: LoginAlertEmail({ userData: emailUserData, loginData }),
    })

    if (error) {
      console.error('Failed to send login alert:', error)
      return { success: false, error: error.message }
    }

    console.log('Login alert sent successfully:', data?.id)
    return { success: true }
  } catch (error) {
    console.error('Error sending login alert:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export const sendNewDeviceAlert = async (
  userData: Pick<UserData, 'id' | 'email' | 'name' | 'avatar_url'>,
  loginData: LoginData,
  previousLoginData?: LoginData
): Promise<{ success: boolean; error?: string }> => {
  // Convert null to undefined for email components
  const emailUserData = {
    ...userData,
    name: userData.name || undefined,
    avatar_url: userData.avatar_url || undefined
  }
  try {
    // Check if email service is available
    if (!isEmailServiceAvailable()) {
      console.warn('Email service not available - missing RESEND_API_KEY. Skipping new device alert.')
      return { success: false, error: 'Email service not configured' }
    }

    // Send new device alert email to user
    const { data, error } = await resend!.emails.send({
      from: FROM_EMAIL,
      to: [userData.email],
              subject: `⚠️ New Device Login Alert - ${getEmailApplicationName()}`,
      react: NewDeviceAlertEmail({ userData: emailUserData, loginData, previousLoginData }),
    })

    if (error) {
      console.error('Failed to send new device alert:', error)
      return { success: false, error: error.message }
    }

    console.log('New device alert sent successfully:', data?.id)
    return { success: true }
  } catch (error) {
    console.error('Error sending new device alert:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
} 