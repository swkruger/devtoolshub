-- Create user_tool_favorites table to persist tool favorites per user
CREATE TABLE IF NOT EXISTS public.user_tool_favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, tool_id)
);

-- Enable RLS
ALTER TABLE public.user_tool_favorites ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Favorites: select own" ON public.user_tool_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Favorites: insert own" ON public.user_tool_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Favorites: delete own" ON public.user_tool_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_user_tool_favorites_user ON public.user_tool_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tool_favorites_tool ON public.user_tool_favorites(tool_id);


