-- Create json_snippets table
CREATE TABLE IF NOT EXISTS json_snippets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  content TEXT NOT NULL,
  description TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger to json_snippets table for updated_at
CREATE TRIGGER update_json_snippets_updated_at 
  BEFORE UPDATE ON json_snippets 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE json_snippets ENABLE ROW LEVEL SECURITY;

-- Create policies for json_snippets
CREATE POLICY "Users can view own snippets" ON json_snippets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own snippets" ON json_snippets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own snippets" ON json_snippets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own snippets" ON json_snippets
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS json_snippets_user_id_idx ON json_snippets(user_id);
CREATE INDEX IF NOT EXISTS json_snippets_category_idx ON json_snippets(category);
CREATE INDEX IF NOT EXISTS json_snippets_is_favorite_idx ON json_snippets(is_favorite);
CREATE INDEX IF NOT EXISTS json_snippets_created_at_idx ON json_snippets(created_at);
CREATE INDEX IF NOT EXISTS json_snippets_name_idx ON json_snippets(name);

-- Create a composite index for user queries
CREATE INDEX IF NOT EXISTS json_snippets_user_category_created_idx 
  ON json_snippets(user_id, category, created_at DESC); 