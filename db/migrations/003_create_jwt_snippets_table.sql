-- Create JWT snippets table
CREATE TABLE IF NOT EXISTS jwt_snippets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  jwt_token TEXT NOT NULL,
  decoded_header JSONB,
  decoded_payload JSONB,
  algorithm VARCHAR(50),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jwt_snippets_user_id ON jwt_snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_jwt_snippets_created_at ON jwt_snippets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jwt_snippets_is_favorite ON jwt_snippets(user_id, is_favorite) WHERE is_favorite = TRUE;

-- Enable Row Level Security
ALTER TABLE jwt_snippets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own JWT snippets" ON jwt_snippets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own JWT snippets" ON jwt_snippets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own JWT snippets" ON jwt_snippets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own JWT snippets" ON jwt_snippets
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jwt_snippets_updated_at 
  BEFORE UPDATE ON jwt_snippets 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 