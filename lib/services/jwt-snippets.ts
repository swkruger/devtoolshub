import { createSupabaseServerClient } from '@/lib/supabase-server';
import { JwtSnippet, CreateJwtSnippetRequest, UpdateJwtSnippetRequest, JwtSnippetFilters } from '@/lib/types/jwt-snippets';

export class JwtSnippetsService {
  private supabase = createSupabaseServerClient();

  async createSnippet(userId: string, data: CreateJwtSnippetRequest): Promise<JwtSnippet> {
    const { data: snippet, error } = await this.supabase
      .from('jwt_snippets')
      .insert({
        user_id: userId,
        ...data
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create JWT snippet: ${error.message}`);
    }

    return snippet;
  }

  async getSnippets(userId: string, filters?: JwtSnippetFilters): Promise<JwtSnippet[]> {
    let query = this.supabase
      .from('jwt_snippets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.is_favorite !== undefined) {
      query = query.eq('is_favorite', filters.is_favorite);
    }

    if (filters?.algorithm) {
      query = query.eq('algorithm', filters.algorithm);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    const { data: snippets, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch JWT snippets: ${error.message}`);
    }

    return snippets || [];
  }

  async getSnippet(userId: string, snippetId: string): Promise<JwtSnippet> {
    const { data: snippet, error } = await this.supabase
      .from('jwt_snippets')
      .select('*')
      .eq('user_id', userId)
      .eq('id', snippetId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch JWT snippet: ${error.message}`);
    }

    return snippet;
  }

  async updateSnippet(userId: string, snippetId: string, data: UpdateJwtSnippetRequest): Promise<JwtSnippet> {
    const { data: snippet, error } = await this.supabase
      .from('jwt_snippets')
      .update(data)
      .eq('user_id', userId)
      .eq('id', snippetId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update JWT snippet: ${error.message}`);
    }

    return snippet;
  }

  async deleteSnippet(userId: string, snippetId: string): Promise<void> {
    const { error } = await this.supabase
      .from('jwt_snippets')
      .delete()
      .eq('user_id', userId)
      .eq('id', snippetId);

    if (error) {
      throw new Error(`Failed to delete JWT snippet: ${error.message}`);
    }
  }

  async toggleFavorite(userId: string, snippetId: string): Promise<JwtSnippet> {
    // First get the current snippet to toggle the favorite status
    const currentSnippet = await this.getSnippet(userId, snippetId);
    
    const { data: snippet, error } = await this.supabase
      .from('jwt_snippets')
      .update({ is_favorite: !currentSnippet.is_favorite })
      .eq('user_id', userId)
      .eq('id', snippetId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to toggle favorite: ${error.message}`);
    }

    return snippet;
  }

  async getFavorites(userId: string): Promise<JwtSnippet[]> {
    return this.getSnippets(userId, { is_favorite: true });
  }

  async getSnippetsByAlgorithm(userId: string, algorithm: string): Promise<JwtSnippet[]> {
    return this.getSnippets(userId, { algorithm });
  }

  async searchSnippets(userId: string, searchTerm: string): Promise<JwtSnippet[]> {
    return this.getSnippets(userId, { search: searchTerm });
  }
} 