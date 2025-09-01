import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getEmailApplicationName } from '@/lib/app-config'

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMIT = 3 // max submissions per window
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds
const COOLDOWN_PERIOD = 5 * 60 * 1000 // 5 minutes between submissions

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         request.ip ||
         'unknown'
}

// Helper function to check rate limiting
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitStore.get(ip)

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT - 1, resetTime: now + RATE_LIMIT_WINDOW }
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }

  // Increment count
  record.count++
  rateLimitStore.set(ip, record)
  return { allowed: true, remaining: RATE_LIMIT - record.count, resetTime: record.resetTime }
}

// Helper function to validate email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper function to sanitize input
function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

// Helper function to get rating stars
function getRatingStars(rating: number): string {
  return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
}

// Helper function to get category color
function getCategoryColor(category: string): string {
  switch (category) {
    case 'bug': return 'background: #fef2f2; color: #dc2626;'
    case 'feature': return 'background: #f0fdf4; color: #16a34a;'
    case 'general': return 'background: #eff6ff; color: #2563eb;'
    default: return 'background: #f9fafb; color: #6b7280;'
  }
}

// Helper function to verify Turnstile token
async function verifyTurnstileToken(token: string, clientIP: string): Promise<boolean> {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: clientIP,
      }),
    })

    const result = await response.json()
    return result.success === true
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    
    // Check rate limiting
    const rateLimit = checkRateLimit(clientIP)
    if (!rateLimit.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded. Please wait before submitting again.',
        resetTime: rateLimit.resetTime
      }, { status: 429 })
    }

    // Parse request body
    const body = await request.json()
    const { name, email, category, message, rating, honeypot, turnstileToken } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Honeypot validation (should be empty)
    if (honeypot) {
      console.log('Honeypot triggered for IP:', clientIP)
      return NextResponse.json({
        success: false,
        error: 'Invalid submission'
      }, { status: 400 })
    }

    // Turnstile validation
    if (!turnstileToken) {
      return NextResponse.json({
        success: false,
        error: 'Security check required'
      }, { status: 400 })
    }

    // Verify Turnstile token
    const isTurnstileValid = await verifyTurnstileToken(turnstileToken, clientIP)
    if (!isTurnstileValid) {
      console.log('Turnstile verification failed for IP:', clientIP)
      return NextResponse.json({
        success: false,
        error: 'Security check failed. Please try again.'
      }, { status: 400 })
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name)
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedCategory = sanitizeInput(category || 'general')
    const sanitizedMessage = sanitizeInput(message)
    const sanitizedRating = Math.max(1, Math.min(5, parseInt(rating) || 5))

    // Validate input lengths
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      return NextResponse.json({
        success: false,
        error: 'Name must be between 2 and 100 characters'
      }, { status: 400 })
    }

    if (sanitizedMessage.length < 10 || sanitizedMessage.length > 2000) {
      return NextResponse.json({
        success: false,
        error: 'Message must be between 10 and 2000 characters'
      }, { status: 400 })
    }

    // Check if email service is configured
    if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) {
      console.error('Email service not configured')
      return NextResponse.json({
        success: false,
        error: 'Email service not configured'
      }, { status: 500 })
    }

    // Send email to admin
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [process.env.FROM_EMAIL], // Send to admin email
      subject: `[Feedback] ${sanitizedCategory.charAt(0).toUpperCase() + sanitizedCategory.slice(1)} - ${getRatingStars(sanitizedRating)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            💬 New Feedback Received
          </h1>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #111827; margin-top: 0;">Feedback Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">From:</td>
                <td style="padding: 8px 0; color: #111827;">${sanitizedName} (${sanitizedEmail})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Category:</td>
                <td style="padding: 8px 0; color: #111827;">
                  <span style="
                    padding: 4px 8px; 
                    border-radius: 4px; 
                    font-size: 12px; 
                    font-weight: bold;
                    ${getCategoryColor(sanitizedCategory)}
                  ">
                    ${sanitizedCategory.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Rating:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 18px;">
                  ${getRatingStars(sanitizedRating)} (${sanitizedRating}/5)
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Date:</td>
                <td style="padding: 8px 0; color: #111827;">${new Date().toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">IP Address:</td>
                <td style="padding: 8px 0; color: #111827;">${clientIP}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #111827; margin-top: 0;">Feedback Message</h3>
            <p style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${sanitizedMessage}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #6b7280; font-size: 14px;">
              This feedback was submitted through the {getEmailApplicationName()} feedback form.
            </p>
            <p style="color: #6b7280; font-size: 12px;">
              Rate limit: ${rateLimit.remaining} submissions remaining for this IP.
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Failed to send feedback email:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to send feedback'
      }, { status: 500 })
    }

    console.log('Feedback sent successfully:', data?.id)

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      rateLimit: {
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime
      }
    })

  } catch (error) {
    console.error('Feedback form submission error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
