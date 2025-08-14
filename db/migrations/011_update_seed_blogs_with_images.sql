-- Update seed blogs with image URLs
UPDATE public.blogs 
SET image_url = 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&crop=center'
WHERE slug = 'world-clock-and-time-zones-launch';

UPDATE public.blogs 
SET image_url = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop&crop=center'
WHERE slug = 'regex-tester-multi-engine-best-practices';

UPDATE public.blogs 
SET image_url = 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=400&fit=crop&crop=center'
WHERE slug = 'jwt-decoder-encoder-secure-workflows';

UPDATE public.blogs 
SET image_url = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=400&fit=crop&crop=center'
WHERE slug = 'image-compressor-avif-webp-tips';

UPDATE public.blogs 
SET image_url = 'https://images.unsplash.com/photo-1555066932-e78dd8fb77bb?w=800&h=400&fit=crop&crop=center'
WHERE slug = 'base64-encoder-decoder-files-history';
