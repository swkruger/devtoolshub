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
    description: 'Compress and optimize images with advanced algorithms and format conversion. The best image compression tool for developers.',
    shortDescription: 'Compress and optimize images',
    icon: Image,
    emoji: '📸',
    isPremium: false,
    category: 'image',
    tags: ['image', 'compress', 'optimize', 'convert', 'webp', 'avif', 'jpeg', 'png'],
    path: '/tools/image-compressor',
    features: {
      free: [
        'Single image upload with drag & drop',
        'Basic compression with quality control',
        'JPEG and PNG support',
        'Before/after comparison',
        'Download compressed image',
        'File size reduction display',
        'Image metadata display',
        'Help panel with examples and shortcuts'
      ],
      premium: [
        'Batch processing (multiple images)',
        'Advanced format conversion (WebP, AVIF)',
        'Advanced compression algorithms',
        'Resize options (width/height/percentage)',
        'Metadata stripping options',
        'Progressive JPEG support',
        'Lossless compression options',
        'Bulk download (ZIP) functionality',
        'Quality presets and custom settings',
        'Real-time compression preview',
        'Compression statistics and analytics',
        'Premium keyboard shortcuts',
        'Save compression history (optional)'
      ]
    }
  },
  'uuid-generator': {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate unique identifiers in various formats with advanced customization. The best UUID generator tool for developers.',
    shortDescription: 'Generate unique identifiers',
    icon: Hash,
    emoji: '🧬',
    isPremium: false,
    category: 'utility',
    tags: ['uuid', 'unique', 'identifier', 'generate', 'guid', 'random'],
    path: '/tools/uuid-generator',
    features: {
      free: [
        'Generate UUID v4 (random)',
        'Generate UUID v1 (timestamp-based)',
        'Generate UUID v3/v5 (namespace-based)',
        'Multiple output formats (standard, compact, base64)',
        'Copy to clipboard functionality',
        'Real-time generation',
        'Format validation',
        'Help panel with examples and shortcuts',
        'Basic customization options',
        'Single UUID generation'
      ],
      premium: [
        'Bulk UUID generation (1-1000)',
        'Custom UUID formats and patterns',
        'Namespace management (save/load custom namespaces)',
        'Advanced validation and verification',
        'Export to multiple formats (JSON, CSV, TXT)',
        'UUID collision detection',
        'Performance metrics and statistics',
        'Custom seed generation',
        'UUID history and favorites',
        'Batch processing with progress tracking',
        'Advanced formatting options',
        'UUID parsing and validation',
        'Premium keyboard shortcuts',
        'Database integration for saved UUIDs'
      ]
    }
  },
  'xpath-tester': {
    id: 'xpath-tester',
    name: 'XPath/CSS Selector Tester',
    description: 'Test XPath and CSS selectors against HTML with real-time highlighting, file upload, and advanced features. The best selector testing tool for developers.',
    shortDescription: 'Test XPath and CSS selectors against HTML',
    icon: Code,
    emoji: '🧪',
    isPremium: false,
    category: 'web',
    tags: ['xpath', 'css', 'selector', 'html', 'xml', 'web-scraping', 'dom'],
    path: '/tools/xpath-tester',
    features: {
      free: [
        'XPath selector testing with real-time validation',
        'CSS selector testing with comprehensive browser support',
        'HTML input area with syntax highlighting',
        'Real-time match highlighting and result display',
        'Copy matches to clipboard functionality',
        'Sample HTML and selector examples',
        'Match count and details display',
        'Element hierarchy and attributes display',
        'Help panel with examples, shortcuts, tips',
        'Basic selector validation'
      ],
      premium: [
        'Upload HTML files with drag & drop support',
        'Test selectors against live URLs',
        'XPath 2.0/3.0 advanced functions',
        'CSS pseudo-selectors and combinators',
        'Selector validation and optimization',
        'Performance metrics and timing',
        'Bulk testing multiple selectors',
        'Export results as CSV/JSON',
        'Save and manage custom selectors',
        'Categorized selector examples',
        'Import/export selector collections',
        'Advanced match analytics',
        'Premium keyboard shortcuts',
        'File validation and error handling'
      ]
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