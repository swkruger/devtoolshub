-- Add SEO fields to blogs table
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords TEXT,
ADD COLUMN IF NOT EXISTS og_title TEXT,
ADD COLUMN IF NOT EXISTS og_description TEXT,
ADD COLUMN IF NOT EXISTS og_image TEXT,
ADD COLUMN IF NOT EXISTS twitter_title TEXT,
ADD COLUMN IF NOT EXISTS twitter_description TEXT,
ADD COLUMN IF NOT EXISTS twitter_image TEXT;

-- Add indexes for SEO queries
CREATE INDEX IF NOT EXISTS idx_blogs_meta_description ON public.blogs(meta_description);
CREATE INDEX IF NOT EXISTS idx_blogs_meta_keywords ON public.blogs(meta_keywords);

