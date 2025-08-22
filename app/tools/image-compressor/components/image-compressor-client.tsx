'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Download, 
  Settings, 
  Image as ImageIcon, 
  FileImage, 
  FolderOpen, 
  Save, 
  HelpCircle, 
  Crown,
  AlertCircle,
  X,
  Check,
  Loader2,
  Eye,
  EyeOff,
  Star,
  RefreshCw
} from 'lucide-react';
import { useImageCompressionWorker } from '../hooks/use-image-compression-worker';
import HelpPanel from './help-panel';
import { toast } from 'sonner';
import { imageCompressionDB } from '@/lib/services/image-compression-db';

interface ImageCompressorClientProps {
  isPremiumUser: boolean;
  userId?: string;
}

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  compressedSize?: number;
  compressionRatio?: number;
  status: 'uploading' | 'compressing' | 'completed' | 'error';
  error?: string;
  compressedBlob?: Blob;
  compressedPreview?: string;
  showComparison?: boolean;
}

interface CompressionSettings {
  quality: number;
  format: 'jpeg' | 'png' | 'webp' | 'avif';
  maxWidth?: number;
  maxHeight?: number;
  resizePercentage?: number;
  stripMetadata: boolean;
  progressive?: boolean;
  lossless?: boolean;
  maintainAspectRatio: boolean;
}

export default function ImageCompressorClient({ isPremiumUser, userId }: ImageCompressorClientProps) {

  const [images, setImages] = useState<ImageFile[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isBatchProcessingOpen, setIsBatchProcessingOpen] = useState(false);
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const [isFormatConversionOpen, setIsFormatConversionOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSaveSettingsOpen, setIsSaveSettingsOpen] = useState(false);
  const [isLoadSettingsOpen, setIsLoadSettingsOpen] = useState(false);
  const [settingsName, setSettingsName] = useState('');
  const [isDefaultSetting, setIsDefaultSetting] = useState(false);
  const [savedSettings, setSavedSettings] = useState<any[]>([]);
  const [compressionHistory, setCompressionHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>({
    quality: 80,
    format: 'jpeg',
    stripMetadata: false,
    progressive: false,
    lossless: false,
    maintainAspectRatio: true
  });
  const [batchProgress, setBatchProgress] = useState<{ [key: string]: number }>({});
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<{ [key: string]: number }>({});
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Web Worker
  const {
    compressImage: workerCompressImage,
    getProgress,
    hasActiveTasks,
    isWorkerReady,
    cancelAllTasks,
    activeTaskCount
  } = useImageCompressionWorker();

  // Enhanced image compression function with Web Worker
  const compressImage = useCallback(async (file: File, settings: CompressionSettings): Promise<{ blob: Blob; size: number }> => {
    // Use Web Worker if available, otherwise fall back to main thread
    if (isWorkerReady) {
      return workerCompressImage(
        file,
        settings,
        (progress) => {
          setCompressionProgress(prev => ({ ...prev, [file.name]: progress }));
        },
        (result) => {
          // Update memory usage
          setMemoryUsage(prev => prev + result.size);
          setCompressionProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        },
        (error) => {
          console.error('Worker compression error:', error);
          setCompressionProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        }
      );
    } else {
      // Fallback to main thread compression
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new window.Image();
        
        img.onload = () => {
          // Calculate new dimensions based on resize options
          let { width, height } = img;
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
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw image with new dimensions
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with specified quality and format
          const mimeType = settings.format === 'jpeg' ? 'image/jpeg' :
                          settings.format === 'png' ? 'image/png' :
                          settings.format === 'webp' ? 'image/webp' :
                          settings.format === 'avif' ? 'image/avif' : 'image/jpeg';
          
          // Handle lossless compression for supported formats
          const quality = settings.lossless && ['png', 'webp', 'avif'].includes(settings.format) 
            ? 1.0 
            : settings.quality / 100;
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                setMemoryUsage(prev => prev + blob.size);
                resolve({ blob, size: blob.size });
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            mimeType,
            quality
          );
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
      });
    }
  }, [isWorkerReady, workerCompressImage]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    
    // Validate settings first
    const settingsErrors = validateSettings();
    if (settingsErrors.length > 0) {
      setValidationErrors(settingsErrors);
      return;
    }
    
    // Validate each file
    const allErrors: string[] = [];
    const validFiles: File[] = [];
    
    Array.from(files).forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        allErrors.push(...fileErrors);
      } else {
        validFiles.push(file);
      }
    });
    
    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      return;
    }
    
    if (validFiles.length === 0) {
      return;
    }
    
    setIsProcessing(true);
    setValidationErrors([]);
    
    const newImages: ImageFile[] = validFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      originalSize: file.size,
      status: 'uploading'
    }));

    setImages(prev => [...prev, ...newImages]);
    
    // Compress each image
    for (let i = 0; i < newImages.length; i++) {
      const image = newImages[i];
      
      try {
        setImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, status: 'compressing' } : img
        ));
        
        const { blob, size } = await compressImage(image.file, compressionSettings);
        const compressedPreview = URL.createObjectURL(blob);
        const compressionRatio = Math.round(((image.originalSize - size) / image.originalSize) * 100);
        
        setImages(prev => prev.map(img => 
          img.id === image.id 
            ? { 
                ...img, 
                status: 'completed',
                compressedSize: size,
                compressionRatio,
                compressedBlob: blob,
                compressedPreview,
                showComparison: false
              }
            : img
        ));
        
        await saveCompressionHistory(image, size, compressionRatio);
      } catch (error) {
        setImages(prev => prev.map(img => 
          img.id === image.id 
            ? { 
                ...img, 
                status: 'error',
                error: error instanceof Error ? error.message : 'Compression failed'
              }
            : img
        ));
      }
    }
    
    setIsProcessing(false);
  };

  const handleSingleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleBatchUpload = () => {
    if (!isPremiumUser) {
      // Show upgrade prompt
      toast.error('Premium Feature Required', {
        description: 'Batch upload is a premium feature. Please upgrade to access this feature.'
      });
      return;
    }
    batchFileInputRef.current?.click();
  };

  const handleBatchProcessing = async () => {
    if (!isPremiumUser) {
      // Show upgrade prompt
      toast.error('Premium Feature Required', {
        description: 'Batch processing is a premium feature. Please upgrade to access this feature.'
      });
      return;
    }
    
    const completedImages = images.filter(img => img.status === 'completed');
    if (completedImages.length === 0) return;
    
    setIsBatchProcessing(true);
    
    try {
      // Process all completed images with current settings
      for (const image of completedImages) {
        const { blob, size } = await compressImage(image.file, compressionSettings);
        const compressedPreview = URL.createObjectURL(blob);
        const compressionRatio = Math.round(((image.originalSize - size) / image.originalSize) * 100);
        
        setImages(prev => prev.map(img => 
          img.id === image.id 
            ? { 
                ...img, 
                compressedSize: size,
                compressionRatio,
                compressedBlob: blob,
                compressedPreview,
                showComparison: false
              }
            : img
        ));
      }
    } catch (error) {
      console.error('Batch processing error:', error);
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleBulkDownload = () => {
    if (!isPremiumUser) {
      // Show upgrade prompt
      toast.error('Premium Feature Required', {
        description: 'Bulk download is a premium feature. Please upgrade to access this feature.'
      });
      return;
    }
    
    const completedImages = images.filter(img => img.status === 'completed' && img.compressedBlob);
    if (completedImages.length === 0) return;
    
    // Download each file individually with a slight delay
    completedImages.forEach((image, index) => {
      setTimeout(() => {
        handleDownload(image);
      }, index * 100); // Stagger downloads by 100ms
    });
  };

  const handleDownload = (image: ImageFile) => {
    if (!image.compressedBlob) return;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(image.compressedBlob);
    const extension = compressionSettings.format === 'jpeg' ? 'jpg' : (compressionSettings.format || 'jpg');
    link.download = `compressed-${image.file.name.replace(/\.[^/.]+$/, '')}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemoveImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleClearAll = () => {
    setImages([]);
  };

  const handleToggleComparison = (imageId: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, showComparison: !img.showComparison } : img
    ));
  };

  const handleRecompress = async (image: ImageFile) => {
    try {
      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, status: 'compressing' } : img
      ));
      
      const { blob, size } = await compressImage(image.file, compressionSettings);
      const compressedPreview = URL.createObjectURL(blob);
      const compressionRatio = Math.round(((image.originalSize - size) / image.originalSize) * 100);
      
      setImages(prev => prev.map(img => 
        img.id === image.id 
          ? { 
              ...img, 
              status: 'completed',
              compressedSize: size,
              compressionRatio,
              compressedBlob: blob,
              compressedPreview
            }
          : img
      ));
      
      await saveCompressionHistory(image, size, compressionRatio);
    } catch (error) {
      setImages(prev => prev.map(img => 
        img.id === image.id 
          ? { 
              ...img, 
              status: 'error',
              error: error instanceof Error ? error.message : 'Recompression failed'
            }
          : img
      ));
    }
  };

  const handleAdvancedSettings = () => {
    if (!isPremiumUser) {
      // Show upgrade prompt
      toast.error('Premium Feature Required', {
        description: 'Advanced settings are a premium feature. Please upgrade to access this feature.'
      });
      return;
    }
    setIsAdvancedSettingsOpen(true);
  };

  const handleFormatConversion = () => {
    if (!isPremiumUser) {
      // Show upgrade prompt
      toast.error('Premium Feature Required', {
        description: 'Format conversion is a premium feature. Please upgrade to access this feature.'
      });
      return;
    }
    setIsFormatConversionOpen(true);
  };

  const handleSaveSettings = () => {
    if (!isPremiumUser) {
      toast.error('Premium Feature Required', {
        description: 'Save settings is a premium feature. Please upgrade to access this feature.'
      });
      return;
    }
    
    // Open the save settings modal
    setIsSaveSettingsOpen(true);
  };

  const handleConfirmSaveSettings = async () => {
    if (!settingsName.trim()) {
      toast.error('Settings Name Required', {
        description: 'Please enter a name for your settings.'
      });
      return;
    }
    
    try {
      const result = await imageCompressionDB.saveFavorite({
        name: settingsName,
        settings: compressionSettings,
        is_default: isDefaultSetting
      });
      
      if (result.success) {
        toast.success('Settings Saved', {
          description: `Settings "${settingsName}" saved successfully!`
        });
        
        // Reset and close modals
        setSettingsName('');
        setIsDefaultSetting(false);
        setIsSaveSettingsOpen(false);
        setIsAdvancedSettingsOpen(false);
        
        // Refresh the saved settings list
        await loadSavedSettings();
      } else {
        toast.error('Save Failed', {
          description: result.error || 'Failed to save settings'
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Save Failed', {
        description: 'An unexpected error occurred while saving settings'
      });
    }
  };

  const loadSavedSettings = async () => {
    try {
      const result = await imageCompressionDB.getFavorites();
      
      if (result.error) {
        toast.error('Load Failed', {
          description: result.error || 'Failed to load saved settings'
        });
        return;
      }
      
      setSavedSettings(result.data || []);
    } catch (error) {
      console.error('Error loading saved settings:', error);
      toast.error('Load Failed', {
        description: 'An unexpected error occurred while loading settings'
      });
    }
  };

  const handleLoadSettings = async () => {
    if (!isPremiumUser) {
      toast.error('Premium Feature Required', {
        description: 'Load settings is a premium feature. Please upgrade to access this feature.'
      });
      return;
    }
    
    await loadSavedSettings();
    setIsLoadSettingsOpen(true);
  };

  const handleApplySavedSettings = (settings: any) => {
    setCompressionSettings(settings.settings);
    setIsLoadSettingsOpen(false);
    toast.success('Settings Loaded', {
      description: `Loaded settings: ${settings.name}`
    });
  };

  const handleSetAsDefault = async (settings: any) => {
    try {
      const result = await imageCompressionDB.saveFavorite({
        name: settings.name,
        settings: settings.settings,
        is_default: true
      });
      
      if (result.success) {
        toast.success('Default Set', {
          description: `"${settings.name}" set as default settings`
        });
        await loadSavedSettings(); // Refresh the list to show updated default status
      } else {
        toast.error('Set Default Failed', {
          description: result.error || 'Failed to set as default'
        });
      }
    } catch (error) {
      console.error('Error setting default:', error);
      toast.error('Set Default Failed', {
        description: 'An unexpected error occurred'
      });
    }
  };

  const handleDeleteSavedSettings = async (id: string) => {
    try {
      const result = await imageCompressionDB.deleteFavorite(id);
      
      if (result.success) {
        setSavedSettings(prev => prev.filter(setting => setting.id !== id));
        toast.success('Settings Deleted', {
          description: 'Settings deleted successfully!'
        });
      } else {
        toast.error('Delete Failed', {
          description: result.error || 'Failed to delete settings'
        });
      }
    } catch (error) {
      console.error('Error deleting settings:', error);
      toast.error('Delete Failed', {
        description: 'An unexpected error occurred while deleting settings'
      });
    }
  };

  const handleSaveHistory = async () => {
    if (!isPremiumUser) {
      // Show upgrade prompt
      toast.error('Premium Feature Required', {
        description: 'Saving compression history is a premium feature. Please upgrade to access this feature.'
      });
      return;
    }
    
    setIsLoadingHistory(true);
    try {
      const historyResponse = await imageCompressionDB.getHistory();
      if (historyResponse.error) {
        throw new Error(historyResponse.error);
      }
      setCompressionHistory(historyResponse.data);
      setIsHistoryOpen(true);
    } catch (error) {
      console.error('Error loading compression history:', error);
      toast.error('Error Loading History', {
        description: 'Failed to load compression history. Please try again.'
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const saveCompressionHistory = async (image: ImageFile, compressedSize: number, compressionRatio: number) => {
    if (!isPremiumUser) return;
    
    try {
      await imageCompressionDB.saveHistory({
        original_filename: image.file.name,
        original_size: image.originalSize,
        compressed_size: compressedSize,
        compression_ratio: compressionRatio,
        settings: compressionSettings
      });
    } catch (error) {
      console.error('Error saving compression history:', error);
      // Don't show error toast for history saving as it's not critical
    }
  };

  const handleHelp = () => {
    setIsHelpOpen(true);
  };



  // Keyboard shortcuts
  const handleKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
    // Prevent shortcuts when typing in inputs
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.key) {
      case 'F1':
        e.preventDefault();
        setIsHelpOpen(true);
        break;
      case 'u':
        if (e.ctrlKey) {
          e.preventDefault();
          handleSingleUpload();
        }
        break;
      case 'b':
        if (e.ctrlKey) {
          e.preventDefault();
          handleBatchUpload();
        }
        break;
      case 'd':
        if (e.ctrlKey) {
          e.preventDefault();
          handleBulkDownload();
        }
        break;
      case 's':
        if (e.ctrlKey) {
          e.preventDefault();
          handleSaveHistory();
        }
        break;
      case 'h':
        if (e.ctrlKey) {
          e.preventDefault();
          setIsHelpOpen(!isHelpOpen);
        }
        break;
      case 'Escape':
        setIsHelpOpen(false);
        setIsAdvancedSettingsOpen(false);
        setIsFormatConversionOpen(false);
        setIsHistoryOpen(false);
        break;
    }
  }, [isHelpOpen]);

  // Load saved settings and default settings on component mount
  React.useEffect(() => {
    if (isPremiumUser) {
      loadSavedSettings();
      loadDefaultSettings();
    }
  }, [isPremiumUser]);

  const loadDefaultSettings = async () => {
    try {
      const defaultSettings = await imageCompressionDB.getDefaultSettings();
      if (defaultSettings) {
        setCompressionSettings(defaultSettings.settings);
        toast.success('Default Settings Loaded', {
          description: `Loaded default settings: ${defaultSettings.name}`
        });
      }
    } catch (error) {
      console.error('Error loading default settings:', error);
      // Don't show error toast for default settings loading
    }
  };

  // Add keyboard event listeners
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, [handleKeyboardShortcuts]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string[] => {
    const errors: string[] = [];
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push(`${file.name} is too large (${formatFileSize(file.size)}). Maximum size is 10MB.`);
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      errors.push(`${file.name} is not a valid image file.`);
    }
    
    // Check for unsupported formats
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/bmp'];
    if (!supportedTypes.includes(file.type)) {
      errors.push(`${file.name} has an unsupported format (${file.type}).`);
    }
    
    return errors;
  };

  const validateSettings = (): string[] => {
    const errors: string[] = [];
    
    // Validate quality range
    if (compressionSettings.quality < 1 || compressionSettings.quality > 100) {
      errors.push('Quality must be between 1 and 100.');
    }
    
    // Validate resize percentage
    if (compressionSettings.resizePercentage && (compressionSettings.resizePercentage < 1 || compressionSettings.resizePercentage > 100)) {
      errors.push('Resize percentage must be between 1 and 100.');
    }
    
    // Validate max dimensions
    if (compressionSettings.maxWidth && compressionSettings.maxWidth < 1) {
      errors.push('Max width must be at least 1 pixel.');
    }
    if (compressionSettings.maxHeight && compressionSettings.maxHeight < 1) {
      errors.push('Max height must be at least 1 pixel.');
    }
    
    return errors;
  };

  // Memory cleanup function
  const cleanupMemory = useCallback(() => {
    setMemoryUsage(0);
    setCompressionProgress({});
    setBatchProgress({});
  }, []);

  // Lazy load compression libraries
  const [isCompressionLibraryLoaded, setIsCompressionLibraryLoaded] = useState(false);
  
  useEffect(() => {
    // Simulate lazy loading of compression libraries
    const timer = setTimeout(() => {
      setIsCompressionLibraryLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupMemory();
      cancelAllTasks();
    };
  }, [cleanupMemory, cancelAllTasks]);

  return (
    <div 
      className="space-y-4" 
      role="main" 
      aria-label="Image Compressor Tool"
      aria-describedby="image-compressor-description"
    >
      <div id="image-compressor-description" className="sr-only">
        Image Compressor tool for compressing and optimizing images. Upload images, adjust compression settings, and download optimized versions.
      </div>



      {/* Performance Status */}
      {(hasActiveTasks || memoryUsage > 0) && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Performance Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hasActiveTasks && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Active Tasks: {activeTaskCount}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelAllTasks}
                    className="text-xs"
                  >
                    Cancel All
                  </Button>
                </div>
                <Progress value={activeTaskCount > 0 ? 50 : 0} className="h-2" />
              </div>
            )}
            
            {memoryUsage > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Memory Usage</span>
                  <span className="text-muted-foreground">{formatFileSize(memoryUsage)}</span>
                </div>
                <Progress 
                  value={Math.min((memoryUsage / (100 * 1024 * 1024)) * 100, 100)} 
                  className="h-2" 
                />
                <div className="text-xs text-muted-foreground">
                  {memoryUsage > 50 * 1024 * 1024 && (
                    <span className="text-amber-600">High memory usage detected</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive" className="mb-4" role="alert" aria-live="polite">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validationErrors.map((error, index) => (
                <div key={index} className="text-sm">{error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Compression Settings */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base" id="compression-settings-title">Compression Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" aria-labelledby="compression-settings-title">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quality" id="quality-label" className="text-sm font-medium text-gray-700 dark:text-gray-300">Quality: {compressionSettings.quality}%</Label>
              <Slider
                id="quality"
                value={[compressionSettings.quality]}
                onValueChange={(value) => {
                  setCompressionSettings(prev => ({ ...prev, quality: value[0] }));
                  setValidationErrors([]); // Clear errors when user fixes settings
                }}
                max={100}
                min={1}
                step={1}
                className="w-full"
                aria-labelledby="quality-label"
                aria-describedby="quality-description"
              />
              <div id="quality-description" className="sr-only">
                Adjust image quality from 1% (lowest quality, smallest file) to 100% (highest quality, largest file)
              </div>
              {compressionSettings.quality < 10 && (
                <div className="text-xs text-amber-600 dark:text-amber-400" role="alert">
                  Very low quality may result in poor image appearance
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="format" id="format-label" className="text-sm font-medium text-gray-700 dark:text-gray-300">Output Format</Label>
              <Select
                value={compressionSettings.format}
                onValueChange={(value: 'jpeg' | 'png' | 'webp' | 'avif') => 
                  setCompressionSettings(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger id="format" aria-labelledby="format-label">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpeg" aria-describedby="jpeg-description">JPEG</SelectItem>
                  <SelectItem value="png" aria-describedby="png-description">PNG</SelectItem>
                  <SelectItem value="webp" aria-describedby="webp-description">WebP</SelectItem>
                  <SelectItem value="avif" aria-describedby="avif-description">AVIF</SelectItem>
                </SelectContent>
              </Select>
              <div className="sr-only">
                <div id="jpeg-description">Best for photographs, good compression, no transparency support</div>
                <div id="png-description">Best for images with transparency, lossless compression</div>
                <div id="webp-description">Modern format with excellent compression and transparency support</div>
                <div id="avif-description">Latest format with best compression, limited browser support</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="strip-metadata" className="text-sm font-medium text-gray-700 dark:text-gray-300">Strip Metadata</Label>
              <Button
                variant={compressionSettings.stripMetadata ? "default" : "outline"}
                size="sm"
                onClick={() => setCompressionSettings(prev => ({ ...prev, stripMetadata: !prev.stripMetadata }))}
                className="w-full"
              >
                {compressionSettings.stripMetadata ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </div>
          
          {/* Premium resize options */}
          {isPremiumUser && (
            <div className="pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-width" className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Width (px)</Label>
                  <input
                    id="max-width"
                    type="number"
                    placeholder="Auto"
                    value={compressionSettings.maxWidth || ''}
                    onChange={(e) => setCompressionSettings(prev => ({ 
                      ...prev, 
                      maxWidth: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-height" className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Height (px)</Label>
                  <input
                    id="max-height"
                    type="number"
                    placeholder="Auto"
                    value={compressionSettings.maxHeight || ''}
                    onChange={(e) => setCompressionSettings(prev => ({ 
                      ...prev, 
                      maxHeight: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="resize-percentage" className="text-sm font-medium text-gray-700 dark:text-gray-300">Resize Percentage</Label>
                  <input
                    id="resize-percentage"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="100"
                    value={compressionSettings.resizePercentage || ''}
                    onChange={(e) => setCompressionSettings(prev => ({ 
                      ...prev, 
                      resizePercentage: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
              
              <div className="mt-3 flex items-center space-x-2">
                <input
                  id="maintain-aspect-ratio"
                  type="checkbox"
                  checked={compressionSettings.maintainAspectRatio}
                  onChange={(e) => setCompressionSettings(prev => ({ 
                    ...prev, 
                    maintainAspectRatio: e.target.checked 
                  }))}
                  className="w-4 h-4"
                />
                   <Label htmlFor="maintain-aspect-ratio" className="text-sm font-medium text-gray-700 dark:text-gray-300">Maintain aspect ratio</Label>
              </div>
            </div>
          )}

          {/* Advanced compression options for premium users */}
          {isPremiumUser && (
            <div className="pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="progressive"
                    type="checkbox"
                    checked={compressionSettings.progressive}
                    onChange={(e) => setCompressionSettings(prev => ({ 
                      ...prev, 
                      progressive: e.target.checked 
                    }))}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="progressive">Progressive JPEG</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    id="lossless"
                    type="checkbox"
                    checked={compressionSettings.lossless}
                    onChange={(e) => setCompressionSettings(prev => ({ 
                      ...prev, 
                      lossless: e.target.checked 
                    }))}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="lossless">Lossless compression</Label>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                <div>• Progressive JPEG: Better loading experience for large images</div>
                <div>• Lossless: Maintains original quality (PNG, WebP, AVIF only)</div>
                <div>• AVIF: Best compression, limited browser support</div>
              </div>
            </div>
          )}
          
          {/* Image count for batch processing */}
          {isPremiumUser && images.length > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400 pt-2 border-t">
              {images.filter(img => img.status === 'completed').length} images ready for batch processing
            </div>
          )}


        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4 items-center" role="toolbar" aria-label="Image compression actions">
        {/* Free Features */}
        <div className="flex gap-2" role="group" aria-label="Free features">
          <Button 
            size="sm" 
            onClick={handleSingleUpload}
            type="button"
            disabled={isProcessing}
            aria-label="Upload single image (Ctrl+U)"
            title="Upload single image (Ctrl+U)"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
            )}
            {isProcessing ? 'Processing...' : 'Upload Image'}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleClearAll}
            type="button"
            disabled={images.length === 0}
            aria-label="Clear all images"
            title="Clear all images"
          >
            <X className="w-4 h-4 mr-2" aria-hidden="true" />
            Clear All
          </Button>
        </div>

        {/* Premium Features */}
        <div className="flex gap-2" role="group" aria-label="Premium features">
          <Tooltip content={isPremiumUser ? "Batch upload multiple images (Ctrl+B)" : "Batch processing - Premium feature"}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBatchUpload}
              disabled={!isPremiumUser}
              className={`flex items-center gap-2 relative transition-all duration-200 ${
                !isPremiumUser 
                  ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                  : 'hover:shadow-sm'
              }`}
              aria-label={isPremiumUser ? "Batch upload images (Ctrl+B)" : "Batch processing - Premium feature"}
            >
              <FolderOpen className="w-4 h-4" aria-hidden="true" />
              Batch Upload
              {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" aria-hidden="true" />}
            </Button>
          </Tooltip>

          <Tooltip content={isPremiumUser ? "Process all images with batch settings" : "Batch processing - Premium feature"}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBatchProcessing}
              disabled={!isPremiumUser || images.length === 0 || isBatchProcessing}
              className={`flex items-center gap-2 relative transition-all duration-200 ${
                !isPremiumUser 
                  ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                  : 'hover:shadow-sm'
              }`}
              aria-label={isPremiumUser ? "Process batch" : "Batch processing - Premium feature"}
            >
              {isBatchProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Settings className="w-4 h-4" aria-hidden="true" />
              )}
              {isBatchProcessing ? 'Processing...' : 'Process Batch'}
              {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" aria-hidden="true" />}
            </Button>
          </Tooltip>

          <Tooltip content={isPremiumUser ? "Download all compressed images (Ctrl+D)" : "Bulk download - Premium feature"}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkDownload}
              disabled={!isPremiumUser || images.filter(img => img.status === 'completed').length === 0}
              className={`flex items-center gap-2 relative transition-all duration-200 ${
                !isPremiumUser 
                  ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                  : 'hover:shadow-sm'
              }`}
              aria-label={isPremiumUser ? "Download all images (Ctrl+D)" : "Bulk download - Premium feature"}
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Download All
              {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" aria-hidden="true" />}
            </Button>
          </Tooltip>

          <Tooltip content={isPremiumUser ? "Advanced compression settings" : "Advanced settings - Premium feature"}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAdvancedSettings}
              disabled={!isPremiumUser}
              className={`flex items-center gap-2 relative transition-all duration-200 ${
                !isPremiumUser 
                  ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                  : 'hover:shadow-sm'
              }`}
              aria-label={isPremiumUser ? "Advanced settings" : "Advanced settings - Premium feature"}
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
              Settings
              {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" aria-hidden="true" />}
            </Button>
          </Tooltip>

          <Tooltip content={isPremiumUser ? "Convert image formats" : "Format conversion - Premium feature"}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleFormatConversion}
              disabled={!isPremiumUser}
              className={`flex items-center gap-2 relative transition-all duration-200 ${
                !isPremiumUser 
                  ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                  : 'hover:shadow-sm'
              }`}
              aria-label={isPremiumUser ? "Convert formats" : "Format conversion - Premium feature"}
            >
              <ImageIcon className="w-4 h-4" aria-hidden="true" />
              Convert
              {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" aria-hidden="true" />}
            </Button>
          </Tooltip>

          <Tooltip content={isPremiumUser ? "Save current settings as favorite" : "Save settings - Premium feature"}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveSettings}
              disabled={!isPremiumUser}
              className={`flex items-center gap-2 relative transition-all duration-200 ${
                !isPremiumUser 
                  ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                  : 'hover:shadow-sm'
              }`}
              aria-label={isPremiumUser ? "Save settings" : "Save settings - Premium feature"}
            >
              <Star className="w-4 h-4" aria-hidden="true" />
              Save Settings
              {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" aria-hidden="true" />}
            </Button>
          </Tooltip>

          <Tooltip content={isPremiumUser ? "Save compression history (Ctrl+S)" : "Save history - Premium feature"}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveHistory}
              disabled={!isPremiumUser}
              className={`flex items-center gap-2 relative transition-all duration-200 ${
                !isPremiumUser 
                  ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                  : 'hover:shadow-sm'
              }`}
              aria-label={isPremiumUser ? "Save history (Ctrl+S)" : "Save history - Premium feature"}
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              History
              {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" aria-hidden="true" />}
            </Button>
          </Tooltip>
        </div>

        {/* Help Button */}
        <Button
          size="sm"
          variant="outline"
          className="ml-auto flex items-center gap-2"
          onClick={handleHelp}
          aria-label="Open help panel (F1)"
          title="Open help panel (F1)"
        >
          <HelpCircle className="w-4 h-4" aria-hidden="true" />
          Help
        </Button>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => handleFileUpload(e.target.files)}
        aria-label="Select image file to upload"
      />
      <input
        ref={batchFileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => handleFileUpload(e.target.files)}
        aria-label="Select multiple image files to upload"
      />

      {/* Upload area */}
      {images.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
          <CardContent className="p-8 text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Upload Images to Compress
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drag and drop images here, or click to browse
            </p>
            <Button onClick={handleSingleUpload}>
              <Upload className="w-4 h-4 mr-2" />
              Choose Images
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Image list */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Images ({images.length})
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {formatFileSize(images.reduce((sum, img) => sum + img.originalSize, 0))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="relative">
                  {image.showComparison && image.compressedPreview ? (
                    <div className="grid grid-cols-2">
                      <div className="relative">
                        <Image 
                          src={image.preview} 
                          alt={`Original ${image.file.name}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          Original
                        </div>
                      </div>
                      <div className="relative">
                        <Image 
                          src={image.compressedPreview} 
                          alt={`Compressed ${image.file.name}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          Compressed
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Image 
                      src={image.preview} 
                      alt={`Original ${image.file.name}`}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRecompress(image)}
                      disabled={isProcessing}
                      aria-label={`Recompress ${image.file.name}`}
                      title={`Recompress ${image.file.name}`}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(image)}
                      disabled={isProcessing}
                      aria-label={`Download ${image.file.name}`}
                      title={`Download ${image.file.name}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveImage(image.id)}
                      disabled={isProcessing}
                      aria-label={`Remove ${image.file.name}`}
                      title={`Remove ${image.file.name}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleComparison(image.id)}
                      disabled={isProcessing}
                      aria-label={`Toggle comparison for ${image.file.name}`}
                      title={`Toggle comparison for ${image.file.name}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {image.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Original: {formatFileSize(image.originalSize)}
                  </p>
                  {image.compressedSize && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Compressed: {formatFileSize(image.compressedSize)}
                    </p>
                  )}
                  {image.compressionRatio !== undefined && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Compression: {image.compressionRatio}%
                    </p>
                  )}
                  {image.status === 'error' && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Error: {image.error}
                    </p>
                  )}
                   {image.status === 'completed' && (
                     <div className="flex gap-2 mt-3">
                       <Button
                         size="sm"
                         variant="outline"
                         onClick={() => handleToggleComparison(image.id)}
                         className="flex-1"
                       >
                         {image.showComparison ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                         {image.showComparison ? 'Hide' : 'Compare'}
                       </Button>
                       <Button
                         size="sm"
                         onClick={() => handleDownload(image)}
                       >
                         <Download className="w-4 h-4 mr-1" />
                         Download
                       </Button>
                     </div>
                   )}
                   
                   {image.status === 'compressing' && (
                     <div className="mt-3 space-y-2">
                       <div className="flex items-center justify-between text-xs">
                         <span>Compressing...</span>
                         <span>{compressionProgress[image.file.name] || 0}%</span>
                       </div>
                       <Progress 
                         value={compressionProgress[image.file.name] || 0} 
                         className="h-2" 
                       />
                     </div>
                   )}
                   
                   {image.status === 'completed' && (
                     <Button
                       size="sm"
                       variant="outline"
                       onClick={() => handleRecompress(image)}
                       className="w-full mt-2"
                     >
                       <Settings className="w-4 h-4 mr-2" />
                       Recompress
                     </Button>
                   )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Help Modal */}
      <HelpPanel 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        isPremiumUser={isPremiumUser} 
      />

      {/* Advanced Settings Modal */}
      {isAdvancedSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Advanced Compression Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                   <Label htmlFor="advanced-quality" className="text-sm font-medium text-gray-700 dark:text-gray-300">Quality: {compressionSettings.quality}%</Label>
                <Slider
                  id="advanced-quality"
                  value={[compressionSettings.quality]}
                  onValueChange={(value) => {
                    setCompressionSettings(prev => ({ ...prev, quality: value[0] }));
                  }}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
                {compressionSettings.quality < 10 && (
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    Very low quality may result in poor image appearance
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                 <Label htmlFor="advanced-format" className="text-sm font-medium text-gray-700 dark:text-gray-300">Format</Label>
                <Select
                  value={compressionSettings.format}
                  onValueChange={(value: 'jpeg' | 'png' | 'webp' | 'avif') => 
                    setCompressionSettings(prev => ({ ...prev, format: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    {isPremiumUser && <SelectItem value="webp">WebP</SelectItem>}
                    {isPremiumUser && <SelectItem value="avif">AVIF</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                 <Label htmlFor="advanced-strip-metadata" className="text-sm font-medium text-gray-700 dark:text-gray-300">Strip Metadata</Label>
                <Button
                  variant={compressionSettings.stripMetadata ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCompressionSettings(prev => ({ ...prev, stripMetadata: !prev.stripMetadata }))}
                  className="w-full"
                >
                  {compressionSettings.stripMetadata ? "Enabled" : "Disabled"}
                </Button>
              </div>

              {/* Premium resize options */}
              {isPremiumUser && (
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                       <Label htmlFor="advanced-max-width" className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Width (px)</Label>
                      <input
                        id="advanced-max-width"
                        type="number"
                        placeholder="Auto"
                        value={compressionSettings.maxWidth || ''}
                        onChange={(e) => setCompressionSettings(prev => ({ 
                          ...prev, 
                          maxWidth: e.target.value ? parseInt(e.target.value) : undefined 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                      />
                    </div>
                    
                    <div className="space-y-2">
                       <Label htmlFor="advanced-max-height" className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Height (px)</Label>
                      <input
                        id="advanced-max-height"
                        type="number"
                        placeholder="Auto"
                        value={compressionSettings.maxHeight || ''}
                        onChange={(e) => setCompressionSettings(prev => ({ 
                          ...prev, 
                          maxHeight: e.target.value ? parseInt(e.target.value) : undefined 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                      />
                    </div>
                    
                    <div className="space-y-2">
                       <Label htmlFor="advanced-resize-percentage" className="text-sm font-medium text-gray-700 dark:text-gray-300">Resize Percentage</Label>
                      <input
                        id="advanced-resize-percentage"
                        type="number"
                        min="1"
                        max="100"
                        placeholder="100"
                        value={compressionSettings.resizePercentage || ''}
                        onChange={(e) => setCompressionSettings(prev => ({ 
                          ...prev, 
                          resizePercentage: e.target.value ? parseInt(e.target.value) : undefined 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center space-x-2">
                    <input
                      id="advanced-maintain-aspect-ratio"
                      type="checkbox"
                      checked={compressionSettings.maintainAspectRatio}
                      onChange={(e) => setCompressionSettings(prev => ({ 
                        ...prev, 
                        maintainAspectRatio: e.target.checked 
                      }))}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="advanced-maintain-aspect-ratio" className="text-sm font-medium text-gray-700 dark:text-gray-300">Maintain aspect ratio</Label>
                  </div>
                </div>
              )}

              {/* Advanced compression options for premium users */}
              {isPremiumUser && (
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        id="advanced-progressive"
                        type="checkbox"
                        checked={compressionSettings.progressive}
                        onChange={(e) => setCompressionSettings(prev => ({ 
                          ...prev, 
                          progressive: e.target.checked 
                        }))}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="advanced-progressive">Progressive JPEG</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        id="advanced-lossless"
                        type="checkbox"
                        checked={compressionSettings.lossless}
                        onChange={(e) => setCompressionSettings(prev => ({ 
                          ...prev, 
                          lossless: e.target.checked 
                        }))}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="advanced-lossless">Lossless compression</Label>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                    <div>• Progressive JPEG: Better loading experience for large images</div>
                    <div>• Lossless: Maintains original quality (PNG, WebP, AVIF only)</div>
                    <div>• AVIF: Best compression, limited browser support</div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="flex-1 min-w-[120px]"
                  onClick={() => setIsAdvancedSettingsOpen(false)}
                  aria-label="Close advanced settings"
                >
                  Cancel
                </Button>
                
                <Button
                  variant="outline"
                  className="flex-1 min-w-[140px]"
                  onClick={handleSaveSettings}
                  disabled={!isPremiumUser}
                  aria-label={isPremiumUser ? "Save current settings" : "Save settings - Premium feature"}
                >
                  <Star className="w-4 h-4 mr-2" aria-hidden="true" />
                  Save Settings
                  {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 ml-1" aria-hidden="true" />}
                </Button>
                
                <Button
                  variant="outline"
                  className="flex-1 min-w-[140px]"
                  onClick={handleLoadSettings}
                  disabled={!isPremiumUser}
                  aria-label={isPremiumUser ? "Load saved settings" : "Load settings - Premium feature"}
                >
                  <FolderOpen className="w-4 h-4 mr-2" aria-hidden="true" />
                  Load Settings
                  {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 ml-1" aria-hidden="true" />}
                </Button>
                
                <Button
                  className="flex-1 min-w-[140px]"
                  onClick={() => setIsAdvancedSettingsOpen(false)}
                  aria-label="Apply current settings"
                >
                  Apply Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Format Conversion Modal */}
      {isFormatConversionOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Format Conversion
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="convert-format">Target Format</Label>
                <Select
                  value={compressionSettings.format}
                  onValueChange={(value: 'jpeg' | 'png' | 'webp' | 'avif') => 
                    setCompressionSettings(prev => ({ ...prev, format: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    {isPremiumUser && <SelectItem value="webp">WebP</SelectItem>}
                    {isPremiumUser && <SelectItem value="avif">AVIF</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="convert-quality">Quality: {compressionSettings.quality}%</Label>
                <Slider
                  id="convert-quality"
                  value={[compressionSettings.quality]}
                  onValueChange={(value) => {
                    setCompressionSettings(prev => ({ ...prev, quality: value[0] }));
                  }}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
                {compressionSettings.quality < 10 && (
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    Very low quality may result in poor image appearance
                  </div>
                )}
              </div>
              
              <Button
                className="mt-6 w-full"
                onClick={() => setIsFormatConversionOpen(false)}
                aria-label="Close format conversion"
              >
                Convert Image
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Compression History
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsHistoryOpen(false)}
                aria-label="Close history"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Loading history...</span>
              </div>
            ) : compressionHistory.length === 0 ? (
              <div className="text-center py-8">
                <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  No compression history found
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Your compression activities will appear here once you start compressing images.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Showing {compressionHistory.length} recent compression activities
                </div>
                
                {compressionHistory.map((entry) => (
                  <Card key={entry.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileImage className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {entry.original_filename}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Original:</span>
                            <span className="ml-1 font-medium">{formatFileSize(entry.original_size)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Compressed:</span>
                            <span className="ml-1 font-medium">{formatFileSize(entry.compressed_size)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Ratio:</span>
                            <span className="ml-1 font-medium">{entry.compression_ratio.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Format:</span>
                            <span className="ml-1 font-medium">{entry.settings.format.toUpperCase()}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(entry.created_at).toLocaleDateString()} at {new Date(entry.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCompressionSettings(entry.settings);
                            setIsHistoryOpen(false);
                            toast.success('Settings Applied', {
                              description: `Applied settings from ${entry.original_filename}`
                            });
                          }}
                          aria-label="Apply settings from this entry"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Apply
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await imageCompressionDB.deleteHistory(entry.id);
                              setCompressionHistory(compressionHistory.filter(h => h.id !== entry.id));
                              toast.success('Entry Deleted', {
                                description: 'History entry removed successfully'
                              });
                            } catch (error) {
                              toast.error('Error', {
                                description: 'Failed to delete history entry'
                              });
                            }
                          }}
                          aria-label="Delete this history entry"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setIsHistoryOpen(false)}
                aria-label="Close history"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Save Settings Modal */}
      {isSaveSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Save Settings
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Give your settings a memorable name for quick access later.
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="settings-name">Settings Name</Label>
                <input
                  id="settings-name"
                  type="text"
                  placeholder="e.g., Web Optimization, Print Quality, Social Media"
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  autoFocus
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="set-as-default"
                  type="checkbox"
                  checked={isDefaultSetting}
                  onChange={(e) => setIsDefaultSetting(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="set-as-default">Set as default settings</Label>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium mb-2">Current Settings:</p>
                <ul className="space-y-1">
                  <li>• Quality: {compressionSettings.quality}%</li>
                  <li>• Format: {compressionSettings.format?.toUpperCase() || 'JPEG'}</li>
                  <li>• Strip Metadata: {compressionSettings.stripMetadata ? 'Yes' : 'No'}</li>
                  {compressionSettings.maxWidth && <li>• Max Width: {compressionSettings.maxWidth}px</li>}
                  {compressionSettings.maxHeight && <li>• Max Height: {compressionSettings.maxHeight}px</li>}
                  {compressionSettings.resizePercentage && <li>• Resize: {compressionSettings.resizePercentage}%</li>}
                  {compressionSettings.progressive && <li>• Progressive: Yes</li>}
                  {compressionSettings.lossless && <li>• Lossless: Yes</li>}
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSettingsName('');
                  setIsSaveSettingsOpen(false);
                }}
                aria-label="Cancel save settings"
              >
                Cancel
              </Button>
              
              <Button
                className="flex-1"
                onClick={handleConfirmSaveSettings}
                disabled={!settingsName.trim()}
                aria-label="Save settings"
              >
                <Star className="w-4 h-4 mr-2" aria-hidden="true" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Load Settings Modal */}
      {isLoadSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Load Saved Settings
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Choose from your saved compression settings.
            </p>
            
            <div className="overflow-y-auto max-h-[60vh]">
              {savedSettings.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No saved settings found.</p>
                  <p className="text-sm">Save some settings first to see them here.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {savedSettings.map((setting) => (
                    <Card key={setting.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {setting.name}
                            </h4>
                            {setting.is_default && (
                              <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <div>• Quality: {setting.settings.quality}%</div>
                            <div>• Format: {setting.settings.format?.toUpperCase() || 'JPEG'}</div>
                            <div>• Strip Metadata: {setting.settings.stripMetadata ? 'Yes' : 'No'}</div>
                            {setting.settings.maxWidth && <div>• Max Width: {setting.settings.maxWidth}px</div>}
                            {setting.settings.maxHeight && <div>• Max Height: {setting.settings.maxHeight}px</div>}
                            {setting.settings.progressive && <div>• Progressive: Yes</div>}
                            {setting.settings.lossless && <div>• Lossless: Yes</div>}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleApplySavedSettings(setting)}
                            aria-label={`Apply ${setting.name} settings`}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Apply
                          </Button>
                          
                          {!setting.is_default && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetAsDefault(setting)}
                              aria-label={`Set ${setting.name} as default`}
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSavedSettings(setting.id)}
                            aria-label={`Delete ${setting.name} settings`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setIsLoadSettingsOpen(false)}
                aria-label="Close load settings"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}