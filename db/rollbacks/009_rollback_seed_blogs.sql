-- Rollback for 009_seed_blogs.sql

DELETE FROM public.blogs
WHERE slug IN (
  'world-clock-and-time-zones-launch',
  'regex-tester-multi-engine-best-practices',
  'jwt-decoder-encoder-secure-workflows',
  'image-compressor-avif-webp-tips',
  'base64-encoder-decoder-files-history'
);

