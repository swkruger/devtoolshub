import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  // Handle OAuth codes that land on root domain
  if (pathname === '/' && request.nextUrl.searchParams.has('code')) {
    const code = request.nextUrl.searchParams.get('code')
    const error = request.nextUrl.searchParams.get('error')
    const errorDescription = request.nextUrl.searchParams.get('error_description')
    
    console.error('🔐🔐🔐 OAUTH CODE DETECTED ON ROOT DOMAIN 🔐🔐🔐', {
      timestamp: new Date().toISOString(),
      code,
      error,
      errorDescription,
      pathname,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      host: request.headers.get('host')
    })

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

  // Log auth-related requests for debugging
  if (pathname.startsWith('/auth') || pathname.startsWith('/sign-in')) {
    console.error('🔐🔐🔐 AUTH MIDDLEWARE HIT 🔐🔐🔐', {
      timestamp: new Date().toISOString(),
      pathname,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      host: request.headers.get('host')
    })
  }

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/tools', '/settings', '/go-premium']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

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

  if (pathname === '/' && user) {
    // User is authenticated and accessing root - redirect to dashboard
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