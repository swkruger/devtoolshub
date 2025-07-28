import { useCallback, useRef, useState, useEffect } from 'react';
import type { CompressionMessage, CompressionResult, ProgressMessage } from '../lib/image-compression-worker';

interface CompressionSettings {
  quality: number;
  format: 'jpeg' | 'png' | 'webp' | 'avif';
  maxWidth?: number;
  maxHeight?: number;
  resizePercentage?: number;
  progressive?: boolean;
  lossless?: boolean;
  maintainAspectRatio: boolean;
}

interface CompressionTask {
  id: string;
  file: File;
  settings: CompressionSettings;
  onProgress: (progress: number) => void;
  onComplete: (result: { blob: Blob; size: number }) => void;
  onError: (error: string) => void;
}

export function useImageCompressionWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [activeTasks, setActiveTasks] = useState<Set<string>>(new Set());
  const [progressMap, setProgressMap] = useState<Map<string, number>>(new Map());

  // Initialize worker
  useEffect(() => {
    if (typeof window !== 'undefined' && !workerRef.current) {
      try {
        workerRef.current = new Worker(
          new URL('../lib/image-compression-worker.ts', import.meta.url),
          { type: 'module' }
        );

        workerRef.current.onmessage = (e: MessageEvent<CompressionResult | ProgressMessage>) => {
          const { type, id } = e.data;

          if (type === 'progress') {
            const progress = (e.data as ProgressMessage).progress;
            setProgressMap(prev => new Map(prev).set(id, progress));
          } else if (type === 'compression-complete') {
            const result = e.data as CompressionResult;
            
            // Remove from active tasks
            setActiveTasks(prev => {
              const newSet = new Set(prev);
              newSet.delete(id);
              return newSet;
            });

            // Clear progress
            setProgressMap(prev => {
              const newMap = new Map(prev);
              newMap.delete(id);
              return newMap;
            });

            // Handle result
            if (result.error) {
              // Find the task and call onError
              // This would need to be managed differently in a real implementation
              console.error('Compression error:', result.error);
            } else {
              // Find the task and call onComplete
              console.log('Compression complete:', result.size);
            }
          }
        };

        workerRef.current.onerror = (error) => {
          console.error('Worker error:', error);
          setIsWorkerReady(false);
        };

        setIsWorkerReady(true);
      } catch (error) {
        console.error('Failed to initialize worker:', error);
        setIsWorkerReady(false);
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Compress image using worker
  const compressImage = useCallback(async (
    file: File, 
    settings: CompressionSettings,
    onProgress?: (progress: number) => void,
    onComplete?: (result: { blob: Blob; size: number }) => void,
    onError?: (error: string) => void
  ): Promise<{ blob: Blob; size: number }> => {
    if (!workerRef.current || !isWorkerReady) {
      throw new Error('Worker not ready');
    }

    const taskId = `${Date.now()}-${Math.random()}`;
    
    // Add to active tasks
    setActiveTasks(prev => new Set(prev).add(taskId));

    return new Promise((resolve, reject) => {
      // Create image bitmap
      createImageBitmap(file).then((imageBitmap) => {
        const message: CompressionMessage = {
          type: 'compress',
          id: taskId,
          imageData: imageBitmap,
          settings
        };

        // Set up message handler for this specific task
        const handleMessage = (e: MessageEvent<CompressionResult | ProgressMessage>) => {
          const { type, id } = e.data;

          if (id !== taskId) return;

          if (type === 'progress') {
            const progress = (e.data as ProgressMessage).progress;
            onProgress?.(progress);
          } else if (type === 'compression-complete') {
            const result = e.data as CompressionResult;
            
            // Clean up
            if (workerRef.current) {
              workerRef.current.removeEventListener('message', handleMessage);
            }
            
            // Remove from active tasks
            setActiveTasks(prev => {
              const newSet = new Set(prev);
              newSet.delete(taskId);
              return newSet;
            });

            // Clear progress
            setProgressMap(prev => {
              const newMap = new Map(prev);
              newMap.delete(taskId);
              return newMap;
            });

            if (result.error) {
              onError?.(result.error);
              reject(new Error(result.error));
            } else {
              onComplete?.({ blob: result.blob, size: result.size });
              resolve({ blob: result.blob, size: result.size });
            }
          }
        };

        if (workerRef.current) {
          workerRef.current.addEventListener('message', handleMessage);
          workerRef.current.postMessage(message);
        }
      }).catch(reject);
    });
  }, [isWorkerReady]);

  // Get progress for a specific task
  const getProgress = useCallback((taskId: string): number => {
    return progressMap.get(taskId) || 0;
  }, [progressMap]);

  // Check if any tasks are active
  const hasActiveTasks = activeTasks.size > 0;

  // Clean up all tasks
  const cancelAllTasks = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setActiveTasks(new Set());
      setProgressMap(new Map());
      setIsWorkerReady(false);
    }
  }, []);

  return {
    compressImage,
    getProgress,
    hasActiveTasks,
    isWorkerReady,
    cancelAllTasks,
    activeTaskCount: activeTasks.size
  };
} 