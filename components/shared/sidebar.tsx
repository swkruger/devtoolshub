"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  {
    name: "All Tools",
    href: "/tools",
    icon: Wrench,
  },
]

// Tools will be derived dynamically inside the component so the menu reflects any config changes

interface SidebarProps {
  className?: string
  isCollapsed?: boolean
}

export function Sidebar({ className, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname()
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
          <h2 className={cn(
            "mb-2 px-4 text-lg font-semibold tracking-tight",
            isCollapsed && "hidden"
          )}>
            DevToolsHub
          </h2>
          <div className="space-y-1">
            {navigation.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "justify-center px-2"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && item.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Tools */}
        <ClientOnly>
          <div className="px-3 py-2">
            <h2 className={cn(
              "mb-2 px-4 text-lg font-semibold tracking-tight",
              isCollapsed && "hidden"
            )}>
              Tools
            </h2>
            {!isCollapsed && (
              <div className="px-4 pb-2">
                <Input
                  placeholder="Search tools..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search tools"
                />
              </div>
            )}
            <ScrollArea className="h-[70vh] px-1">
              <div className="space-y-3">
                {/* Favorites Section */}
                {favoriteItems.length > 0 && (
                  <div className="space-y-1">
                    {!isCollapsed && (
                      <div className="px-4 text-xs uppercase text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" /> Favorites
                      </div>
                    )}
                    {favoriteItems.map((tool) => (
                      <Button
                        key={`fav-${tool.href}`}
                        variant={pathname === tool.href ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start relative border border-yellow-200/60 dark:border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-500/5",
                          isCollapsed && "justify-center px-2"
                        )}
                        asChild
                      >
                        <Link href={tool.href}>
                          <tool.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                          {!isCollapsed && (
                            <>
                              <span className="flex-1 text-left">{tool.name}</span>
                              <Star
                                className="h-3.5 w-3.5 text-yellow-500"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(tool.id) }}
                              />
                            </>
                          )}
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
                      {!isCollapsed && (
                        <div className="px-4 text-xs uppercase text-muted-foreground">
                          {getCategoryDisplayName(cat)}
                        </div>
                      )}
                      {items.map((tool) => (
                        <Button
                          key={tool.href}
                          variant={pathname === tool.href ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start relative",
                            isCollapsed && "justify-center px-2"
                          )}
                          asChild
                        >
                          <Link href={tool.href}>
                            <tool.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                            {!isCollapsed && (
                              <>
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
                              </>
                            )}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </ClientOnly>

        {/* Blog Management */}
        <div className="px-3 py-2">
          <h2 className={cn(
            "mb-2 px-4 text-lg font-semibold tracking-tight",
            isCollapsed && "hidden"
          )}>
            Blog Management
          </h2>
          <div className="space-y-1">
            <Button
              variant={pathname === "/dashboard/blogs" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                isCollapsed && "justify-center px-2"
              )}
              asChild
            >
              <Link href="/dashboard/blogs">
                <FileText className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && "Manage Blogs"}
              </Link>
            </Button>
            <Button
              variant={pathname === "/dashboard/blogs/new" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                isCollapsed && "justify-center px-2"
              )}
              asChild
            >
              <Link href="/dashboard/blogs/new">
                <FileText className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && "New Blog Post"}
              </Link>
            </Button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isCollapsed && "justify-center px-2"
              )}
              asChild
            >
              <Link href="/billing">
                <Crown className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && "Go Premium"}
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isCollapsed && "justify-center px-2"
              )}
              asChild
            >
              <Link href="/settings">
                <Settings className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && "Settings"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 