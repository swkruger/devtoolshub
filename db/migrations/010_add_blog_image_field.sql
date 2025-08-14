-- Add image_url field to blogs table
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add index for image_url queries
CREATE INDEX IF NOT EXISTS idx_blogs_image_url ON public.blogs(image_url);
