import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code') || 'TEST_CODE_123'

  // Force immediate logging with multiple methods
  console.error('🧪🧪🧪 MANUAL OAUTH CALLBACK TEST 🧪🧪🧪')
  console.log('🧪🧪🧪 MANUAL OAUTH CALLBACK TEST LOG 🧪🧪🧪')
  console.warn('🧪🧪🧪 MANUAL OAUTH CALLBACK TEST WARN 🧪🧪🧪')
  
  // Log to stderr as well
  process.stderr.write('🧪🧪🧪 MANUAL OAUTH CALLBACK TEST STDERR 🧪🧪🧪\n')
  
  const logData = {
    timestamp: new Date().toISOString(),
    providedCode: code,
    fullUrl: request.url,
    origin: requestUrl.origin,
    method: request.method,
    headers: {
      host: request.headers.get('host'),
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer')
    }
  }

  console.error('🧪🧪🧪 MANUAL OAUTH CALLBACK TEST DATA 🧪🧪🧪', logData)

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
    origin: requestUrl.origin,
    logData: logData
  })
}
