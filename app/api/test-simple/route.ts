import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Multiple logging methods to ensure visibility
  console.error('🔥🔥🔥 SIMPLE TEST ROUTE HIT 🔥🔥🔥')
  console.log('🔥🔥🔥 SIMPLE TEST ROUTE LOG 🔥🔥🔥')
  console.warn('🔥🔥🔥 SIMPLE TEST ROUTE WARN 🔥🔥🔥')
  
  // Direct stderr write
  process.stderr.write('🔥🔥🔥 SIMPLE TEST ROUTE STDERR 🔥🔥🔥\n')
  
  // Force flush
  if (process.stdout && process.stdout.write) {
    process.stdout.write('🔥🔥🔥 SIMPLE TEST ROUTE STDOUT 🔥🔥🔥\n')
  }

  return NextResponse.json({
    message: 'Simple test route hit successfully',
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method,
    headers: {
      host: request.headers.get('host'),
      userAgent: request.headers.get('user-agent')
    }
  })
}
