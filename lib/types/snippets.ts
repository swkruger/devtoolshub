export interface JsonSnippet {
  id: string
  user_id: string
  name: string
  category: string
  content: string
  description?: string
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface CreateSnippetData {
  name: string
  category: string
  content: string
  description?: string
  is_favorite?: boolean
}

export interface UpdateSnippetData {
  name?: string
  category?: string
  content?: string
  description?: string
  is_favorite?: boolean
}

export interface SnippetCategory {
  name: string
  count: number
}

export const DEFAULT_CATEGORIES = [
  'general',
  'api-response', 
  'configuration',
  'sample-data',
  'schema',
  'test-data',
  'user-data',
  'template'
] as const

export type DefaultCategory = typeof DEFAULT_CATEGORIES[number] 