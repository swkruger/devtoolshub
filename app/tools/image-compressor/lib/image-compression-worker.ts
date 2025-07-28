// Image Compression Web Worker
// This worker handles heavy image compression tasks off the main thread

interface CompressionMessage {
  type: 'compress';
  id: string;
  imageData: ImageBitmap;
  settings: {
    quality: number;
    format: 'jpeg' | 'png' | 'webp' | 'avif';
    maxWidth?: number;
    maxHeight?: number;
    resizePercentage?: number;
    progressive?: boolean;
    lossless?: boolean;
    maintainAspectRatio: boolean;
  };
}

interface CompressionResult {
  type: 'compression-complete';
  id: string;
  blob: Blob;
  size: number;
  error?: string;
}

interface ProgressMessage {
  type: 'progress';
  id: string;
  progress: number;
}

self.onmessage = async (e: MessageEvent<CompressionMessage>) => {
  const { type, id, imageData, settings } = e.data;

  if (type === 'compress') {
    try {
      // Report progress
      self.postMessage({ type: 'progress', id, progress: 10 } as ProgressMessage);

      // Create canvas for compression
      const canvas = new OffscreenCanvas(imageData.width, imageData.height);
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Report progress
      self.postMessage({ type: 'progress', id, progress: 30 } as ProgressMessage);

      // Calculate new dimensions based on resize options
      let { width, height } = imageData;
      const originalWidth = width;
      const originalHeight = height;

      // Apply percentage resize if specified
      if (settings.resizePercentage && settings.resizePercentage !== 100) {
        const percentage = settings.resizePercentage / 100;
        width = Math.round(width * percentage);
        height = Math.round(height * percentage);
      }

      // Apply max width/height constraints
      if (settings.maxWidth && width > settings.maxWidth) {
        if (settings.maintainAspectRatio) {
          height = Math.round((height * settings.maxWidth) / width);
          width = settings.maxWidth;
        } else {
          width = settings.maxWidth;
        }
      }

      if (settings.maxHeight && height > settings.maxHeight) {
        if (settings.maintainAspectRatio) {
          width = Math.round((width * settings.maxHeight) / height);
          height = settings.maxHeight;
        } else {
          height = settings.maxHeight;
        }
      }

      // Report progress
      self.postMessage({ type: 'progress', id, progress: 50 } as ProgressMessage);

      // Resize canvas if needed
      if (width !== imageData.width || height !== imageData.height) {
        const resizedCanvas = new OffscreenCanvas(width, height);
        const resizedCtx = resizedCanvas.getContext('2d');
        if (resizedCtx) {
          resizedCtx.drawImage(imageData, 0, 0, width, height);
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(resizedCanvas, 0, 0);
        }
      } else {
        ctx.drawImage(imageData, 0, 0);
      }

      // Report progress
      self.postMessage({ type: 'progress', id, progress: 70 } as ProgressMessage);

      // Convert to blob with specified quality and format
      const mimeType = settings.format === 'jpeg' ? 'image/jpeg' :
                      settings.format === 'png' ? 'image/png' :
                      settings.format === 'webp' ? 'image/webp' :
                      settings.format === 'avif' ? 'image/avif' : 'image/jpeg';

      // Handle lossless compression for supported formats
      const quality = settings.lossless && ['png', 'webp', 'avif'].includes(settings.format) 
        ? 1.0 
        : settings.quality / 100;

      // Report progress
      self.postMessage({ type: 'progress', id, progress: 90 } as ProgressMessage);

      const blob = await canvas.convertToBlob({
        type: mimeType,
        quality: quality
      });

      // Report completion
      self.postMessage({
        type: 'compression-complete',
        id,
        blob,
        size: blob.size
      } as CompressionResult);

    } catch (error) {
      // Report error
      self.postMessage({
        type: 'compression-complete',
        id,
        blob: new Blob(),
        size: 0,
        error: error instanceof Error ? error.message : 'Compression failed'
      } as CompressionResult);
    }
  }
};

export type { CompressionMessage, CompressionResult, ProgressMessage }; 