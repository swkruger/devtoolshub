"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Shield, Zap } from "lucide-react"
import { authClient } from "@/lib/auth"
import { getClientApplicationName } from '@/lib/app-config'

export function SignInForm() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const forceReauthParam = searchParams.get('force_reauth')

  // Check if user is already authenticated
  useEffect(() => {
    // If force reauth is requested, clear any cached OAuth state and skip auth check
    if (forceReauthParam === 'true') {
      console.log('Force reauth detected, clearing OAuth state and skipping auth check...')
      localStorage.removeItem('force_reauth')
      // Clear any OAuth-related storage
      sessionStorage.removeItem('oauth_state')
      sessionStorage.removeItem('oauth_code_verifier')
      sessionStorage.removeItem('oauth_nonce')
      sessionStorage.removeItem('github_oauth_state')
      sessionStorage.removeItem('google_oauth_state')
      
      // Skip authentication check and show sign-in form immediately
      setIsCheckingAuth(false)
      return
    }
    
    const checkAuthStatus = async (retryCount = 0) => {
      try {
        console.log('Checking auth status... (attempt', retryCount + 1, ')')
        
        const session = await authClient.getSession()
        console.log('Session from getSession():', session)
        if (session?.user) {
          console.log('User is authenticated, redirecting to:', redirectTo)
          // Use hard redirect to avoid any React router issues
          window.location.href = redirectTo
          return
        }
        
        // If no session and we haven't tried many times, retry after a short delay
        if (retryCount < 3) {
          console.log('No session found, retrying in 500ms...')
          setTimeout(() => checkAuthStatus(retryCount + 1), 500)
          return
        }
        
        console.log('No session found after retries, showing sign-in form')
      } catch (error) {
        console.error('Error checking auth status:', error)
      } finally {
        // Only set loading to false after final attempt
        if (retryCount >= 3) {
          setIsCheckingAuth(false)
        }
      }
    }

    checkAuthStatus()
  }, [router, redirectTo])

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(provider)
      
      // Check if we need to force re-authentication
      const forceReauth = localStorage.getItem('force_reauth') === 'true' || forceReauthParam === 'true'
      
      if (forceReauth) {
        console.log('Force re-authentication detected, using aggressive OAuth params')
        // Clear the flag
        localStorage.removeItem('force_reauth')
        
                          // Use more aggressive parameters to force account selection
         const queryParams = {
           ...(provider === 'google' && {
             prompt: 'select_account consent',
             access_type: 'offline',
             include_granted_scopes: 'false', // Don't include previously granted scopes
           }),
           ...(provider === 'github' && {
             prompt: 'consent',
             scope: 'read:user user:email',
             force_login: 'true', // Force login screen
           }),
         }
        
        await authClient.signInWithOAuth(provider, { queryParams })
      } else {
        // Even for normal flow, use some parameters to ensure fresh auth
        const queryParams = {
          ...(provider === 'google' && {
            prompt: 'select_account',
          }),
          ...(provider === 'github' && {
            scope: 'read:user user:email',
          }),
        }
        
        await authClient.signInWithOAuth(provider, { queryParams })
      }
      
      // OAuth redirect will happen automatically
    } catch (error) {
      console.error(`Failed to sign in with ${provider}:`, error)
      setIsLoading(null)
      // Could add toast notification here
    }
  }

  // Show loading while checking authentication status
  if (isCheckingAuth) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="ml-2">Checking authentication...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Welcome to {getClientApplicationName()}</CardTitle>
        <CardDescription>
          Sign in to access your developer toolkit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-sm text-destructive">
              Authentication failed. Please try again.
            </p>
          </div>
        )}

        <Button 
          className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-500 dark:hover:border-gray-400" 
          variant="outline"
          disabled={isLoading !== null}
          onClick={() => handleOAuthSignIn('google')}
        >
          {isLoading === 'google' ? (
            <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </Button>
        
        <Button 
          className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-500 dark:hover:border-gray-400" 
          variant="outline"
          disabled={isLoading !== null}
          onClick={() => handleOAuthSignIn('github')}
        >
          {isLoading === 'github' ? (
            <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          )}
          Continue with GitHub
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </div>
      </CardContent>
    </Card>
  )
} 