-- Seed example blogs (published)

INSERT INTO public.blogs (title, slug, content_html, status, is_featured, is_popular, published_at, author_id)
SELECT
  'World Clock & Time Zones Launch',
  'world-clock-and-time-zones-launch',
  '<h1>World Clock & Time Zones Launch</h1><p>We''re excited to launch our World Clock tool with real-time updates, meeting planner, and premium weather integration.</p><p><img src="https://via.placeholder.com/800x400" alt="World Clock" /></p>',
  'published',
  TRUE,
  TRUE,
  NOW() - interval '10 days',
  auth.uid()
WHERE auth.uid() IS NOT NULL
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.blogs (title, slug, content_html, status, is_featured, is_popular, published_at, author_id)
VALUES (
  'Regex Tester: Multi-Engine Best Practices',
  'regex-tester-multi-engine-best-practices',
  '<h1>Regex Tester: Multi-Engine Best Practices</h1><p>Learn how to test patterns across JavaScript, Python, Java, and Go engines with confidence.</p>',
  'published',
  FALSE,
  FALSE,
  NOW() - interval '8 days',
  (SELECT id FROM public.users ORDER BY created_at LIMIT 1)
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.blogs (title, slug, content_html, status, is_featured, is_popular, published_at, author_id)
VALUES (
  'JWT Decoder/Encoder: Secure Workflows',
  'jwt-decoder-encoder-secure-workflows',
  '<h1>JWT Decoder/Encoder</h1><p>Ensure tokens are verified correctly and avoid common pitfalls with signature algorithms.</p>',
  'published',
  FALSE,
  FALSE,
  NOW() - interval '6 days',
  (SELECT id FROM public.users ORDER BY created_at LIMIT 1)
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.blogs (title, slug, content_html, status, is_featured, is_popular, published_at, author_id)
VALUES (
  'Image Compressor: AVIF & WebP Tips',
  'image-compressor-avif-webp-tips',
  '<h1>Image Compressor: AVIF & WebP Tips</h1><p>Get the smallest files with the best quality using AVIF and WebP. Batch processing included.</p><p><img src="https://via.placeholder.com/800x400" alt="Image Compressor" /></p>',
  'published',
  FALSE,
  TRUE,
  NOW() - interval '5 days',
  (SELECT id FROM public.users ORDER BY created_at LIMIT 1)
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.blogs (title, slug, content_html, status, is_featured, is_popular, published_at, author_id)
VALUES (
  'Base64 Encoder/Decoder: Files & History',
  'base64-encoder-decoder-files-history',
  '<h1>Base64 Encoder/Decoder</h1><p>Encode/decode text and files with URL-safe options, batch mode, and history management.</p>',
  'published',
  FALSE,
  FALSE,
  NOW() - interval '3 days',
  (SELECT id FROM public.users ORDER BY created_at LIMIT 1)
)
ON CONFLICT (slug) DO NOTHING;

