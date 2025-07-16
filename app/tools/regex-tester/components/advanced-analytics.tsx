"use client"

import { useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target,
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  X,
  Zap,
  Activity
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import type { RegexMatch } from '../lib/regex-engines'

interface MatchAnalytics {
  totalMatches: number
  uniqueMatches: number
  averageMatchLength: number
  shortestMatch: string
  longestMatch: string
  matchPositions: number[]
  captureGroupStats: {
    groupIndex: number
    groupValues: string[]
    uniqueValues: number
    mostCommon: string
    frequency: number
  }[]
  coveragePercentage: number
  matchDensity: number
}

interface PerformanceMetrics {
  executionTime: number
  charactersProcessed: number
  throughput: number // characters per ms
  memoryEstimate: number
  complexityScore: number
  optimizationSuggestions: string[]
}

interface AdvancedAnalyticsProps {
  isOpen: boolean
  onClose: () => void
  matches: RegexMatch[]
  pattern: string
  testText: string
  executionTime: number
  language: string
  flags: string[]
}

export function AdvancedAnalytics({ 
  isOpen, 
  onClose, 
  matches, 
  pattern, 
  testText, 
  executionTime, 
  language, 
  flags 
}: AdvancedAnalyticsProps) {
  const { toast } = useToast()

  // Calculate match analytics
  const matchAnalytics = useMemo((): MatchAnalytics => {
    if (matches.length === 0) {
      return {
        totalMatches: 0,
        uniqueMatches: 0,
        averageMatchLength: 0,
        shortestMatch: '',
        longestMatch: '',
        matchPositions: [],
        captureGroupStats: [],
        coveragePercentage: 0,
        matchDensity: 0
      }
    }

    const matchStrings = matches.map(m => m.match)
    const uniqueMatchStrings = [...new Set(matchStrings)]
    const matchLengths = matchStrings.map(m => m.length)
    const totalMatchedChars = matchLengths.reduce((sum, len) => sum + len, 0)

    // Find shortest and longest matches
    const shortestMatch = matchStrings.reduce((shortest, current) => 
      current.length < shortest.length ? current : shortest
    )
    const longestMatch = matchStrings.reduce((longest, current) => 
      current.length > longest.length ? current : longest
    )

    // Calculate capture group statistics
    const captureGroupStats: MatchAnalytics['captureGroupStats'] = []
    const maxGroups = Math.max(...matches.map(m => m.groups.length))

    for (let i = 1; i < maxGroups; i++) {
      const groupValues = matches
        .map(m => m.groups[i])
        .filter(val => val !== undefined && val !== '')

      if (groupValues.length > 0) {
        const valueCounts = groupValues.reduce((counts, value) => {
          counts[value] = (counts[value] || 0) + 1
          return counts
        }, {} as Record<string, number>)

        const mostCommonEntry = Object.entries(valueCounts)
          .sort(([,a], [,b]) => b - a)[0]

        captureGroupStats.push({
          groupIndex: i,
          groupValues: [...new Set(groupValues)],
          uniqueValues: new Set(groupValues).size,
          mostCommon: mostCommonEntry[0],
          frequency: mostCommonEntry[1]
        })
      }
    }

    return {
      totalMatches: matches.length,
      uniqueMatches: uniqueMatchStrings.length,
      averageMatchLength: matchLengths.reduce((sum, len) => sum + len, 0) / matchLengths.length,
      shortestMatch,
      longestMatch,
      matchPositions: matches.map(m => m.index),
      captureGroupStats,
      coveragePercentage: (totalMatchedChars / testText.length) * 100,
      matchDensity: matches.length / testText.length * 1000 // matches per 1000 characters
    }
  }, [matches, testText])

  // Calculate performance metrics
  const performanceMetrics = useMemo((): PerformanceMetrics => {
    const charactersProcessed = testText.length
    const throughput = charactersProcessed / Math.max(executionTime, 0.1) // avoid division by zero
    
    // Estimate complexity based on pattern features
    let complexityScore = 1
    if (pattern.includes('*') || pattern.includes('+')) complexityScore += 2
    if (pattern.includes('?')) complexityScore += 1
    if (pattern.includes('(?=') || pattern.includes('(?!')) complexityScore += 3 // lookaheads
    if (pattern.includes('(?<=') || pattern.includes('(?<!')) complexityScore += 3 // lookbehinds
    if (pattern.includes('\\b')) complexityScore += 1 // word boundaries
    if (pattern.includes('[')) complexityScore += 1 // character classes
    if (pattern.includes('|')) complexityScore += 2 // alternation

    // Generate optimization suggestions
    const suggestions: string[] = []
    
    if (executionTime > 100) {
      suggestions.push('Consider optimizing pattern - execution time is high')
    }
    
    if (pattern.includes('.*.*')) {
      suggestions.push('Multiple .* sequences can cause catastrophic backtracking')
    }
    
    if (pattern.includes('(.*)') && flags.includes('g')) {
      suggestions.push('Greedy capture groups with global flag may be inefficient')
    }
    
    if (!pattern.includes('^') && !pattern.includes('$') && throughput < 1000) {
      suggestions.push('Consider adding anchors (^ $) for better performance')
    }
    
    if (pattern.length > 100) {
      suggestions.push('Very long patterns can be hard to maintain - consider breaking into parts')
    }
    
    if (complexityScore > 10) {
      suggestions.push('Pattern complexity is high - consider simplifying if possible')
    }

    if (throughput > 10000) {
      suggestions.push('Excellent performance! Pattern is well optimized')
    }

    return {
      executionTime,
      charactersProcessed,
      throughput,
      memoryEstimate: pattern.length * 2 + testText.length, // rough estimate
      complexityScore,
      optimizationSuggestions: suggestions
    }
  }, [pattern, testText, executionTime, flags])

  const getPerformanceRating = (throughput: number): { rating: string; color: string; description: string } => {
    if (throughput > 10000) return { rating: 'Excellent', color: 'text-green-600', description: 'Very fast execution' }
    if (throughput > 5000) return { rating: 'Good', color: 'text-blue-600', description: 'Good performance' }
    if (throughput > 1000) return { rating: 'Fair', color: 'text-yellow-600', description: 'Acceptable performance' }
    if (throughput > 100) return { rating: 'Slow', color: 'text-orange-600', description: 'Consider optimization' }
    return { rating: 'Very Slow', color: 'text-red-600', description: 'Needs optimization' }
  }

  const getComplexityLevel = (score: number): { level: string; color: string } => {
    if (score <= 3) return { level: 'Simple', color: 'text-green-600' }
    if (score <= 6) return { level: 'Moderate', color: 'text-blue-600' }
    if (score <= 10) return { level: 'Complex', color: 'text-orange-600' }
    return { level: 'Very Complex', color: 'text-red-600' }
  }

  const exportAnalytics = useCallback(() => {
    const analyticsData = {
      pattern,
      language,
      flags: flags.join(''),
      testTextLength: testText.length,
      timestamp: new Date().toISOString(),
      matchAnalytics,
      performanceMetrics
    }

    const jsonContent = JSON.stringify(analyticsData, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `regex-analytics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      type: 'success',
      title: 'Analytics exported',
      description: 'Analytics data saved as JSON file'
    })
  }, [pattern, language, flags, testText, matchAnalytics, performanceMetrics, toast])

  const copyAnalyticsSummary = useCallback(() => {
    const performanceRating = getPerformanceRating(performanceMetrics.throughput)
    const complexityLevel = getComplexityLevel(performanceMetrics.complexityScore)

    const summary = `Regex Analytics Summary
Pattern: ${pattern}
Language: ${language}
Flags: ${flags.join('') || 'none'}

Match Statistics:
- Total Matches: ${matchAnalytics.totalMatches}
- Unique Matches: ${matchAnalytics.uniqueMatches}
- Average Match Length: ${matchAnalytics.averageMatchLength.toFixed(1)} characters
- Coverage: ${matchAnalytics.coveragePercentage.toFixed(1)}% of text

Performance Metrics:
- Execution Time: ${performanceMetrics.executionTime.toFixed(2)}ms
- Throughput: ${performanceMetrics.throughput.toFixed(0)} chars/ms
- Performance Rating: ${performanceRating.rating}
- Complexity: ${complexityLevel.level} (${performanceMetrics.complexityScore})

${performanceMetrics.optimizationSuggestions.length > 0 ? 
  'Optimization Suggestions:\n' + performanceMetrics.optimizationSuggestions.map(s => `- ${s}`).join('\n') : 
  'No optimization suggestions - pattern looks good!'
}`

    navigator.clipboard.writeText(summary).then(() => {
      toast({
        type: 'success',
        title: 'Analytics copied',
        description: 'Analytics summary copied to clipboard'
      })
    })
  }, [pattern, language, flags, matchAnalytics, performanceMetrics, toast])

  if (!isOpen) return null

  const performanceRating = getPerformanceRating(performanceMetrics.throughput)
  const complexityLevel = getComplexityLevel(performanceMetrics.complexityScore)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Advanced Analytics
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Detailed match statistics and performance insights
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Pattern Info */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div><strong>Pattern:</strong> <code className="font-mono bg-muted px-1 py-0.5 rounded break-all">{pattern}</code></div>
              <div><strong>Language:</strong> {language}</div>
              <div><strong>Flags:</strong> {flags.join('') || 'none'}</div>
            </div>
          </div>

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{matchAnalytics.totalMatches}</div>
              <div className="text-xs text-muted-foreground">Total Matches</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${performanceRating.color}`}>{performanceMetrics.throughput.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Chars/ms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{matchAnalytics.coveragePercentage.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Coverage</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${complexityLevel.color}`}>{performanceMetrics.complexityScore}</div>
              <div className="text-xs text-muted-foreground">Complexity</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Match Analytics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Match Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Matches</div>
                    <div className="font-semibold">{matchAnalytics.totalMatches}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Unique Matches</div>
                    <div className="font-semibold">{matchAnalytics.uniqueMatches}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg Length</div>
                    <div className="font-semibold">{matchAnalytics.averageMatchLength.toFixed(1)} chars</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Match Density</div>
                    <div className="font-semibold">{matchAnalytics.matchDensity.toFixed(1)}/1000</div>
                  </div>
                </div>

                {matchAnalytics.totalMatches > 0 && (
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Coverage</div>
                      <Progress value={matchAnalytics.coveragePercentage} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {matchAnalytics.coveragePercentage.toFixed(1)}% of text matched
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Shortest Match</div>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{matchAnalytics.shortestMatch}</code>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Longest Match</div>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded break-all">{matchAnalytics.longestMatch}</code>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Execution Time</div>
                    <div className="font-semibold">{performanceMetrics.executionTime.toFixed(2)}ms</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Characters</div>
                    <div className="font-semibold">{performanceMetrics.charactersProcessed.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Throughput</div>
                    <div className="font-semibold">{performanceMetrics.throughput.toFixed(0)} chars/ms</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Memory Est.</div>
                    <div className="font-semibold">{(performanceMetrics.memoryEstimate / 1024).toFixed(1)} KB</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Performance Rating</span>
                    <Badge className={`${performanceRating.color} bg-transparent border`}>
                      {performanceRating.rating}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{performanceRating.description}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Complexity Level</span>
                    <Badge className={`${complexityLevel.color} bg-transparent border`}>
                      {complexityLevel.level}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Capture Groups Analysis */}
          {matchAnalytics.captureGroupStats.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Capture Groups Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {matchAnalytics.captureGroupStats.map((group) => (
                    <div key={group.groupIndex} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Group ${group.groupIndex}</span>
                        <Badge variant="outline">{group.uniqueValues} unique values</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Most Common</div>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">{group.mostCommon}</code>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Frequency</div>
                          <div>{group.frequency} times</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Optimization Suggestions */}
          {performanceMetrics.optimizationSuggestions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Optimization Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {performanceMetrics.optimizationSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                      {suggestion.includes('Excellent') ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                      )}
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button onClick={copyAnalyticsSummary} variant="outline" size="sm">
              <Copy className="h-3 w-3 mr-1" />
              Copy Summary
            </Button>
            <Button onClick={exportAnalytics} variant="outline" size="sm">
              <Download className="h-3 w-3 mr-1" />
              Export JSON
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 