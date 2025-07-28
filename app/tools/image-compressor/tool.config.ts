export const toolConfig = {
  // Image Compressor specific configuration
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ['jpeg', 'jpg', 'png', 'webp', 'avif'],
  defaultQuality: 80,
  compressionPresets: {
    high: { quality: 90, format: 'jpeg' },
    medium: { quality: 80, format: 'jpeg' },
    low: { quality: 60, format: 'jpeg' },
    webp: { quality: 85, format: 'webp' },
    avif: { quality: 80, format: 'avif' }
  }
}; 