import { getMetadataApplicationName } from '@/lib/app-config'

export const base64EncoderConfig = {
  name: 'Base64 Encoder/Decoder',
  description: 'Encode and decode Base64 strings with support for various input formats',
  title: `${getMetadataApplicationName()} - Base64 Encoder/Decoder`,
  keywords: ['base64', 'encode', 'decode', 'converter', 'utility'],
  features: {
    free: ['Encode text to Base64', 'Decode Base64 to text', 'File upload support', 'Copy to clipboard'],
    backer: ['Batch processing', 'Advanced encoding options', 'History tracking']
  }
}

// Tool-specific configuration
export const config = {
  maxFileSize: {
    free: 10 * 1024 * 1024, // 10MB for free users
    premium: 50 * 1024 * 1024, // 50MB for premium users
  },
  batchLimits: {
    free: 10, // 10 items for free users
    premium: 100, // 100 items for premium users
  },
  supportedFileTypes: [
    // Images
    'image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp',
    // Documents
    'application/pdf', 'text/plain', 'text/csv', 'application/json', 'application/xml', 'text/xml',
    // Archives
    'application/zip', 'application/x-zip-compressed',
    // Other
    'application/octet-stream'
  ],
  encodingOptions: {
    standard: {
      urlSafe: false,
      noPadding: false,
      lineLength: 76
    },
    urlSafe: {
      urlSafe: true,
      noPadding: false,
      lineLength: 0
    },
    compact: {
      urlSafe: false,
      noPadding: true,
      lineLength: 0
    }
  }
}