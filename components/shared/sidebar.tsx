"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAllTools, getCategories, getCategoryDisplayName } from "@/lib/tools"
import { 
  Home, 
  Wrench, 
  Crown,
  Settings,
  FileText,
  Star
} from "lucide-react"
import * as React from 'react'
import { loadLocalFavorites, loadServerFavorites, saveLocalFavorites, toggleServerFavorite } from "@/lib/services/user-favorites"
import { useUser } from '@/lib/useUser'

// Client-only wrapper to prevent hydration issues
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = React.useState(false)
  
  React.useEffect(() => {
    setHasMounted(true)
  }, [])
  
  if (!hasMounted) {
    return null
  }
  
  return <>{children}</>
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
]

// Tools will be derived dynamically inside the component so the menu reflects any config changes

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, loading } = useUser()
  const [apiPremiumStatus, setApiPremiumStatus] = React.useState<boolean | null>(null)
  const [apiAdminStatus, setApiAdminStatus] = React.useState<boolean | null>(null)
  const [apiLoading, setApiLoading] = React.useState(true)
  
  // Determine premium status - prioritize API result since useUser is not working
  const isPremiumUser = apiPremiumStatus === true || user?.plan === 'premium'
  const isAdminUser = apiAdminStatus === true
  const shouldShowGoPremium = !apiLoading && !isPremiumUser
  
  // Debug logging
  console.log('Sidebar - User data:', { 
    user, 
    loading, 
    isPremiumUser, 
    isAdminUser,
    plan: user?.plan, 
    apiPremiumStatus,
    apiAdminStatus,
    apiLoading,
    shouldShowGoPremium,
    userId: user?.id 
  })
  
  // Fetch premium and admin status from API on component mount
  React.useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        console.log('Sidebar - Fetching user status from API')
        setApiLoading(true)
        
        // Fetch both premium and admin status in parallel
        const [premiumResponse, adminResponse] = await Promise.all([
          fetch('/api/user/premium-status'),
          fetch('/api/user/admin-status')
        ])
        
        if (premiumResponse.ok) {
          const premiumData = await premiumResponse.json()
          console.log('Sidebar - API premium status:', premiumData)
          setApiPremiumStatus(premiumData.isPremium)
        } else {
          console.error('Sidebar - Premium API error:', premiumResponse.status, premiumResponse.statusText)
        }
        
        if (adminResponse.ok) {
          const adminData = await adminResponse.json()
          console.log('Sidebar - API admin status:', adminData)
          setApiAdminStatus(adminData.isAdmin)
        } else {
          console.error('Sidebar - Admin API error:', adminResponse.status, adminResponse.statusText)
        }
      } catch (error) {
        console.error('Sidebar - Error fetching user status:', error)
      } finally {
        setApiLoading(false)
      }
    }
    
    fetchUserStatus()
  }, [])
  
  const tools = React.useMemo(() => getAllTools().map(tool => ({
    id: tool.id,
    name: tool.name,
    href: tool.path,
    icon: tool.icon,
    isPremium: tool.isPremium,
    tags: tool.tags,
    description: tool.description,
    category: tool.category,
  })), [])
  const categories = React.useMemo(() => getCategories(), [])
  const [query, setQuery] = React.useState("")
  const [favorites, setFavorites] = React.useState<Set<string>>(() => loadLocalFavorites())

  // Load and persist favorites in localStorage
  React.useEffect(() => {
    (async () => {
      const server = await loadServerFavorites()
      if (server.size > 0) setFavorites(server)
    })()
  }, [])

  React.useEffect(() => {
    saveLocalFavorites(favorites)
  }, [favorites])

  const toggleFavorite = React.useCallback(async (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      const willFavorite = !next.has(id)
      if (willFavorite) next.add(id)
      else next.delete(id)
      // fire-and-forget server sync
      toggleServerFavorite(id, willFavorite).catch(() => {})
      return next
    })
  }, [])

  const filteredByQuery = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tools
    return tools.filter(t =>
      t.name.toLowerCase().includes(q) ||
      (t.description?.toLowerCase() || "").includes(q) ||
      (t.tags || []).some(tag => tag.toLowerCase().includes(q))
    )
  }, [tools, query])

  const favoriteItems = React.useMemo(() => filteredByQuery.filter(t => favorites.has(t.id)), [filteredByQuery, favorites])

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        {/* Navigation */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            DevToolsHub
          </h2>
          <div className="space-y-1">
            {navigation.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Tools */}
        <ClientOnly>
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Tools
            </h2>
            <div className="px-4 pb-2">
              <Input
                placeholder="Search tools..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search tools"
              />
            </div>
            <div className="space-y-3 px-1">
              {/* Favorites Section */}
              {favoriteItems.length > 0 && (
                <div className="space-y-1">
                  <div className="px-4 text-xs uppercase text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" /> Favorites
                  </div>
                  {favoriteItems.map((tool) => (
                    <Button
                      key={`fav-${tool.href}`}
                      variant={pathname === tool.href ? "secondary" : "ghost"}
                      className="w-full justify-start relative border border-yellow-200/60 dark:border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-500/5"
                      asChild
                    >
                      <Link href={tool.href}>
                        <tool.icon className="h-4 w-4 mr-2" />
                        <span className="flex-1 text-left">{tool.name}</span>
                        <Star
                          className="h-3.5 w-3.5 text-yellow-500"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(tool.id) }}
                        />
                      </Link>
                    </Button>
                  ))}
                </div>
              )}
              {categories.map((cat) => {
                const items = filteredByQuery.filter(t => t.category === cat && !favorites.has(t.id))
                if (items.length === 0) return null
                return (
                  <div key={cat} className="space-y-1">
                    <div className="px-4 text-xs uppercase text-muted-foreground">
                      {getCategoryDisplayName(cat)}
                    </div>
                    {items.map((tool) => (
                      <Button
                        key={tool.href}
                        variant={pathname === tool.href ? "secondary" : "ghost"}
                        className="w-full justify-start relative"
                        asChild
                      >
                        <Link href={tool.href}>
                          <tool.icon className="h-4 w-4 mr-2" />
                          <span className="flex-1 text-left">{tool.name}</span>
                          <div className="flex items-center gap-2">
                            {tool.isPremium && (
                              <Crown className="h-3 w-3 text-primary" />
                            )}
                            <Star
                              className={cn("h-3.5 w-3.5", favorites.has(tool.id) ? "text-yellow-500" : "text-muted-foreground")}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(tool.id) }}
                            />
                          </div>
                        </Link>
                      </Button>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </ClientOnly>

        {/* Blog Management - Admin Only */}
        {isAdminUser && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Blog Management
            </h2>
            <div className="space-y-1">
              <Button
                variant={pathname === "/dashboard/blogs" ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href="/dashboard/blogs">
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Blogs
                </Link>
              </Button>
              <Button
                variant={pathname === "/dashboard/blogs/new" ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href="/dashboard/blogs/new">
                  <FileText className="h-4 w-4 mr-2" />
                  New Blog Post
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="px-3 py-2">
          <div className="space-y-1">
            {shouldShowGoPremium && (
              <Button
                variant="ghost"
                className="w-full justify-start"
                asChild
              >
                <Link href="/go-premium">
                  <Crown className="h-4 w-4 mr-2" />
                  Go Premium
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 