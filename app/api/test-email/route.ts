import { NextRequest, NextResponse } from 'next/server'
import { sendTestEmail, sendNewUserNotification, type UserData } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testType = searchParams.get('type') || 'test'
    const userEmail = searchParams.get('email') || 'contactme@devtoolskithub.com' // Default to admin email

    console.log(`🧪 Testing email service - type: ${testType}, email: ${userEmail}`)

    if (testType === 'new-user') {
      // Test new user notification
      const mockUserData: UserData = {
        id: 'test-user-123',
        email: userEmail, // Use the provided or default email
        name: 'Test User',
        avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
        signup_method: 'github',
        created_at: new Date().toISOString(),
      }

      const result = await sendNewUserNotification(mockUserData)
      
      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          message: `New user notification test email sent successfully to ${userEmail}!`,
          type: 'new-user',
          sentTo: userEmail
        })
      } else {
        return NextResponse.json({ 
          success: false, 
          error: result.error,
          type: 'new-user'
        }, { status: 400 })
      }
    } else {
      // Test basic email
      const result = await sendTestEmail(userEmail)
      
      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          message: `Test email sent successfully to ${userEmail}!`,
          type: 'test',
          sentTo: userEmail
        })
      } else {
        return NextResponse.json({ 
          success: false, 
          error: result.error,
          type: 'test'
        }, { status: 400 })
      }
    }
  } catch (error) {
    console.error('🚨 Test email error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
} 