import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  
  // Add debugging for settings route
  if (pathname === '/settings') {
    console.log('=== MIDDLEWARE: SETTINGS ROUTE ACCESSED ===')
    console.log('Middleware: Processing settings route at:', new Date().toISOString())
  }
  
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

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Add debugging for settings route
  if (pathname === '/settings') {
    console.log('Middleware: User authentication check result:', {
      hasUser: !!user,
      userEmail: user?.email,
      pathname: pathname
    })
  }

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/tools', '/settings']
  const authRoutes = ['/sign-in', '/auth']
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if this is a logout request
  const isLogoutRequest = searchParams.get('logout') === 'true' || 
                         searchParams.get('force_reauth') !== null

  // If user is not authenticated and trying to access protected route
  if (!user && isProtectedRoute) {
    if (pathname === '/settings') {
      console.log('Middleware: User not authenticated, redirecting settings to sign-in')
    }
    // If accessing a tool, route to public docs instead of sign-in
    if (pathname.startsWith('/tools/')) {
      const parts = pathname.split('/')
      const slug = parts[2]
      if (slug) {
        return NextResponse.redirect(new URL(`/docs/${slug}`, request.url))
      }
      return NextResponse.redirect(new URL('/docs', request.url))
    }
    const redirectUrl = new URL('/sign-in', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // If user is authenticated but we're on the home page and they just signed out,
  // redirect them to sign-in to force re-authentication
  if (user && pathname === '/' && searchParams.get('force_reauth') === 'true') {
    const redirectUrl = new URL('/sign-in', request.url)
    redirectUrl.searchParams.set('force_reauth', 'true')
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access auth routes, redirect to dashboard
  // BUT NOT if this is a logout request
  if (user && isAuthRoute && pathname !== '/auth/callback' && !isLogoutRequest) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname === '/settings') {
    console.log('Middleware: Settings route allowed to proceed')
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