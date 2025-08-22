import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)

  // Test if we can access Supabase environment variables
  const supabaseConfig = {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
    anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length
  }

  // Expected callback URLs
  const expectedCallbacks = [
    'https://www.devtoolskithub.com/auth/callback',
    `https://${process.env.VERCEL_URL}/auth/callback`,
    `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/auth/callback`
  ]

  // Current environment info
  const environmentInfo = {
    origin: requestUrl.origin,
    hostname: requestUrl.hostname,
    protocol: requestUrl.protocol,
    vercelUrl: process.env.VERCEL_URL,
    nextPublicVercelUrl: process.env.NEXT_PUBLIC_VERCEL_URL,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: environmentInfo,
    supabase: supabaseConfig,
    expectedCallbacks: expectedCallbacks,
    currentUrl: request.url,
    recommendations: [
      {
        issue: 'Custom Domain OAuth',
        status: 'Check Supabase Dashboard',
        action: 'Ensure OAuth callback URLs in Supabase include: https://www.devtoolskithub.com/auth/callback'
      },
      {
        issue: 'Environment Variables',
        status: supabaseConfig.hasUrl && supabaseConfig.hasAnonKey ? 'OK' : 'MISSING',
        action: 'Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel'
      },
      {
        issue: 'Domain Mismatch',
        status: requestUrl.origin.includes('devtoolskithub.com') ? 'Custom Domain' : 'Vercel Domain',
        action: requestUrl.origin.includes('devtoolskithub.com') ?
          'Using custom domain - ensure Supabase is configured for this' :
          'Using Vercel domain - OAuth should work with current config'
      }
    ]
  })
}
