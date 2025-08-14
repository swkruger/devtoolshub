-- Rollback for 006_create_blogs_table.sql

-- Drop trigger
DROP TRIGGER IF EXISTS update_blogs_updated_at ON public.blogs;

-- Drop table
DROP TABLE IF EXISTS public.blogs;

