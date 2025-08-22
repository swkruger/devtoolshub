import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code') || 'TEST_CODE_123'

  console.error('🧪🧪🧪 MANUAL OAUTH CALLBACK TEST 🧪🧪🧪', {
    timestamp: new Date().toISOString(),
    providedCode: code,
    fullUrl: request.url,
    origin: requestUrl.origin
  })

  // Simulate what happens in the actual OAuth callback
  const redirectUrl = `${requestUrl.origin}/dashboard`

  console.error('🧪🧪🧪 MANUAL TEST REDIRECT 🧪🧪🧪', {
    redirectUrl,
    code,
    origin: requestUrl.origin
  })

  return NextResponse.json({
    message: 'Manual OAuth callback test completed',
    timestamp: new Date().toISOString(),
    code: code,
    redirectUrl: redirectUrl,
    origin: requestUrl.origin
  })
}
