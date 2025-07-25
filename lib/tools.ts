import { 
  FileJson, 
  Search, 
  Shield, 
  Image, 
  Hash, 
  Code,
  Clock,
  Shuffle,
  type LucideIcon,
} from "lucide-react"

export interface ToolConfig {
  id: string
  name: string
  description: string
  icon: LucideIcon
  emoji: string
  isPremium: boolean
  category: 'text' | 'crypto' | 'image' | 'utility' | 'web' | 'security' // Added 'security' category
  tags: string[]
  path: string
  shortDescription: string
  features: {
    free: string[]
    premium?: string[]
  }
}

export const toolsConfig: Record<string, ToolConfig> = {
  'json-formatter': {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and beautify JSON data with syntax highlighting',
    shortDescription: 'Format and validate JSON data',
    icon: FileJson,
    emoji: '📄',
    isPremium: false,
    category: 'text',
    tags: ['json', 'format', 'validate', 'beautify'],
    path: '/tools/json-formatter',
    features: {
      free: ['Format JSON', 'Validate syntax', 'Syntax highlighting', 'Minify JSON'],
      premium: ['Download formatted files', 'Large file support (>5MB)', 'Batch processing']
    }
  },
  'regex-tester': {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test regular expressions with live pattern matching, multi-language support, and advanced debugging features. The best regex testing tool for developers.',
    shortDescription: 'Test regex patterns with live matching',
    icon: Search,
    emoji: '🔍',
    isPremium: false,
    category: 'text',
    tags: ['regex', 'pattern', 'match', 'test', 'javascript', 'python', 'java'],
    path: '/tools/regex-tester',
    features: {
      free: ['JavaScript regex testing', 'Real-time pattern matching', 'Match highlighting', 'Basic flags support', 'Sample patterns', 'Match details with groups'],
      premium: ['Multi-language engines (Python, Java, Go, PHP, C#)', 'Pattern explanations & breakdown', 'Regex visualization diagrams', 'Pattern library (100+ examples)', 'Save & manage patterns', 'Performance metrics', 'ReDoS detection', 'Replace functionality', 'File upload testing']
    }
  },
  'jwt-decoder': {
    id: 'jwt-decoder',
    name: 'JWT Decoder/Encoder',
    description: 'Decode, encode, and verify JWTs with advanced features.',
    shortDescription: 'JWT decode, encode, verify',
    icon: Shield, // Use Shield icon as JwtIcon does not exist
    emoji: '🔐',
    isPremium: false, // Tool is accessible to all users
    category: 'security',
    tags: ['jwt', 'token', 'security', 'auth'],
    path: '/tools/jwt-decoder',
    features: {
      free: [
        'Decode JWT header, payload, signature',
        'Syntax highlighting and validation',
        'Copy decoded payload',
        'Show algorithm/type/claims',
        'Token expiry/issued-at display',
        'Load sample JWT',
        'Clear/reset editor',
        'Help panel with examples, shortcuts, tips, accessibility'
      ],
      premium: [
        'Signature verification (HS256, RS256, ES256, etc.)',
        'JWT creation/encoding',
        'Bulk decode/upload/download',
        'Token Inspector with claim explanations',
        'Save/manage JWTs (Supabase)',
        'File upload/download',
        'Advanced algorithms',
        'Premium keyboard shortcuts',
        'Expiry alerts'
      ]
    }
  },
  'image-compressor': {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Compress and optimize images with format conversion',
    shortDescription: 'Compress and optimize images',
    icon: Image,
    emoji: '📸',
    isPremium: false,
    category: 'image',
    tags: ['image', 'compress', 'optimize', 'convert'],
    path: '/tools/image-compressor',
    features: {
      free: ['Basic image compression', 'Single file upload', 'JPEG/PNG support'],
      premium: ['Advanced compression algorithms', 'Batch processing', 'All format conversion', 'Quality control settings']
    }
  },
  'uuid-generator': {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate unique identifiers in various formats',
    shortDescription: 'Generate unique identifiers',
    icon: Hash,
    emoji: '🧬',
    isPremium: false,
    category: 'utility',
    tags: ['uuid', 'unique', 'identifier', 'generate'],
    path: '/tools/uuid-generator',
    features: {
      free: ['Generate UUID v4', 'Copy to clipboard', 'Multiple formats'],
      premium: ['Bulk generation', 'Export to file', 'Custom formats']
    }
  },
  'xpath-tester': {
    id: 'xpath-tester',
    name: 'XPath Tester',
    description: 'Test XPath and CSS selectors against HTML/XML documents',
    shortDescription: 'Test XPath and CSS selectors',
    icon: Code,
    emoji: '🧪',
    isPremium: false,
    category: 'web',
    tags: ['xpath', 'css', 'selector', 'html', 'xml'],
    path: '/tools/xpath-tester',
    features: {
      free: ['Basic XPath testing', 'CSS selector testing', 'Sample HTML input'],
      premium: ['Upload HTML files', 'URL fetching & parsing', 'Advanced XPath functions', 'Result export']
    }
  },
  'timestamp-converter': {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert between different timestamp formats and timezones',
    shortDescription: 'Convert timestamp formats',
    icon: Clock,
    emoji: '⏰',
    isPremium: false,
    category: 'utility',
    tags: ['timestamp', 'epoch', 'convert', 'timezone'],
    path: '/tools/timestamp-converter',
    features: {
      free: ['Unix timestamp conversion', 'Human readable dates', 'Timezone conversion'],
      premium: ['Batch conversion', 'Multiple formats', 'Date calculations']
    }
  },
  'base64-encoder': {
    id: 'base64-encoder',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings and files',
    shortDescription: 'Encode/decode Base64 data',
    icon: Shuffle,
    emoji: '🔄',
    isPremium: false,
    category: 'text',
    tags: ['base64', 'encode', 'decode', 'convert'],
    path: '/tools/base64-encoder',
    features: {
      free: ['Text encoding/decoding', 'Copy to clipboard', 'URL safe encoding'],
      premium: ['File encoding', 'Batch processing', 'Multiple encoding formats']
    }
  }
}

// Helper functions
export const getAllTools = (): ToolConfig[] => {
  return Object.values(toolsConfig)
}

export const getToolById = (id: string): ToolConfig | undefined => {
  return toolsConfig[id]
}

export const getToolsByCategory = (category: ToolConfig['category']): ToolConfig[] => {
  return getAllTools().filter(tool => tool.category === category)
}

export const getFreeTools = (): ToolConfig[] => {
  return getAllTools().filter(tool => !tool.isPremium)
}

export const getPremiumTools = (): ToolConfig[] => {
  return getAllTools().filter(tool => tool.isPremium)
}

export const searchTools = (query: string): ToolConfig[] => {
  const lowerQuery = query.toLowerCase()
  return getAllTools().filter(tool => 
    tool.name.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery) ||
    tool.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

export const getCategories = (): ToolConfig['category'][] => {
  return ['text', 'crypto', 'image', 'utility', 'web', 'security'] // Added 'security' category
}

export const getCategoryDisplayName = (category: ToolConfig['category']): string => {
  const names = {
    text: 'Text & Format',
    crypto: 'Cryptography',
    image: 'Image Processing',
    utility: 'Utilities',
    web: 'Web Development',
    security: 'Security' // Added 'Security' category
  }
  return names[category]
} 