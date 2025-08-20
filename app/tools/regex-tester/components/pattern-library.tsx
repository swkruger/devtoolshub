"use client"

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  BookOpen, 
  Copy, 
  Download, 
  Star, 
  StarOff,
  Filter,
  ChevronDown,
  ChevronRight,
  Crown,
  Zap,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  COMPREHENSIVE_PATTERNS, 
  PATTERN_CATEGORIES,
  getPatternsByCategory,
  getPatternsBySubcategory,
  searchPatterns,
  getPatternsByDifficulty,
  type PatternLibraryItem,
  type PatternCategory
} from '../lib/comprehensive-patterns'

interface PatternLibraryProps {
  isOpen: boolean
  onClose: () => void
  isPremiumUser: boolean
  onLoadPattern: (pattern: PatternLibraryItem) => void
}

export function PatternLibrary({ isOpen, onClose, isPremiumUser, onLoadPattern }: PatternLibraryProps) {

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [selectedPattern, setSelectedPattern] = useState<PatternLibraryItem | null>(null)
  const [savedPatterns, setSavedPatterns] = useState<Set<string>>(new Set()) // Will be loaded from Supabase

  // Filter patterns based on current selection
  const filteredPatterns = useMemo(() => {
    let patterns = COMPREHENSIVE_PATTERNS

    // Apply search filter
    if (searchQuery.trim()) {
      patterns = searchPatterns(searchQuery.trim())
    }

    // Apply category filter
    if (selectedCategory) {
      patterns = patterns.filter(p => p.category === selectedCategory)
    }

    // Apply subcategory filter
    if (selectedSubcategory) {
      patterns = patterns.filter(p => p.subcategory === selectedSubcategory)
    }

    // Apply difficulty filter
    if (selectedDifficulty) {
      patterns = patterns.filter(p => p.difficulty === selectedDifficulty)
    }

    return patterns
  }, [searchQuery, selectedCategory, selectedSubcategory, selectedDifficulty])

  const handleLoadPattern = useCallback((pattern: PatternLibraryItem) => {
    if (!isPremiumUser) {
      toast.warning('Premium Feature', {
        description: 'Pattern library requires a premium plan'
      })
      return
    }

    onLoadPattern(pattern)
    onClose()
    
    toast.success('Pattern loaded', {
      description: `Loaded "${pattern.name}" pattern`
    })
  }, [isPremiumUser, onLoadPattern, onClose, toast])

  const copyPatternToClipboard = useCallback((pattern: PatternLibraryItem) => {
    navigator.clipboard.writeText(pattern.pattern).then(() => {
      toast.success('Copied to clipboard', {
        description: `Pattern "${pattern.name}" copied`
      })
    })
  }, [toast])

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedCategory(null)
    setSelectedSubcategory(null)
    setSelectedDifficulty(null)
    setSelectedPattern(null)
  }, [])

  const getDifficultyColor = (difficulty: PatternLibraryItem['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-blue-100 text-blue-800'
      case 'advanced': return 'bg-orange-100 text-orange-800'
      case 'expert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="flex items-center gap-2">
                  Pattern Library
                  {!isPremiumUser && <Crown className="h-4 w-4 text-amber-500" />}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {COMPREHENSIVE_PATTERNS.length}+ curated regex patterns organized by category
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex h-[calc(90vh-120px)]">
            {/* Left Sidebar - Categories & Filters */}
            <div className="w-80 border-r bg-muted/20 p-4 overflow-y-auto">
              {/* Search */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patterns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Active Filters */}
                {(selectedCategory || selectedSubcategory || selectedDifficulty || searchQuery) && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-muted-foreground">Filters:</span>
                    {selectedCategory && (
                      <Badge variant="secondary" className="text-xs">
                        {PATTERN_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                        <button onClick={() => setSelectedCategory(null)} className="ml-1">×</button>
                      </Badge>
                    )}
                    {selectedSubcategory && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedSubcategory}
                        <button onClick={() => setSelectedSubcategory(null)} className="ml-1">×</button>
                      </Badge>
                    )}
                    {selectedDifficulty && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedDifficulty}
                        <button onClick={() => setSelectedDifficulty(null)} className="ml-1">×</button>
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
                      Clear all
                    </Button>
                  </div>
                )}

                {/* Difficulty Filter */}
                <div>
                  <h4 className="font-medium mb-2 text-sm">Difficulty</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {['beginner', 'intermediate', 'advanced', 'expert'].map((difficulty) => (
                      <button
                        key={difficulty}
                        onClick={() => setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty)}
                        className={`text-xs p-2 rounded border text-left ${
                          selectedDifficulty === difficulty 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        {difficulty}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="font-medium mb-2 text-sm">Categories</h4>
                  <div className="space-y-1">
                    {PATTERN_CATEGORIES.map((category) => {
                      const isExpanded = expandedCategories.has(category.id)
                      const categoryPatterns = getPatternsByCategory(category.id)
                      
                      return (
                        <div key={category.id}>
                          <button
                            onClick={() => {
                              toggleCategory(category.id)
                              setSelectedCategory(selectedCategory === category.id ? null : category.id)
                              setSelectedSubcategory(null)
                            }}
                            className={`w-full flex items-center gap-2 p-2 rounded text-sm text-left hover:bg-muted ${
                              selectedCategory === category.id ? 'bg-primary/10' : ''
                            }`}
                          >
                            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            <span className="text-sm">{category.icon}</span>
                            <span className="flex-1">{category.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {categoryPatterns.length}
                            </Badge>
                          </button>
                          
                          {isExpanded && category.subcategories && (
                            <div className="ml-6 space-y-1 mt-1">
                              {category.subcategories.map((subcategory) => {
                                const subcategoryPatterns = getPatternsBySubcategory(subcategory.id)
                                return (
                                  <button
                                    key={subcategory.id}
                                    onClick={() => setSelectedSubcategory(
                                      selectedSubcategory === subcategory.id ? null : subcategory.id
                                    )}
                                    className={`w-full flex items-center justify-between p-1.5 rounded text-xs text-left hover:bg-muted ${
                                      selectedSubcategory === subcategory.id ? 'bg-primary/10' : ''
                                    }`}
                                  >
                                    <span>{subcategory.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {subcategoryPatterns.length}
                                    </Badge>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden">
              <div className="flex h-full">
                {/* Pattern List */}
                <div className="w-96 border-r overflow-y-auto">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">
                        {filteredPatterns.length} Pattern{filteredPatterns.length !== 1 ? 's' : ''}
                      </h3>
                    </div>
                    
                    <div className="space-y-2">
                      {filteredPatterns.map((pattern) => (
                        <button
                          key={pattern.id}
                          onClick={() => setSelectedPattern(pattern)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedPattern?.id === pattern.id 
                              ? 'bg-primary/10 border-primary' 
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{pattern.name}</h4>
                            <div className="flex items-center gap-1">
                              <Badge className={`text-xs ${getDifficultyColor(pattern.difficulty)}`}>
                                {pattern.difficulty}
                              </Badge>
                              {savedPatterns.has(pattern.id) && (
                                <Star className="h-3 w-3 text-yellow-500" />
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {pattern.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {pattern.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {pattern.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{pattern.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pattern Details */}
                <div className="flex-1 overflow-y-auto">
                  {selectedPattern ? (
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-semibold">{selectedPattern.name}</h2>
                          <p className="text-muted-foreground">{selectedPattern.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(selectedPattern.difficulty)}>
                            {selectedPattern.difficulty}
                          </Badge>
                        </div>
                      </div>

                      {/* Pattern Display */}
                      <div className="mb-6">
                        <h3 className="font-medium mb-2">Pattern</h3>
                        <div className="font-mono text-sm bg-muted p-3 rounded-lg break-all">
                          {selectedPattern.pattern}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleLoadPattern(selectedPattern)}
                            disabled={!isPremiumUser}
                          >
                            {!isPremiumUser && <Crown className="h-3 w-3 mr-1" />}
                            <Zap className="h-3 w-3 mr-1" />
                            Load Pattern
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => copyPatternToClipboard(selectedPattern)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>

                      {/* Use Case */}
                      <div className="mb-6">
                        <h3 className="font-medium mb-2">Use Case</h3>
                        <p className="text-sm text-muted-foreground">{selectedPattern.useCase}</p>
                      </div>

                      {/* Examples */}
                      <div className="mb-6">
                        <h3 className="font-medium mb-2">Examples</h3>
                        <div className="space-y-2">
                          {selectedPattern.examples.map((example, index) => (
                            <div key={index} className="font-mono text-sm bg-green-50 p-2 rounded border border-green-200">
                              {example}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Test Text */}
                      <div className="mb-6">
                        <h3 className="font-medium mb-2">Test Text</h3>
                        <div className="text-sm bg-muted p-3 rounded-lg">
                          {selectedPattern.testText}
                        </div>
                      </div>

                      {/* Flags */}
                      {selectedPattern.flags.length > 0 && (
                        <div className="mb-6">
                          <h3 className="font-medium mb-2">Recommended Flags</h3>
                          <div className="flex gap-2">
                            {selectedPattern.flags.map((flag) => (
                              <Badge key={flag} variant="outline" className="font-mono">
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="mb-6">
                        <h3 className="font-medium mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedPattern.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      {selectedPattern.notes && selectedPattern.notes.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Notes</h3>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {selectedPattern.notes.map((note, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span>•</span>
                                <span>{note}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a pattern to view details</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 