-- Add cover_image_alt_text field to blogs table
-- This field will store alt text for the cover image to improve accessibility

ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS cover_image_alt_text TEXT;

-- Add comment to document the field
COMMENT ON COLUMN public.blogs.cover_image_alt_text IS 'Alt text for the cover image to improve accessibility and SEO';

-- Create index for better query performance when filtering by cover_image_alt_text
CREATE INDEX IF NOT EXISTS idx_blogs_cover_image_alt_text ON public.blogs(cover_image_alt_text) WHERE cover_image_alt_text IS NOT NULL;

