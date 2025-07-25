export interface JwtSnippet {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  jwt_token: string;
  decoded_header?: any;
  decoded_payload?: any;
  algorithm?: string;
  expires_at?: string;
  is_favorite: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateJwtSnippetRequest {
  name: string;
  description?: string;
  jwt_token: string;
  decoded_header?: any;
  decoded_payload?: any;
  algorithm?: string;
  expires_at?: string;
  tags?: string[];
}

export interface UpdateJwtSnippetRequest {
  name?: string;
  description?: string;
  is_favorite?: boolean;
  tags?: string[];
}

export interface JwtSnippetFilters {
  search?: string;
  is_favorite?: boolean;
  algorithm?: string;
  tags?: string[];
} 