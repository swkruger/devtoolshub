"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth"
import { getAllTools } from '@/lib/tools'
import { useUser } from '@/lib/useUser'
import { getClientApplicationName } from '@/lib/app-config'

interface HeaderProps {
  user?: {
    id: string
    email: string
    name: string
    avatar_url?: string
  } | null
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (isSigningOut) {
      console.log('Sign out already in progress, ignoring click')
      return
    }
    
    setIsSigningOut(true)
    try {
      console.log('User clicked sign out - starting immediate sign out...')
      
      // Step 1: Clear all client-side storage immediately
      console.log('Clearing all client-side storage...')
      localStorage.clear()
      sessionStorage.clear()
      
      // Step 2: Clear all Supabase and OAuth cookies aggressively
      console.log('Clearing all authentication cookies...')
      const allCookies = document.cookie.split(';')
      allCookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        // Clear all possible authentication cookies
        if (name.includes('supabase') || name.includes('sb-') || name.includes('auth') || 
            name.includes('oauth') || name.includes('google') || name.includes('github') ||
            name.includes('session') || name.includes('token')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
        }
      })
      
      // Step 3: Set force reauth flag
      localStorage.setItem('force_reauth', 'true')
      
      // Step 4: Try server-side sign out in background (don't wait for it)
      console.log('Attempting server-side sign out in background...')
      try {
        fetch('/api/auth/signout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(() => {
          console.log('Server-side sign out completed')
        }).catch((error) => {
          console.log('Server-side sign out failed:', error)
        })
      } catch (error) {
        console.log('Could not initiate server-side sign out:', error)
      }
      
      // Step 5: Try client-side Supabase sign out in background (don't wait for it)
      console.log('Attempting client-side Supabase sign out in background...')
      try {
        const { createSupabaseClient } = await import('@/lib/supabase')
        const supabase = createSupabaseClient()
        supabase.auth.signOut().then(() => {
          console.log('Client-side Supabase sign out completed')
        }).catch((error) => {
          console.log('Client-side Supabase sign out failed:', error)
        })
      } catch (error) {
        console.log('Could not initiate client-side Supabase sign out:', error)
      }
      
      // Step 6: Redirect immediately to home page
      console.log('Redirecting to home page immediately...')
      window.location.href = '/'
      
    } catch (error) {
      console.error('Failed to sign out:', error)
      // Even if everything fails, just clear storage and redirect
      console.log('Fallback: clearing storage and redirecting...')
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = '/'
    }
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🔧</span>
            <span className="font-bold text-xl">{getClientApplicationName()}</span>
          </Link>
          
          {user && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/dashboard" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} alt={user.name} />
                    <AvatarFallback>
                      {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
                  {isSigningOut ? 'Signing out...' : 'Sign out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
} 