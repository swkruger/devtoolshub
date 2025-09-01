import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSearchEngineCrawler, getUserAgent } from '@/lib/utils'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // Check if this is a search engine crawler FIRST
  const userAgent = getUserAgent(request.headers)
  const isCrawler = isSearchEngineCrawler(userAgent)

  // Handle OAuth codes that land on root domain (but NOT for crawlers)
  if (pathname === '/' && request.nextUrl.searchParams.has('code') && !isCrawler) {
    const code = request.nextUrl.searchParams.get('code')
    const error = request.nextUrl.searchParams.get('error')
    const errorDescription = request.nextUrl.searchParams.get('error_description')

    if (code) {
      // Redirect to the proper callback route
      const callbackUrl = new URL('/auth/callback', request.url)
      callbackUrl.searchParams.set('code', code)
      return NextResponse.redirect(callbackUrl)
    }
    
    if (error) {
      // Redirect to sign-in with error
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('error', error)
      if (errorDescription) {
        signInUrl.searchParams.set('error_description', errorDescription)
      }
      return NextResponse.redirect(signInUrl)
    }
  }

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/tools', '/settings', '/go-backer']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  // Debug logging for authentication issues
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware Debug:', {
      pathname,
      isProtectedRoute,
      hasSession: !!session,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email
    })
  }

  // Redirect logic
  if (isProtectedRoute && !user) {
    // User is not authenticated and trying to access protected route
    const redirectUrl = new URL('/sign-in', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (pathname === '/sign-in' && user) {
    // User is authenticated and trying to access sign-in page
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname === '/' && user && !isCrawler) {
    // User is authenticated and accessing root - redirect to dashboard
    // BUT allow crawlers to access the home page content
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 