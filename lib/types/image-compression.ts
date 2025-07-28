// Image Compression Database Types

export interface CompressionHistory {
  id: string;
  user_id: string;
  original_filename: string;
  original_size: number;
  compressed_size: number;
  compression_ratio: number;
  settings: CompressionSettings;
  created_at: string;
  updated_at: string;
}

export interface CompressionFavorite {
  id: string;
  user_id: string;
  name: string;
  settings: CompressionSettings;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompressionPreferences {
  id: string;
  user_id: string;
  preferences: {
    default_quality?: number;
    default_format?: 'jpeg' | 'png' | 'webp' | 'avif';
    auto_save_history?: boolean;
    show_advanced_settings?: boolean;
    preferred_compression_method?: 'balanced' | 'quality' | 'size';
    max_file_size?: number;
    enable_batch_processing?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface CompressionAnalytics {
  id: string;
  user_id?: string;
  session_id?: string;
  action: 'upload' | 'compress' | 'download' | 'batch_process' | 'save_favorite' | 'load_favorite' | 'delete_history';
  details?: {
    file_count?: number;
    total_size?: number;
    compression_ratio?: number;
    format?: string;
    quality?: number;
    processing_time?: number;
    error?: string;
  };
  created_at: string;
}

export interface CompressionSettings {
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

// Database operation types
export interface SaveHistoryParams {
  original_filename: string;
  original_size: number;
  compressed_size: number;
  compression_ratio: number;
  settings: CompressionSettings;
}

export interface SaveFavoriteParams {
  name: string;
  settings: CompressionSettings;
  is_default?: boolean;
}

export interface UpdatePreferencesParams {
  preferences: Partial<CompressionPreferences['preferences']>;
}

export interface TrackAnalyticsParams {
  action: CompressionAnalytics['action'];
  details?: CompressionAnalytics['details'];
  session_id?: string;
}

// API response types
export interface CompressionHistoryResponse {
  data: CompressionHistory[];
  count: number;
  error?: string;
}

export interface CompressionFavoritesResponse {
  data: CompressionFavorite[];
  count: number;
  error?: string;
}

export interface CompressionPreferencesResponse {
  data: CompressionPreferences | null;
  error?: string;
}

export interface SaveResponse {
  success: boolean;
  id?: string;
  error?: string;
} 