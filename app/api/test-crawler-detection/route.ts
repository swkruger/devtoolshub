import { NextRequest, NextResponse } from 'next/server'
import { isSearchEngineCrawler, getUserAgent } from '@/lib/utils'

// Debug function to see exactly what's matching
function debugCrawlerDetection(userAgent: string) {
  if (!userAgent) return { isCrawler: false, matches: [] }
  
  const ua = userAgent.toLowerCase()
  const matches: string[] = []
  
  // Specific crawler patterns
  const crawlerPatterns = [
    'googlebot',
    'google-bot',
    'adsbot-google',
    'apis-google',
    'mediapartners-google',
    'bingbot',
    'msnbot',
    'yahoo slurp',
    'yahooseeker',
    'duckduckbot',
    'facebookexternalhit',
    'facebookcatalog',
    'twitterbot',
    'linkedinbot',
    'pinterest',
    'yandex',
    'baiduspider',
    'ahrefs',
    'semrush',
    'mozbot',
    'screaming frog',
    'whatsapp',
    'telegram',
    'discord',
    'slack',
  ]
  
  // Check for specific crawler patterns
  for (const pattern of crawlerPatterns) {
    if (ua.includes(pattern)) {
      matches.push(`Specific pattern: "${pattern}"`)
    }
  }
  
  // Check for generic bot patterns
  const genericBotPatterns = [
    /\b(?:bot|crawler|spider|scraper)\b/i,
  ]
  
  for (const pattern of genericBotPatterns) {
    if (pattern.test(ua)) {
      matches.push(`Generic pattern: "${pattern.source}"`)
    }
  }
  
  return {
    isCrawler: matches.length > 0,
    matches,
    userAgent: userAgent,
    lowercaseUserAgent: ua
  }
}

export async function GET(request: NextRequest) {
  const userAgent = getUserAgent(request.headers)
  const isCrawler = isSearchEngineCrawler(userAgent)
  const debugResult = debugCrawlerDetection(userAgent || '')
  
  // Get all headers for debugging
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })

  // Test specific user agents
  const testUserAgents = [
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
    'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Mozilla/5.0 (compatible; Twitterbot/1.0)',
  ]

  // Simple regex test
  const chromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
  const regexTest = /\b(?:bot|crawler|spider|scraper)\b/i.test(chromeUA.toLowerCase())

  const testResults = testUserAgents.map(ua => ({
    userAgent: ua,
    isCrawler: isSearchEngineCrawler(ua),
    debug: debugCrawlerDetection(ua || '')
  }))

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    currentRequest: {
      userAgent,
      isCrawler,
      debug: debugResult,
      headers,
      requestUrl: request.url,
      pathname: request.nextUrl.pathname,
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
      message: isCrawler 
        ? 'This request was detected as a crawler and should be served home page content'
        : 'This request was NOT detected as a crawler'
    },
    testResults,
    regexTest: {
      chromeUA,
      lowercaseChromeUA: chromeUA.toLowerCase(),
      regexPattern: '\\b(?:bot|crawler|spider|scraper)\\b',
      regexMatch: regexTest
    },
    note: 'Test results show how different user agents are detected with detailed debugging'
  })
}
