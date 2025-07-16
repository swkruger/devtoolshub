export interface PatternComponent {
  type: 'literal' | 'characterClass' | 'quantifier' | 'group' | 'anchor' | 'assertion' | 'backreference' | 'escape'
  value: string
  description: string
  position: { start: number; end: number }
  children?: PatternComponent[]
}

export interface PatternAnalysis {
  components: PatternComponent[]
  summary: string
  complexity: 'simple' | 'moderate' | 'complex' | 'very complex'
  warnings: string[]
  suggestions: string[]
}

// Common regex constructs and their explanations
const REGEX_CONSTRUCTS = {
  // Character classes
  '\\d': 'Matches any digit (0-9)',
  '\\D': 'Matches any non-digit character',
  '\\w': 'Matches any word character (letters, digits, underscore)',
  '\\W': 'Matches any non-word character',
  '\\s': 'Matches any whitespace character (space, tab, newline)',
  '\\S': 'Matches any non-whitespace character',
  '.': 'Matches any character except newline',
  
  // Anchors
  '^': 'Matches the start of a line/string',
  '$': 'Matches the end of a line/string',
  '\\b': 'Matches a word boundary',
  '\\B': 'Matches a non-word boundary',
  
  // Quantifiers
  '*': 'Matches 0 or more of the preceding element',
  '+': 'Matches 1 or more of the preceding element',
  '?': 'Matches 0 or 1 of the preceding element (optional)',
  '{n}': 'Matches exactly n occurrences',
  '{n,}': 'Matches n or more occurrences',
  '{n,m}': 'Matches between n and m occurrences',
  
  // Groups
  '(...)': 'Capturing group - groups elements and captures the match',
  '(?:...)': 'Non-capturing group - groups elements without capturing',
  '(?=...)': 'Positive lookahead - matches if followed by the pattern',
  '(?!...)': 'Negative lookahead - matches if not followed by the pattern',
  '(?<=...)': 'Positive lookbehind - matches if preceded by the pattern',
  '(?<!...)': 'Negative lookbehind - matches if not preceded by the pattern',
}

export function analyzePattern(pattern: string): PatternAnalysis {
  if (!pattern) {
    return {
      components: [],
      summary: 'No pattern provided',
      complexity: 'simple',
      warnings: [],
      suggestions: ['Enter a regex pattern to see its analysis']
    }
  }

  const components: PatternComponent[] = []
  const warnings: string[] = []
  const suggestions: string[] = []
  let complexity: PatternAnalysis['complexity'] = 'simple'
  let position = 0

  try {
    // Basic pattern parsing
    while (position < pattern.length) {
      const char = pattern[position]
      const nextChar = pattern[position + 1]
      
      if (char === '\\' && nextChar) {
        // Escape sequences
        const escapeSeq = char + nextChar
        const description = REGEX_CONSTRUCTS[escapeSeq as keyof typeof REGEX_CONSTRUCTS] || `Escaped character: ${nextChar}`
        
        components.push({
          type: 'escape',
          value: escapeSeq,
          description,
          position: { start: position, end: position + 1 }
        })
        
        position += 2
      } else if (char === '[') {
        // Character class
        const classEnd = findMatchingBracket(pattern, position)
        const value = pattern.slice(position, classEnd + 1)
        
        components.push({
          type: 'characterClass',
          value,
          description: analyzeCharacterClass(value),
          position: { start: position, end: classEnd }
        })
        
        position = classEnd + 1
        complexity = 'moderate'
      } else if (char === '(') {
        // Group
        const groupEnd = findMatchingParen(pattern, position)
        const value = pattern.slice(position, groupEnd + 1)
        const groupType = analyzeGroupType(value)
        
        components.push({
          type: 'group',
          value,
          description: groupType.description,
          position: { start: position, end: groupEnd }
        })
        
        position = groupEnd + 1
        if (groupType.isLookaround) complexity = 'complex'
      } else if ('*+?{'.includes(char)) {
        // Quantifiers
        let quantifierEnd = position
        if (char === '{') {
          quantifierEnd = pattern.indexOf('}', position)
          if (quantifierEnd === -1) quantifierEnd = position
        }
        
        const value = pattern.slice(position, quantifierEnd + 1)
        const description = analyzeQuantifier(value)
        
        components.push({
          type: 'quantifier',
          value,
          description,
          position: { start: position, end: quantifierEnd }
        })
        
        position = quantifierEnd + 1
        
        // Check for potential catastrophic backtracking
        if ((char === '*' || char === '+') && components.length > 1) {
          const prevComponent = components[components.length - 2]
          if (prevComponent.type === 'quantifier') {
            warnings.push('Potential catastrophic backtracking: consecutive quantifiers')
            complexity = 'very complex'
          }
        }
      } else if ('^$'.includes(char)) {
        // Anchors
        components.push({
          type: 'anchor',
          value: char,
          description: REGEX_CONSTRUCTS[char as keyof typeof REGEX_CONSTRUCTS] || 'Anchor',
          position: { start: position, end: position }
        })
        
        position += 1
      } else if (char === '.') {
        // Dot metacharacter
        components.push({
          type: 'literal',
          value: char,
          description: REGEX_CONSTRUCTS[char],
          position: { start: position, end: position }
        })
        
        position += 1
        complexity = 'moderate'
      } else {
        // Literal character
        components.push({
          type: 'literal',
          value: char,
          description: `Matches the literal character "${char}"`,
          position: { start: position, end: position }
        })
        
        position += 1
      }
    }

    // Generate suggestions
    if (pattern.includes('.*.*')) {
      suggestions.push('Consider using more specific patterns instead of multiple .* sequences')
    }
    
    if (pattern.length > 50) {
      suggestions.push('Consider breaking down complex patterns into smaller, reusable parts')
      complexity = 'complex'
    }
    
    if (!pattern.includes('^') && !pattern.includes('$')) {
      suggestions.push('Consider adding anchors (^ and $) for more precise matching')
    }

    // Generate summary
    const summary = generateSummary(components, pattern)

    return {
      components,
      summary,
      complexity,
      warnings,
      suggestions
    }
  } catch (error) {
    return {
      components: [],
      summary: 'Error analyzing pattern',
      complexity: 'simple',
      warnings: ['Invalid regex pattern'],
      suggestions: ['Check your regex syntax']
    }
  }
}

function findMatchingBracket(pattern: string, start: number): number {
  let depth = 0
  for (let i = start; i < pattern.length; i++) {
    if (pattern[i] === '[') depth++
    if (pattern[i] === ']') depth--
    if (depth === 0) return i
  }
  return pattern.length - 1
}

function findMatchingParen(pattern: string, start: number): number {
  let depth = 0
  for (let i = start; i < pattern.length; i++) {
    if (pattern[i] === '(') depth++
    if (pattern[i] === ')') depth--
    if (depth === 0) return i
  }
  return pattern.length - 1
}

function analyzeCharacterClass(value: string): string {
  if (value.startsWith('[^')) {
    return `Negated character class: matches any character NOT in the set ${value.slice(2, -1)}`
  }
  
  const inner = value.slice(1, -1)
  
  if (inner.includes('-')) {
    return `Character class: matches any character in the range/set ${inner}`
  }
  
  return `Character class: matches any of these characters: ${inner}`
}

function analyzeGroupType(value: string): { description: string; isLookaround: boolean } {
  if (value.startsWith('(?:')) {
    return { description: 'Non-capturing group: groups elements without capturing the match', isLookaround: false }
  }
  
  if (value.startsWith('(?=')) {
    return { description: 'Positive lookahead: matches if followed by the enclosed pattern', isLookaround: true }
  }
  
  if (value.startsWith('(?!')) {
    return { description: 'Negative lookahead: matches if NOT followed by the enclosed pattern', isLookaround: true }
  }
  
  if (value.startsWith('(?<=')) {
    return { description: 'Positive lookbehind: matches if preceded by the enclosed pattern', isLookaround: true }
  }
  
  if (value.startsWith('(?<!')) {
    return { description: 'Negative lookbehind: matches if NOT preceded by the enclosed pattern', isLookaround: true }
  }
  
  return { description: 'Capturing group: groups elements and captures the match for later use', isLookaround: false }
}

function analyzeQuantifier(value: string): string {
  if (value === '*') return 'Zero or more repetitions (greedy)'
  if (value === '+') return 'One or more repetitions (greedy)'
  if (value === '?') return 'Zero or one repetition (optional)'
  if (value === '*?') return 'Zero or more repetitions (lazy/non-greedy)'
  if (value === '+?') return 'One or more repetitions (lazy/non-greedy)'
  if (value === '??') return 'Zero or one repetition (lazy/non-greedy)'
  
  if (value.startsWith('{') && value.endsWith('}')) {
    const inner = value.slice(1, -1)
    if (inner.includes(',')) {
      const [min, max] = inner.split(',')
      if (max === '') return `${min} or more repetitions`
      return `Between ${min} and ${max} repetitions`
    }
    return `Exactly ${inner} repetitions`
  }
  
  return `Quantifier: ${value}`
}

function generateSummary(components: PatternComponent[], pattern: string): string {
  if (components.length === 0) return 'Empty pattern'
  
  const hasAnchors = components.some(c => c.type === 'anchor')
  const hasGroups = components.some(c => c.type === 'group')
  const hasQuantifiers = components.some(c => c.type === 'quantifier')
  const hasCharClasses = components.some(c => c.type === 'characterClass')
  
  let summary = 'This pattern '
  
  if (hasAnchors) summary += 'uses anchors for position matching, '
  if (hasGroups) summary += 'contains groups for capturing/organization, '
  if (hasQuantifiers) summary += 'uses quantifiers for repetition, '
  if (hasCharClasses) summary += 'includes character classes for flexible matching, '
  
  summary = summary.replace(/, $/, '')
  summary += `. Total length: ${pattern.length} characters.`
  
  return summary
} 