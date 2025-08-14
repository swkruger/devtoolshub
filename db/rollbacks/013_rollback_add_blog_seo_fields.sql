-- Rollback for 013_add_blog_seo_fields.sql

-- Drop indexes
DROP INDEX IF EXISTS idx_blogs_meta_keywords;
DROP INDEX IF EXISTS idx_blogs_meta_description;

-- Remove SEO columns
ALTER TABLE public.blogs 
DROP COLUMN IF EXISTS twitter_image,
DROP COLUMN IF EXISTS twitter_description,
DROP COLUMN IF EXISTS twitter_title,
DROP COLUMN IF EXISTS og_image,
DROP COLUMN IF EXISTS og_description,
DROP COLUMN IF EXISTS og_title,
DROP COLUMN IF EXISTS meta_keywords,
DROP COLUMN IF EXISTS meta_description;

