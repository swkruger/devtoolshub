-- Rollback for 012_mark_latest_blog_as_featured.sql

-- Reset the featured flag for the blog that was marked as featured
UPDATE public.blogs 
SET is_featured = FALSE
WHERE id = (
  SELECT id 
  FROM public.blogs 
  WHERE status = 'published' 
  ORDER BY published_at DESC 
  LIMIT 1
);
