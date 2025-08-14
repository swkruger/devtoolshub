-- Rollback for 011_update_seed_blogs_with_images.sql

UPDATE public.blogs 
SET image_url = NULL
WHERE slug IN (
  'world-clock-and-time-zones-launch',
  'regex-tester-multi-engine-best-practices',
  'jwt-decoder-encoder-secure-workflows',
  'image-compressor-avif-webp-tips',
  'base64-encoder-decoder-files-history'
);
