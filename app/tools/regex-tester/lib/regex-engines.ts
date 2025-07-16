// Regex Engine implementations for different programming languages
// Each engine simulates how regex behaves in different language environments

export interface RegexMatch {
  match: string
  index: number
  groups: string[]
  namedGroups?: Record<string, string>
  input: string
}

export interface RegexTestResult {
  matches: RegexMatch[]
  isValid: boolean
  error?: string
  executionTime?: number
  flags: string[]
}

export type RegexLanguage = 'javascript' | 'python' | 'java' | 'go' | 'php' | 'csharp'

export interface RegexEngine {
  test(pattern: string, text: string, flags?: string[]): RegexTestResult
  validate(pattern: string, flags?: string[]): { isValid: boolean; error?: string }
  getSupportedFlags(): string[]
  getLanguageName(): string
  getLanguageNotes(): string[]
}

// JavaScript Regex Engine (Native)
export class JavaScriptRegexEngine implements RegexEngine {
  getLanguageName(): string {
    return 'JavaScript'
  }

  getLanguageNotes(): string[] {
    return [
      'Uses native JavaScript RegExp engine',
      'Supports Unicode flag (u) for full Unicode support',
      'Supports sticky flag (y) for advanced matching',
      'Lookahead and lookbehind assertions supported'
    ]
  }

  getSupportedFlags(): string[] {
    return ['g', 'i', 'm', 's', 'u', 'y']
  }

  validate(pattern: string, flags: string[] = []): { isValid: boolean; error?: string } {
    try {
      new RegExp(pattern, flags.join(''))
      return { isValid: true }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid regex pattern'
      }
    }
  }

  test(pattern: string, text: string, flags: string[] = []): RegexTestResult {
    const startTime = performance.now()
    
    try {
      const flagString = flags.join('')
      const regex = new RegExp(pattern, flagString)
      const matches: RegexMatch[] = []
      
      if (flags.includes('g')) {
        // Global matching
        let match
        while ((match = regex.exec(text)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups,
            input: text
          })
          
          // Prevent infinite loop on zero-length matches
          if (match[0].length === 0) {
            regex.lastIndex++
          }
        }
      } else {
        // Single match
        const match = regex.exec(text)
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups,
            input: text
          })
        }
      }

      const executionTime = performance.now() - startTime

      return {
        matches,
        isValid: true,
        executionTime,
        flags
      }
    } catch (error) {
      return {
        matches: [],
        isValid: false,
        error: error instanceof Error ? error.message : 'Pattern execution failed',
        flags
      }
    }
  }
}

// Python Regex Engine (Simulated)
export class PythonRegexEngine implements RegexEngine {
  getLanguageName(): string {
    return 'Python (re module)'
  }

  getLanguageNotes(): string[] {
    return [
      'Simulates Python re module behavior',
      'Different handling of word boundaries',
      'Different Unicode handling compared to JavaScript',
      'No sticky flag equivalent',
      'Supports verbose mode (x flag) for readable patterns'
    ]
  }

  getSupportedFlags(): string[] {
    return ['g', 'i', 'm', 's', 'x', 'a']  // g=findall equivalent, a=ASCII-only
  }

  validate(pattern: string, flags: string[] = []): { isValid: boolean; error?: string } {
    try {
      // Basic validation - in real implementation, this would use a Python regex parser
      new RegExp(pattern, flags.filter(f => ['g', 'i', 'm', 's'].includes(f)).join(''))
      return { isValid: true }
    } catch (error) {
      return {
        isValid: false,
        error: 'Python regex validation: ' + (error instanceof Error ? error.message : 'Invalid pattern')
      }
    }
  }

  test(pattern: string, text: string, flags: string[] = []): RegexTestResult {
    const startTime = performance.now()
    
    try {
      // Convert Python flags to JavaScript equivalent
      const jsFlags = flags.filter(f => ['i', 'm', 's'].includes(f))
      if (flags.includes('g')) jsFlags.push('g')
      
      const regex = new RegExp(pattern, jsFlags.join(''))
      const matches: RegexMatch[] = []
      
      // Python-specific behavior simulation
      if (flags.includes('g') || flags.includes('findall')) {
        let match
        while ((match = regex.exec(text)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            input: text
          })
          
          if (match[0].length === 0) {
            regex.lastIndex++
          }
        }
      } else {
        const match = regex.exec(text)
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            input: text
          })
        }
      }

      const executionTime = performance.now() - startTime

      return {
        matches,
        isValid: true,
        executionTime,
        flags
      }
    } catch (error) {
      return {
        matches: [],
        isValid: false,
        error: 'Python regex error: ' + (error instanceof Error ? error.message : 'Pattern execution failed'),
        flags
      }
    }
  }
}

// Java Regex Engine (Simulated)
export class JavaRegexEngine implements RegexEngine {
  getLanguageName(): string {
    return 'Java (Pattern class)'
  }

  getLanguageNotes(): string[] {
    return [
      'Simulates Java Pattern.compile() behavior',
      'Different escaping requirements',
      'Unicode support requires explicit flags',
      'Different word boundary behavior',
      'No sticky flag equivalent'
    ]
  }

  getSupportedFlags(): string[] {
    return ['g', 'i', 'm', 's', 'u', 'd', 'x']  // d=Unix lines, x=comments
  }

  validate(pattern: string, flags: string[] = []): { isValid: boolean; error?: string } {
    try {
      new RegExp(pattern, flags.filter(f => ['g', 'i', 'm', 's'].includes(f)).join(''))
      return { isValid: true }
    } catch (error) {
      return {
        isValid: false,
        error: 'Java regex validation: ' + (error instanceof Error ? error.message : 'Invalid pattern')
      }
    }
  }

  test(pattern: string, text: string, flags: string[] = []): RegexTestResult {
    const startTime = performance.now()
    
    try {
      const jsFlags = flags.filter(f => ['i', 'm', 's'].includes(f))
      if (flags.includes('g')) jsFlags.push('g')
      
      const regex = new RegExp(pattern, jsFlags.join(''))
      const matches: RegexMatch[] = []
      
      if (flags.includes('g')) {
        let match
        while ((match = regex.exec(text)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            input: text
          })
          
          if (match[0].length === 0) {
            regex.lastIndex++
          }
        }
      } else {
        const match = regex.exec(text)
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            input: text
          })
        }
      }

      const executionTime = performance.now() - startTime

      return {
        matches,
        isValid: true,
        executionTime,
        flags
      }
    } catch (error) {
      return {
        matches: [],
        isValid: false,
        error: 'Java regex error: ' + (error instanceof Error ? error.message : 'Pattern execution failed'),
        flags
      }
    }
  }
}

// Go Regex Engine (Simulated - RE2 based)
export class GoRegexEngine implements RegexEngine {
  getLanguageName(): string {
    return 'Go (RE2 engine)'
  }

  getLanguageNotes(): string[] {
    return [
      'Simulates Go RE2 engine behavior',
      'No backreferences support',
      'No lookahead/lookbehind assertions',
      'Linear time complexity guaranteed',
      'Different syntax for some constructs'
    ]
  }

  getSupportedFlags(): string[] {
    return ['g', 'i', 'm', 's']  // Limited flag support in RE2
  }

  validate(pattern: string, flags: string[] = []): { isValid: boolean; error?: string } {
    try {
      // Check for unsupported features
      if (pattern.includes('(?=') || pattern.includes('(?!') || 
          pattern.includes('(?<=') || pattern.includes('(?<!')) {
        return {
          isValid: false,
          error: 'Go RE2 engine does not support lookahead/lookbehind assertions'
        }
      }
      
      if (pattern.includes('\\1') || pattern.includes('\\2')) {
        return {
          isValid: false,
          error: 'Go RE2 engine does not support backreferences'
        }
      }
      
      new RegExp(pattern, flags.filter(f => ['g', 'i', 'm', 's'].includes(f)).join(''))
      return { isValid: true }
    } catch (error) {
      return {
        isValid: false,
        error: 'Go regex validation: ' + (error instanceof Error ? error.message : 'Invalid pattern')
      }
    }
  }

  test(pattern: string, text: string, flags: string[] = []): RegexTestResult {
    const validation = this.validate(pattern, flags)
    if (!validation.isValid) {
      return {
        matches: [],
        isValid: false,
        error: validation.error,
        flags
      }
    }

    const startTime = performance.now()
    
    try {
      const jsFlags = flags.filter(f => ['i', 'm', 's'].includes(f))
      if (flags.includes('g')) jsFlags.push('g')
      
      const regex = new RegExp(pattern, jsFlags.join(''))
      const matches: RegexMatch[] = []
      
      if (flags.includes('g')) {
        let match
        while ((match = regex.exec(text)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            input: text
          })
          
          if (match[0].length === 0) {
            regex.lastIndex++
          }
        }
      } else {
        const match = regex.exec(text)
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            input: text
          })
        }
      }

      const executionTime = performance.now() - startTime

      return {
        matches,
        isValid: true,
        executionTime,
        flags
      }
    } catch (error) {
      return {
        matches: [],
        isValid: false,
        error: 'Go regex error: ' + (error instanceof Error ? error.message : 'Pattern execution failed'),
        flags
      }
    }
  }
}

// Factory function to get regex engines
export function getRegexEngine(language: RegexLanguage): RegexEngine {
  switch (language) {
    case 'javascript':
      return new JavaScriptRegexEngine()
    case 'python':
      return new PythonRegexEngine()
    case 'java':
      return new JavaRegexEngine()
    case 'go':
      return new GoRegexEngine()
    case 'php':
      // TODO: Implement PHP PCRE engine
      return new JavaScriptRegexEngine() // Fallback for now
    case 'csharp':
      // TODO: Implement C# .NET regex engine
      return new JavaScriptRegexEngine() // Fallback for now
    default:
      return new JavaScriptRegexEngine()
  }
}

// Common regex patterns library
export const COMMON_PATTERNS = {
  email: {
    pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
    description: 'Email address validation',
    testText: 'Contact us at support@example.com or admin@test.org for help.',
    flags: ['g', 'i']
  },
  url: {
    pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
    description: 'URL matching (HTTP/HTTPS)',
    testText: 'Visit https://www.example.com or http://test.org for more info.',
    flags: ['g', 'i']
  },
  phone: {
    pattern: '(\\+?1-?)?\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})',
    description: 'US phone number formats',
    testText: 'Call us at (555) 123-4567 or +1-555-987-6543.',
    flags: ['g']
  },
  ipAddress: {
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    description: 'IPv4 address validation',
    testText: 'Server IPs: 192.168.1.1, 10.0.0.1, and 255.255.255.255.',
    flags: ['g']
  },
  hexColor: {
    pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
    description: 'Hex color codes',
    testText: 'Colors: #FF0000, #00ff00, #00F, and #123456.',
    flags: ['g', 'i']
  },
  date: {
    pattern: '\\b\\d{1,2}[/-]\\d{1,2}[/-]\\d{4}\\b',
    description: 'Date format (MM/DD/YYYY or MM-DD-YYYY)',
    testText: 'Important dates: 12/25/2023, 01-15-2024, and 3/8/2024.',
    flags: ['g']
  },
  creditCard: {
    pattern: '\\b(?:\\d{4}[ -]?){3}\\d{4}\\b',
    description: 'Credit card number format',
    testText: 'Card numbers: 1234 5678 9012 3456 and 1234-5678-9012-3456.',
    flags: ['g']
  },
  word: {
    pattern: '\\b\\w+\\b',
    description: 'Word matching',
    testText: 'This is a sample text with various words and numbers 123.',
    flags: ['g']
  }
} 