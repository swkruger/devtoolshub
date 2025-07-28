-- Migration: Create image compression tables
-- Date: 2024-12-28
-- Description: Add tables for compression history, favorite settings, and user preferences

-- Compression history table
CREATE TABLE IF NOT EXISTS image_compression_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  original_size BIGINT NOT NULL,
  compressed_size BIGINT NOT NULL,
  compression_ratio INTEGER NOT NULL,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorite compression settings table
CREATE TABLE IF NOT EXISTS image_compression_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  settings JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- User preferences table
CREATE TABLE IF NOT EXISTS image_compression_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Analytics tracking table
CREATE TABLE IF NOT EXISTS image_compression_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE image_compression_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_compression_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_compression_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_compression_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for image_compression_history
CREATE POLICY "Users can view their own compression history" ON image_compression_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own compression history" ON image_compression_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own compression history" ON image_compression_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own compression history" ON image_compression_history
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for image_compression_favorites
CREATE POLICY "Users can view their own favorites" ON image_compression_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON image_compression_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites" ON image_compression_favorites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON image_compression_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for image_compression_preferences
CREATE POLICY "Users can view their own preferences" ON image_compression_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON image_compression_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON image_compression_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON image_compression_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for image_compression_analytics (more permissive for analytics)
CREATE POLICY "Users can view their own analytics" ON image_compression_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert analytics" ON image_compression_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_image_compression_history_user_id ON image_compression_history(user_id);
CREATE INDEX IF NOT EXISTS idx_image_compression_history_created_at ON image_compression_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_image_compression_favorites_user_id ON image_compression_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_image_compression_preferences_user_id ON image_compression_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_image_compression_analytics_user_id ON image_compression_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_image_compression_analytics_created_at ON image_compression_analytics(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_image_compression_history_updated_at 
  BEFORE UPDATE ON image_compression_history 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_image_compression_favorites_updated_at 
  BEFORE UPDATE ON image_compression_favorites 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_image_compression_preferences_updated_at 
  BEFORE UPDATE ON image_compression_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 