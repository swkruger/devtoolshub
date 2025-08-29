-- Add cover_image_caption field to blogs table
-- This field will store a short caption/name for the cover image displayed below it

ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS cover_image_caption TEXT;

-- Add comment to document the field
COMMENT ON COLUMN public.blogs.cover_image_caption IS 'Short caption/name for the cover image displayed below it';

-- Create index for better query performance when filtering by cover_image_caption
CREATE INDEX IF NOT EXISTS idx_blogs_cover_image_caption ON public.blogs(cover_image_caption) WHERE cover_image_caption IS NOT NULL;
