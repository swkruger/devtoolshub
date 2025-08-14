-- Mark the latest blog as featured
UPDATE public.blogs 
SET is_featured = TRUE
WHERE id = (
  SELECT id 
  FROM public.blogs 
  WHERE status = 'published' 
  ORDER BY published_at DESC 
  LIMIT 1
);
