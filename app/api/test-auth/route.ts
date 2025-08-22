import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)

  const debugInfo = {
    timestamp: new Date().toISOString(),
    url: request.url,
    origin: requestUrl.origin,
    hostname: requestUrl.hostname,
    protocol: requestUrl.protocol,
    port: requestUrl.port,
    pathname: requestUrl.pathname,
    search: requestUrl.search,
    headers: {
      host: request.headers.get('host'),
      'user-agent': request.headers.get('user-agent'),
      'x-forwarded-host': request.headers.get('x-forwarded-host'),
      'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
      'x-forwarded-for': request.headers.get('x-forwarded-for'),
      'cf-ray': request.headers.get('cf-ray'),
      'cf-connecting-ip': request.headers.get('cf-connecting-ip')
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_REGION: process.env.VERCEL_REGION,
      NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL
    },
    calculatedUrls: {
      directOrigin: `${requestUrl.protocol}//${requestUrl.hostname}${requestUrl.port ? ':' + requestUrl.port : ''}`,
      vercelBased: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      forwardedHost: request.headers.get('x-forwarded-host') ?
        `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('x-forwarded-host')}` : null
    }
  }

  return NextResponse.json(debugInfo, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
