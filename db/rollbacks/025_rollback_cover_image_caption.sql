-- Rollback: Remove cover_image_caption field from blogs table

-- Drop the index first
DROP INDEX IF EXISTS idx_blogs_cover_image_caption;

-- Remove the column
ALTER TABLE public.blogs 
DROP COLUMN IF EXISTS cover_image_caption;
