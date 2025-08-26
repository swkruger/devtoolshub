import { NextRequest, NextResponse } from 'next/server'
import { isSearchEngineCrawler, getUserAgent } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const userAgent = getUserAgent(request.headers)
  const isCrawler = isSearchEngineCrawler(userAgent)
  
  return NextResponse.json({
    userAgent,
    isCrawler,
    timestamp: new Date().toISOString(),
    message: isCrawler ? 'Crawler detected' : 'Regular user detected'
  })
}
