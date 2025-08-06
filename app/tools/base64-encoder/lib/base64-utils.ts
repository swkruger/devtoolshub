export interface EncodingOptions {
  urlSafe?: boolean
  noPadding?: boolean
  lineLength?: number
  characterSet?: string
  newlineSeparator?: string
}

export interface ConversionResult {
  success: boolean
  result?: string
  error?: string
  originalSize?: number
  encodedSize?: number
}

/**
 * Encode text to Base64
 */
export function encodeTextToBase64(input: string, options: EncodingOptions = {}): ConversionResult {
  try {
    if (!input) {
      return { success: false, error: "Input text is required" }
    }

    // Apply newline separator conversion if specified
    let processedInput = input
    if (options.newlineSeparator) {
      switch (options.newlineSeparator) {
        case 'lf':
          processedInput = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
          break
        case 'crlf':
          processedInput = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '\r\n')
          break
        case 'cr':
          processedInput = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '\r')
          break
      }
    }

    // Handle character encoding
    let encoded: string
    if (options.characterSet && options.characterSet !== 'utf-8') {
      // For non-UTF-8 encodings, we'll use TextEncoder if available
      try {
        const encoder = new TextEncoder()
        const uint8Array = encoder.encode(processedInput)
        const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('')
        encoded = btoa(binaryString)
      } catch (encodingError) {
        // Fallback to standard UTF-8 encoding
        encoded = btoa(unescape(encodeURIComponent(processedInput)))
      }
    } else {
      // Standard UTF-8 encoding
      encoded = btoa(unescape(encodeURIComponent(processedInput)))
    }
    
    // Apply URL-safe encoding if requested
    if (options.urlSafe) {
      encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_')
    }
    
    // Remove padding if requested
    if (options.noPadding) {
      encoded = encoded.replace(/=+$/, '')
    }
    
    // Add line breaks if specified
    if (options.lineLength && options.lineLength > 0) {
      encoded = encoded.replace(new RegExp(`(.{${options.lineLength}})`, 'g'), '$1\n').trim()
    }

    return {
      success: true,
      result: encoded,
      originalSize: new Blob([processedInput]).size,
      encodedSize: new Blob([encoded]).size
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Encoding failed"
    }
  }
}

/**
 * Decode Base64 to text
 */
export function decodeBase64ToText(input: string, options: EncodingOptions = {}): ConversionResult {
  try {
    if (!input) {
      return { success: false, error: "Input Base64 string is required" }
    }

    // Clean input - remove whitespace and line breaks
    let cleaned = input.replace(/\s/g, '')
    
    // Convert URL-safe Base64 back to standard
    cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/')
    
    // Add padding if missing
    while (cleaned.length % 4) {
      cleaned += '='
    }

    // Validate Base64 format
    if (!isValidBase64(cleaned)) {
      return { success: false, error: "Invalid Base64 string format" }
    }

    // Decode
    let decoded: string
    if (options.characterSet && options.characterSet !== 'utf-8') {
      // For non-UTF-8 encodings, try to handle different character sets
      try {
        const binaryString = atob(cleaned)
        const uint8Array = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i)
        }
        const decoder = new TextDecoder(options.characterSet === 'ascii' ? 'ascii' : 'utf-8')
        decoded = decoder.decode(uint8Array)
      } catch (decodingError) {
        // Fallback to standard UTF-8 decoding
        decoded = decodeURIComponent(escape(atob(cleaned)))
      }
    } else {
      // Standard UTF-8 decoding
      decoded = decodeURIComponent(escape(atob(cleaned)))
    }

    // Apply newline separator conversion if specified
    if (options.newlineSeparator) {
      switch (options.newlineSeparator) {
        case 'lf':
          decoded = decoded.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
          break
        case 'crlf':
          decoded = decoded.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '\r\n')
          break
        case 'cr':
          decoded = decoded.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '\r')
          break
      }
    }

    return {
      success: true,
      result: decoded,
      originalSize: new Blob([cleaned]).size,
      encodedSize: new Blob([decoded]).size
    }
  } catch (error) {
    return {
      success: false,
      error: "Invalid Base64 string - unable to decode"
    }
  }
}

/**
 * Encode file to Base64
 */
export function encodeFileToBase64(file: File, options: EncodingOptions = {}, includeDataUrl: boolean = false): Promise<ConversionResult & { dataUrl?: string, mimeType?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string
        if (!result) {
          resolve({ success: false, error: "Failed to read file" })
          return
        }

        // Extract the MIME type and Base64 data
        const [dataUrlPrefix, base64Data] = result.split(',')
        const mimeType = dataUrlPrefix.match(/data:([^;]+)/)?.[1] || file.type || 'application/octet-stream'
        
        // Apply encoding options to base64 data
        let processed = base64Data
        
        if (options.urlSafe) {
          processed = processed.replace(/\+/g, '-').replace(/\//g, '_')
        }
        
        if (options.noPadding) {
          processed = processed.replace(/=+$/, '')
        }
        
        if (options.lineLength && options.lineLength > 0) {
          processed = processed.replace(new RegExp(`(.{${options.lineLength}})`, 'g'), '$1\n').trim()
        }

        // Create data URL if requested
        const dataUrl = includeDataUrl ? `data:${mimeType};base64,${processed}` : undefined

        resolve({
          success: true,
          result: processed,
          dataUrl,
          mimeType,
          originalSize: file.size,
          encodedSize: new Blob([processed]).size
        })
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : "File encoding failed"
        })
      }
    }
    
    reader.onerror = () => {
      resolve({ success: false, error: "Failed to read file" })
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Detect input type
 */
export function detectInputType(input: string): 'text' | 'base64' | 'empty' {
  if (!input.trim()) return 'empty'
  
  // Remove whitespace for Base64 detection
  const cleaned = input.replace(/\s/g, '')
  
  // Check if it looks like Base64
  if (isValidBase64(cleaned) || isValidBase64Loose(cleaned)) {
    return 'base64'
  }
  
  return 'text'
}

/**
 * Validate strict Base64 format
 */
export function isValidBase64(str: string): boolean {
  // Base64 regex pattern
  const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/
  
  // Check pattern and length
  return base64Pattern.test(str) && str.length % 4 === 0
}

/**
 * Validate Base64 format (looser - allows URL-safe and missing padding)
 */
export function isValidBase64Loose(str: string): boolean {
  // URL-safe Base64 pattern (allows - and _ instead of + and /)
  const urlSafePattern = /^[A-Za-z0-9+/\-_]*={0,2}$/
  
  return urlSafePattern.test(str) && str.length >= 4
}

/**
 * Get file type from Base64 data
 */
export function getFileTypeFromBase64(base64: string): string | null {
  try {
    // Convert to data URL to detect type
    const binaryString = atob(base64.split(',')[1] || base64)
    const bytes = new Uint8Array(binaryString.length)
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    // Check file signatures
    const hex = Array.from(bytes.slice(0, 8))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // Common file signatures
    if (hex.startsWith('89504e47')) return 'image/png'
    if (hex.startsWith('ffd8ffe0') || hex.startsWith('ffd8ffe1') || hex.startsWith('ffd8ffe2')) return 'image/jpeg'
    if (hex.startsWith('47494638')) return 'image/gif'
    if (hex.startsWith('25504446')) return 'application/pdf'
    if (hex.startsWith('504b0304')) return 'application/zip'
    
    return 'application/octet-stream'
  } catch {
    return null
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Calculate compression ratio
 */
export function calculateCompressionRatio(originalSize: number, encodedSize: number): string {
  if (originalSize === 0) return '0%'
  
  const ratio = ((encodedSize - originalSize) / originalSize) * 100
  const sign = ratio > 0 ? '+' : ''
  
  return `${sign}${ratio.toFixed(1)}%`
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File | string): boolean {
  if (typeof file === 'string') {
    // Check MIME type from data URL
    return file.startsWith('data:image/')
  }
  return file.type.startsWith('image/')
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file: File): Promise<{ width: number, height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

/**
 * Get available character sets
 */
export function getCharacterSets() {
  return [
    { value: 'utf-8', label: 'UTF-8', category: 'Popular' },
    { value: 'ascii', label: 'ASCII', category: 'Popular' },
    { value: 'iso-8859-1', label: 'ISO-8859-1', category: 'Popular' },
    { value: 'iso-8859-2', label: 'ISO-8859-2', category: 'Popular' },
    { value: 'iso-8859-5', label: 'ISO-8859-5', category: 'Popular' },
    { value: 'iso-8859-15', label: 'ISO-8859-15', category: 'Popular' },
    { value: 'windows-1252', label: 'Windows-1252', category: 'Popular' },
    { value: 'armscii-8', label: 'ArmSCII-8', category: 'Others' },
    { value: 'big5', label: 'BIG-5', category: 'Others' },
    { value: 'cp850', label: 'CP850', category: 'Others' },
    { value: 'cp866', label: 'CP866', category: 'Others' },
    { value: 'cp932', label: 'CP932', category: 'Others' },
    { value: 'cp936', label: 'CP936', category: 'Others' },
    { value: 'cp950', label: 'CP950', category: 'Others' },
    { value: 'cp50220', label: 'CP50220', category: 'Others' },
    { value: 'cp50221', label: 'CP50221', category: 'Others' },
    { value: 'cp50222', label: 'CP50222', category: 'Others' },
    { value: 'cp51932', label: 'CP51932', category: 'Others' }
  ]
}

/**
 * Get available newline separators
 */
export function getNewlineSeparators() {
  return [
    { value: 'lf', label: 'LF (Unix)', description: 'Line Feed (\\n)' },
    { value: 'crlf', label: 'CRLF (Windows)', description: 'Carriage Return + Line Feed (\\r\\n)' },
    { value: 'cr', label: 'CR (Classic Mac)', description: 'Carriage Return (\\r)' }
  ]
}