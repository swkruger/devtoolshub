import { createSupabaseClient } from '@/lib/supabase'
import { 
  JsonSnippet, 
  CreateSnippetData, 
  UpdateSnippetData,
  SnippetCategory 
} from '@/lib/types/snippets'

export class SnippetsService {
  private supabase = createSupabaseClient()

  async getUserSnippets(userId: string): Promise<JsonSnippet[]> {
    const { data, error } = await this.supabase
      .from('json_snippets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch snippets: ${error.message}`)
    }

    return data || []
  }

  async getSnippetsByCategory(userId: string, category: string): Promise<JsonSnippet[]> {
    const { data, error } = await this.supabase
      .from('json_snippets')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch snippets for category: ${error.message}`)
    }

    return data || []
  }

  async getFavoriteSnippets(userId: string): Promise<JsonSnippet[]> {
    const { data, error } = await this.supabase
      .from('json_snippets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_favorite', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch favorite snippets: ${error.message}`)
    }

    return data || []
  }

  async getCategories(userId: string): Promise<SnippetCategory[]> {
    const { data, error } = await this.supabase
      .from('json_snippets')
      .select('category')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`)
    }

    // Group by category and count
    const categoryMap = new Map<string, number>()
    data?.forEach((snippet: { category: string }) => {
      const count = categoryMap.get(snippet.category) || 0
      categoryMap.set(snippet.category, count + 1)
    })

    return Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => a.name.localeCompare(b.name))
  }

  async createSnippet(userId: string, snippetData: CreateSnippetData): Promise<JsonSnippet> {
    const { data, error } = await this.supabase
      .from('json_snippets')
      .insert({
        user_id: userId,
        ...snippetData
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create snippet: ${error.message}`)
    }

    return data
  }

  async updateSnippet(snippetId: string, snippetData: UpdateSnippetData): Promise<JsonSnippet> {
    const { data, error } = await this.supabase
      .from('json_snippets')
      .update(snippetData)
      .eq('id', snippetId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update snippet: ${error.message}`)
    }

    return data
  }

  async deleteSnippet(snippetId: string): Promise<void> {
    const { error } = await this.supabase
      .from('json_snippets')
      .delete()
      .eq('id', snippetId)

    if (error) {
      throw new Error(`Failed to delete snippet: ${error.message}`)
    }
  }

  async searchSnippets(userId: string, searchTerm: string): Promise<JsonSnippet[]> {
    const { data, error } = await this.supabase
      .from('json_snippets')
      .select('*')
      .eq('user_id', userId)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to search snippets: ${error.message}`)
    }

    return data || []
  }

  async getSnippet(snippetId: string): Promise<JsonSnippet | null> {
    const { data, error } = await this.supabase
      .from('json_snippets')
      .select('*')
      .eq('id', snippetId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Failed to fetch snippet: ${error.message}`)
    }

    return data
  }
} 