"use client"

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Workflow, 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface RegexNode {
  id: string
  type: 'literal' | 'group' | 'quantifier' | 'anchor' | 'class' | 'alternation' | 'assertion'
  value: string
  description: string
  children?: RegexNode[]
  position: { x: number; y: number }
  isOptional?: boolean
  isRepeating?: boolean
  color: string
}

interface RegexVisualizerProps {
  isOpen: boolean
  onClose: () => void
  pattern: string
  isPremiumUser: boolean
}

export function RegexVisualizer({ isOpen, onClose, pattern, isPremiumUser }: RegexVisualizerProps) {
  const { toast } = useToast()
  const [zoom, setZoom] = useState(1)
  const [showTooltips, setShowTooltips] = useState(true)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  // Parse regex pattern into visual nodes
  const visualNodes = useMemo((): RegexNode[] => {
    if (!pattern) return []

    const nodes: RegexNode[] = []
    let nodeId = 0
    let xPosition = 50

    const getNextId = () => `node_${nodeId++}`
    const getColor = (type: RegexNode['type']) => {
      switch (type) {
        case 'literal': return '#3b82f6' // blue
        case 'group': return '#10b981' // green
        case 'quantifier': return '#f59e0b' // yellow
        case 'anchor': return '#ef4444' // red
        case 'class': return '#8b5cf6' // purple
        case 'alternation': return '#f97316' // orange
        case 'assertion': return '#06b6d4' // cyan
        default: return '#6b7280' // gray
      }
    }

    const parsePattern = (patternStr: string, yPosition: number = 100): RegexNode[] => {
      const localNodes: RegexNode[] = []
      let i = 0
      let currentX = xPosition

      while (i < patternStr.length) {
        const char = patternStr[i]
        const nextChar = patternStr[i + 1]

        if (char === '\\' && nextChar) {
          // Escape sequence
          const escapeSeq = char + nextChar
          const descriptions: Record<string, string> = {
            '\\d': 'Any digit (0-9)',
            '\\D': 'Any non-digit',
            '\\w': 'Word character',
            '\\W': 'Non-word character',
            '\\s': 'Whitespace',
            '\\S': 'Non-whitespace',
            '\\b': 'Word boundary',
            '\\B': 'Non-word boundary',
            '\\.': 'Literal dot',
            '\\\\': 'Literal backslash'
          }

          localNodes.push({
            id: getNextId(),
            type: 'literal',
            value: escapeSeq,
            description: descriptions[escapeSeq] || `Escaped character: ${nextChar}`,
            position: { x: currentX, y: yPosition },
            color: getColor('literal')
          })

          currentX += 120
          i += 2
        } else if (char === '[') {
          // Character class
          let classEnd = i + 1
          let bracketCount = 1
          while (classEnd < patternStr.length && bracketCount > 0) {
            if (patternStr[classEnd] === '[') bracketCount++
            if (patternStr[classEnd] === ']') bracketCount--
            classEnd++
          }

          const classContent = patternStr.slice(i, classEnd)
          localNodes.push({
            id: getNextId(),
            type: 'class',
            value: classContent,
            description: classContent.startsWith('[^') 
              ? `Not in set: ${classContent.slice(2, -1)}`
              : `Character class: ${classContent.slice(1, -1)}`,
            position: { x: currentX, y: yPosition },
            color: getColor('class')
          })

          currentX += 140
          i = classEnd
        } else if (char === '(') {
          // Group
          let groupEnd = i + 1
          let parenCount = 1
          while (groupEnd < patternStr.length && parenCount > 0) {
            if (patternStr[groupEnd] === '(') parenCount++
            if (patternStr[groupEnd] === ')') parenCount--
            groupEnd++
          }

          const groupContent = patternStr.slice(i + 1, groupEnd - 1)
          const isNonCapturing = groupContent.startsWith('?:')
          const isLookahead = groupContent.startsWith('?=') || groupContent.startsWith('?!')
          const isLookbehind = groupContent.startsWith('?<=') || groupContent.startsWith('?<!')

          let groupType = 'Capturing group'
          if (isNonCapturing) groupType = 'Non-capturing group'
          if (isLookahead) groupType = groupContent.startsWith('?=') ? 'Positive lookahead' : 'Negative lookahead'
          if (isLookbehind) groupType = groupContent.startsWith('?<=') ? 'Positive lookbehind' : 'Negative lookbehind'

          const groupNode: RegexNode = {
            id: getNextId(),
            type: 'group',
            value: patternStr.slice(i, groupEnd),
            description: groupType,
            position: { x: currentX, y: yPosition },
            color: getColor('group'),
            children: parsePattern(groupContent.replace(/^\?\?[=!<]/, ''), yPosition + 80)
          }

          localNodes.push(groupNode)
          currentX += 160
          i = groupEnd
        } else if ('*+?{'.includes(char)) {
          // Quantifier
          let quantifierEnd = i
          if (char === '{') {
            quantifierEnd = patternStr.indexOf('}', i)
            if (quantifierEnd === -1) quantifierEnd = i
          }

          const quantifier = patternStr.slice(i, quantifierEnd + 1)
          const descriptions: Record<string, string> = {
            '*': 'Zero or more',
            '+': 'One or more',
            '?': 'Zero or one (optional)',
            '*?': 'Zero or more (lazy)',
            '+?': 'One or more (lazy)',
            '??': 'Zero or one (lazy)'
          }

          // Attach quantifier to previous node if exists
          if (localNodes.length > 0) {
            const lastNode = localNodes[localNodes.length - 1]
            lastNode.isRepeating = true
            if (char === '?') lastNode.isOptional = true
            
            // Add quantifier as separate visual element
            localNodes.push({
              id: getNextId(),
              type: 'quantifier',
              value: quantifier,
              description: descriptions[quantifier] || `Repeat ${quantifier}`,
              position: { x: currentX, y: yPosition - 30 },
              color: getColor('quantifier')
            })
          }

          currentX += 80
          i = quantifierEnd + 1
        } else if ('^$'.includes(char)) {
          // Anchors
          const descriptions: Record<string, string> = {
            '^': 'Start of line/string',
            '$': 'End of line/string'
          }

          localNodes.push({
            id: getNextId(),
            type: 'anchor',
            value: char,
            description: descriptions[char],
            position: { x: currentX, y: yPosition },
            color: getColor('anchor')
          })

          currentX += 100
          i++
        } else if (char === '|') {
          // Alternation
          localNodes.push({
            id: getNextId(),
            type: 'alternation',
            value: '|',
            description: 'OR (alternation)',
            position: { x: currentX, y: yPosition },
            color: getColor('alternation')
          })

          currentX += 80
          i++
        } else if (char === '.') {
          // Dot metacharacter
          localNodes.push({
            id: getNextId(),
            type: 'class',
            value: '.',
            description: 'Any character (except newline)',
            position: { x: currentX, y: yPosition },
            color: getColor('class')
          })

          currentX += 100
          i++
        } else {
          // Literal character
          localNodes.push({
            id: getNextId(),
            type: 'literal',
            value: char,
            description: `Literal character: "${char}"`,
            position: { x: currentX, y: yPosition },
            color: getColor('literal')
          })

          currentX += 80
          i++
        }
      }

      xPosition = Math.max(xPosition, currentX)
      return localNodes
    }

    return parsePattern(pattern)
  }, [pattern])

  const exportSVG = () => {
    const svg = document.getElementById('regex-visualization')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)
    
    const downloadLink = document.createElement('a')
    downloadLink.href = svgUrl
    downloadLink.download = `regex-visualization-${new Date().toISOString().split('T')[0]}.svg`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(svgUrl)

    toast({
      type: 'success',
      title: 'Visualization exported',
      description: 'Regex diagram saved as SVG file'
    })
  }

  const renderNode = (node: RegexNode) => {
    const isSelected = selectedNode === node.id
    const strokeWidth = isSelected ? 3 : 1
    const opacity = isSelected ? 1 : 0.9

    return (
      <g key={node.id}>
        {/* Node rectangle */}
        <rect
          x={node.position.x * zoom}
          y={node.position.y * zoom}
          width={100 * zoom}
          height={40 * zoom}
          fill={node.color}
          stroke={isSelected ? '#000' : '#fff'}
          strokeWidth={strokeWidth}
          rx={5 * zoom}
          opacity={opacity}
          className="cursor-pointer"
          onClick={() => setSelectedNode(isSelected ? null : node.id)}
        />

        {/* Node text */}
        <text
          x={(node.position.x + 50) * zoom}
          y={(node.position.y + 25) * zoom}
          textAnchor="middle"
          fill="white"
          fontSize={12 * zoom}
          fontWeight="bold"
          className="pointer-events-none"
        >
          {node.value.length > 8 ? node.value.slice(0, 8) + '...' : node.value}
        </text>

        {/* Optional indicator */}
        {node.isOptional && (
          <circle
            cx={(node.position.x + 90) * zoom}
            cy={(node.position.y + 10) * zoom}
            r={4 * zoom}
            fill="#fbbf24"
            stroke="#fff"
            strokeWidth={1}
          />
        )}

        {/* Repeating indicator */}
        {node.isRepeating && (
          <circle
            cx={(node.position.x + 90) * zoom}
            cy={(node.position.y + 30) * zoom}
            r={4 * zoom}
            fill="#06b6d4"
            stroke="#fff"
            strokeWidth={1}
          />
        )}

        {/* Tooltip */}
        {showTooltips && isSelected && (
          <g>
            <rect
              x={node.position.x * zoom}
              y={(node.position.y - 60) * zoom}
              width={200 * zoom}
              height={50 * zoom}
              fill="#1f2937"
              stroke="#374151"
              strokeWidth={1}
              rx={5 * zoom}
              opacity={0.95}
            />
            <text
              x={(node.position.x + 10) * zoom}
              y={(node.position.y - 35) * zoom}
              fill="#fff"
              fontSize={10 * zoom}
            >
              {node.description}
            </text>
            <text
              x={(node.position.x + 10) * zoom}
              y={(node.position.y - 20) * zoom}
              fill="#9ca3af"
              fontSize={8 * zoom}
            >
              Type: {node.type}
            </text>
          </g>
        )}

        {/* Connection lines to children */}
        {node.children?.map((child, index) => (
          <line
            key={`connection-${node.id}-${child.id}`}
            x1={(node.position.x + 50) * zoom}
            y1={(node.position.y + 40) * zoom}
            x2={(child.position.x + 50) * zoom}
            y2={child.position.y * zoom}
            stroke="#6b7280"
            strokeWidth={2}
            markerEnd="url(#arrowhead)"
          />
        ))}

        {/* Render children */}
        {node.children?.map(child => renderNode(child))}
      </g>
    )
  }

  if (!isOpen) return null

  // Calculate SVG dimensions based on node positions
  const maxX = visualNodes.length > 0 
    ? Math.max(...visualNodes.map(node => node.position.x)) + 150 
    : 800
  const maxY = visualNodes.length > 0 
    ? Math.max(...visualNodes.map(node => node.position.y)) + 100 
    : 300
    
  const svgWidth = Math.max(800, maxX * zoom)
  const svgHeight = Math.max(400, maxY * zoom)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-blue-600" />
                Regex Visualization
                {!isPremiumUser && (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                    Premium
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Interactive flow diagram of your regex pattern
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Pattern Display */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm">
              <strong>Pattern:</strong> <code className="font-mono bg-muted px-1 py-0.5 rounded break-all">{pattern}</code>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
                variant="outline"
                size="sm"
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <span className="text-sm font-mono min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                onClick={() => setZoom(Math.min(2, zoom + 0.2))}
                variant="outline"
                size="sm"
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => setZoom(1)}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowTooltips(!showTooltips)}
                variant="outline"
                size="sm"
              >
                {showTooltips ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                Tooltips
              </Button>
              <Button onClick={exportSVG} variant="outline" size="sm">
                <Download className="h-3 w-3 mr-1" />
                Export SVG
              </Button>
            </div>
          </div>

          {/* Visualization */}
          <div className="border rounded-lg overflow-auto" style={{ maxHeight: '500px' }}>
            {visualNodes.length > 0 ? (
              <svg
                id="regex-visualization"
                width={svgWidth}
                height={svgHeight}
                className="bg-white"
              >
                {/* Arrow marker definition */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#6b7280"
                    />
                  </marker>
                </defs>

                {/* Render all nodes */}
                {visualNodes.map(node => renderNode(node))}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter a regex pattern to see its visualization</p>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          {visualNodes.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Legend</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Literal Characters</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Groups</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>Quantifiers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Anchors</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span>Character Classes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span>Alternation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Optional</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Repeating</span>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
            <strong>Instructions:</strong> Click on nodes to see detailed descriptions. 
            Use zoom controls to adjust the view. Export as SVG for presentations or documentation.
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 