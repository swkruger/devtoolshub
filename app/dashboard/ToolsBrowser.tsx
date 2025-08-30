"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import { loadLocalFavorites, loadServerFavorites, saveLocalFavorites, toggleServerFavorite } from "@/lib/services/user-favorites"

type SerializableTool = {
  id: string
  name: string
  description: string
  emoji: string
  isPremium: boolean
  category: 'text' | 'crypto' | 'image' | 'utility' | 'web' | 'security'
  tags: string[]
  path: string
  shortDescription: string
}

type Props = { initialTools: SerializableTool[] }

export default function ToolsBrowser({ initialTools }: Props) {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  // Start empty to ensure server-rendered HTML matches client on first paint
  // Then hydrate favorites from localStorage and Supabase after mount
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Load local favorites first (client-only), then server favorites
  useEffect(() => {
    const local = loadLocalFavorites()
    if (local.size > 0) setFavorites(local)
    ;(async () => {
      const server = await loadServerFavorites()
      if (server.size > 0) setFavorites(server)
    })()
  }, [])

  // Persist when changed
  useEffect(() => {
    saveLocalFavorites(favorites)
  }, [favorites])

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      const willFavorite = !next.has(id)
      if (willFavorite) next.add(id)
      else next.delete(id)
      toggleServerFavorite(id, willFavorite).catch(() => {})
      return next
    })
  }

  const categories = useMemo(() => ['utility', 'text', 'crypto', 'image', 'web', 'security'] as const, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return initialTools.filter((t) => {
      const matchesQuery = q
        ? t.name.toLowerCase().includes(q) ||
          t.shortDescription.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
        : true
      const matchesCategory = activeCategory ? t.category === (activeCategory as any) : true
      return matchesQuery && matchesCategory
    })
  }, [initialTools, query, activeCategory])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const af = favorites.has(a.id) ? 1 : 0
      const bf = favorites.has(b.id) ? 1 : 0
      if (af !== bf) return bf - af // favorites first
      return a.name.localeCompare(b.name)
    })
  }, [filtered, favorites])

  return (
    <div className="space-y-4 mb-2">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-sm">
          <Input
            placeholder="Search tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search tools"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(null)}
          >
            All
          </Button>
          {categories.map((c) => (
            <Button
              key={c}
              variant={activeCategory === c ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(c)}
            >
              {({
                utility: 'Utilities',
                text: 'Text & Format',
                crypto: 'Cryptography',
                image: 'Image Processing',
                web: 'Web Development',
                security: 'Security',
              } as const)[c]}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorted.map((tool) => (
                  <Card key={tool.id} className={`tool-card ${tool.isPremium ? 'tool-card-backer' : ''} ${favorites.has(tool.id) ? 'border-yellow-200/60 dark:border-yellow-500/20 bg-yellow-50/40 dark:bg-yellow-500/5' : ''}`}>
          {tool.isPremium && (
            <div className="backer-badge">
              Backer
            </div>
          )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{tool.emoji}</span>
                  <div>
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <CardDescription>{tool.shortDescription}</CardDescription>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={favorites.has(tool.id) ? 'Remove from favorites' : 'Add to favorites'}
                  onClick={() => toggleFavorite(tool.id)}
                  className="p-1 rounded hover:bg-muted"
                >
                  <Star className={`h-4 w-4 ${favorites.has(tool.id) ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {tool.isPremium ? (
                <Button 
                  className="w-full" 
                  variant="default"
                  asChild
                >
                  <Link href="/go-backer">
                    Upgrade to Access
                  </Link>
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  variant="outline"
                  asChild
                >
                  <Link href={tool.path}>Open Tool</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


