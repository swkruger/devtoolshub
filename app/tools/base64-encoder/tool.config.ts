import { toolsConfig } from "@/lib/tools"

export const tool = toolsConfig['base64-encoder']

export const metadata = {
  title: `${tool.name} - DevToolsHub`,
  description: tool.description,
  keywords: tool.tags.join(', '),
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