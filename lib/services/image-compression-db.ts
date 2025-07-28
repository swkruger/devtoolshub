import { createSupabaseClient } from '@/lib/supabase';
import type {
  CompressionHistory,
  CompressionFavorite,
  CompressionPreferences,
  CompressionAnalytics,
  SaveHistoryParams,
  SaveFavoriteParams,
  UpdatePreferencesParams,
  TrackAnalyticsParams,
  CompressionHistoryResponse,
  CompressionFavoritesResponse,
  CompressionPreferencesResponse,
  SaveResponse
} from '@/lib/types/image-compression';

export class ImageCompressionDB {
  private supabase;

  constructor() {
    this.supabase = createSupabaseClient();
  }

  // Compression History Methods
  async saveHistory(params: SaveHistoryParams): Promise<SaveResponse> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await this.supabase
        .from('image_compression_history')
        .insert({
          user_id: user.id,
          original_filename: params.original_filename,
          original_size: params.original_size,
          compressed_size: params.compressed_size,
          compression_ratio: params.compression_ratio,
          settings: params.settings
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving compression history:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: data.id };
    } catch (error) {
      console.error('Error saving compression history:', error);
      return { success: false, error: 'Failed to save compression history' };
    }
  }

  async getHistory(limit = 50, offset = 0): Promise<CompressionHistoryResponse> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { data: [], count: 0, error: 'User not authenticated' };
      }

      const { data, error, count } = await this.supabase
        .from('image_compression_history')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching compression history:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error fetching compression history:', error);
      return { data: [], count: 0, error: 'Failed to fetch compression history' };
    }
  }

  async deleteHistory(id: string): Promise<SaveResponse> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await this.supabase
        .from('image_compression_history')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting compression history:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting compression history:', error);
      return { success: false, error: 'Failed to delete compression history' };
    }
  }

  // Favorite Settings Methods
  async saveFavorite(params: SaveFavoriteParams): Promise<SaveResponse> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // If this is set as default, unset other defaults
      if (params.is_default) {
        await this.supabase
          .from('image_compression_favorites')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true);
      }

      const { data, error } = await this.supabase
        .from('image_compression_favorites')
        .upsert({
          user_id: user.id,
          name: params.name,
          settings: params.settings,
          is_default: params.is_default || false
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving favorite settings:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: data.id };
    } catch (error) {
      console.error('Error saving favorite settings:', error);
      return { success: false, error: 'Failed to save favorite settings' };
    }
  }

  async getFavorites(): Promise<CompressionFavoritesResponse> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { data: [], count: 0, error: 'User not authenticated' };
      }

      const { data, error, count } = await this.supabase
        .from('image_compression_favorites')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorites:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return { data: [], count: 0, error: 'Failed to fetch favorites' };
    }
  }

  async deleteFavorite(id: string): Promise<SaveResponse> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await this.supabase
        .from('image_compression_favorites')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting favorite:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting favorite:', error);
      return { success: false, error: 'Failed to delete favorite' };
    }
  }

  // User Preferences Methods
  async getPreferences(): Promise<CompressionPreferencesResponse> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await this.supabase
        .from('image_compression_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching preferences:', error);
        return { data: null, error: error.message };
      }

      return { data: data || null };
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return { data: null, error: 'Failed to fetch preferences' };
    }
  }

  async updatePreferences(params: UpdatePreferencesParams): Promise<SaveResponse> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await this.supabase
        .from('image_compression_preferences')
        .upsert({
          user_id: user.id,
          preferences: params.preferences
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating preferences:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: data.id };
    } catch (error) {
      console.error('Error updating preferences:', error);
      return { success: false, error: 'Failed to update preferences' };
    }
  }

  // Analytics Methods
  async trackAnalytics(params: TrackAnalyticsParams): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      await this.supabase
        .from('image_compression_analytics')
        .insert({
          user_id: user?.id || null,
          session_id: params.session_id,
          action: params.action,
          details: params.details
        });

    } catch (error) {
      console.error('Error tracking analytics:', error);
      // Don't throw error for analytics failures
    }
  }

  // Utility Methods
  async getDefaultSettings(): Promise<CompressionFavorite | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return null;
      }

      const { data, error } = await this.supabase
        .from('image_compression_favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching default settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching default settings:', error);
      return null;
    }
  }
}

// Export singleton instance
export const imageCompressionDB = new ImageCompressionDB(); 