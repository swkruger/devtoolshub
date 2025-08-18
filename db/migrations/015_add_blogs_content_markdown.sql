-- Add Markdown content column to blogs
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS content_markdown TEXT NULL;


