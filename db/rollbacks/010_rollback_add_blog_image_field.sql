-- Rollback for 010_add_blog_image_field.sql

DROP INDEX IF EXISTS idx_blogs_image_url;

ALTER TABLE public.blogs 
DROP COLUMN IF EXISTS image_url;
