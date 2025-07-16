"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  AlertTriangle, 
  Lightbulb, 
  Target, 
  Type, 
  Hash, 
  Brackets, 
  Layers,
  Anchor,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PatternAnalysis, PatternComponent } from '../lib/pattern-analyzer'

interface PatternExplanationProps {
  analysis: PatternAnalysis | null
  pattern: string
  onClose: () => void
}

export function PatternExplanation({ analysis, pattern, onClose }: PatternExplanationProps) {
  if (!analysis) return null

  const getComponentIcon = (type: PatternComponent['type']) => {
    switch (type) {
      case 'literal': return <Type className="w-4 h-4" />
      case 'characterClass': return <Brackets className="w-4 h-4" />
      case 'quantifier': return <Hash className="w-4 h-4" />
      case 'group': return <Layers className="w-4 h-4" />
      case 'anchor': return <Anchor className="w-4 h-4" />
      case 'escape': return <Target className="w-4 h-4" />
      default: return <Type className="w-4 h-4" />
    }
  }

  const getComplexityColor = (complexity: PatternAnalysis['complexity']) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800 border-green-200'
      case 'moderate': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'complex': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'very complex': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getComponentTypeColor = (type: PatternComponent['type']) => {
    switch (type) {
      case 'literal': return 'bg-gray-100 text-gray-800'
      case 'characterClass': return 'bg-blue-100 text-blue-800'
      case 'quantifier': return 'bg-purple-100 text-purple-800'
      case 'group': return 'bg-green-100 text-green-800'
      case 'anchor': return 'bg-yellow-100 text-yellow-800'
      case 'escape': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="mt-6 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Pattern Explanation
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Pattern Display */}
        <div>
          <h4 className="font-medium mb-2">Analyzing Pattern:</h4>
          <div className="font-mono text-lg bg-white dark:bg-gray-900 p-3 rounded-lg border break-all">
            <span className="text-blue-600 dark:text-blue-400">{pattern}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Length: {pattern.length} characters | Components: {analysis.components.length}
          </div>
        </div>

        {/* Summary & Complexity */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Summary:</h4>
            <p className="text-sm text-muted-foreground">{analysis.summary}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Complexity:</h4>
            <Badge className={getComplexityColor(analysis.complexity)}>
              {analysis.complexity.charAt(0).toUpperCase() + analysis.complexity.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Pattern Components Breakdown */}
        {analysis.components.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Pattern Breakdown:</h4>
            <div className="space-y-3">
              {analysis.components.map((component, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getComponentIcon(component.type)}
                    <code className="font-mono font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                      {component.value}
                    </code>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getComponentTypeColor(component.type)}`}
                    >
                      {component.type}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">
                      {component.description}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      Position: {component.position.start}-{component.position.end}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {analysis.warnings.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Warnings:
            </h4>
            <div className="space-y-2">
              {analysis.warnings.map((warning, index) => (
                <Alert key={index} className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{warning}</AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {analysis.suggestions.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-blue-500" />
              Suggestions:
            </h4>
            <div className="space-y-2">
              {analysis.suggestions.map((suggestion, index) => (
                <Alert key={index} className="border-blue-200 bg-blue-50">
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>{suggestion}</AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Component Types Legend:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Type className="w-3 h-3" />
              <span>Literal</span>
            </div>
            <div className="flex items-center gap-2">
              <Brackets className="w-3 h-3" />
              <span>Character Class</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="w-3 h-3" />
              <span>Quantifier</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-3 h-3" />
              <span>Group</span>
            </div>
            <div className="flex items-center gap-2">
              <Anchor className="w-3 h-3" />
              <span>Anchor</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-3 h-3" />
              <span>Escape</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 