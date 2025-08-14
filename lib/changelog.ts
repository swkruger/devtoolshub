export type ChangelogEntry = {
  date: string
  title: string
  tags?: string[]
  items: string[]
}

// Update this list after each major tool development or release
export const getChangelog = (): ChangelogEntry[] => [
  {
    date: '2025-08-14',
    title: 'Blog System – Complete Implementation',
    tags: ['blog', 'cms', 'admin', 'seo'],
    items: [
      'Full-featured blog system with admin-only CRUD operations and public read access',
      'Database schema with blogs table, admin profiles, RLS policies, and image support',
      'Modern blog overview page with featured articles, search, pagination, and responsive design',
      'Professional blog detail pages with author info, engagement icons, and related posts',
      'Admin dashboard for blog management with WYSIWYG editor and image uploads',
      'SEO integration with dynamic sitemap generation and structured data',
      'Blog integration on landing page with featured and popular articles sections',
      'Comprehensive seed data with 5 sample blog posts and placeholder images',
    ],
  },
  {
    date: '2025-08-12',
    title: 'Public Docs, SEO, and Routing Improvements',
    tags: ['docs', 'seo', 'routing'],
    items: [
      'Added static, SEO‑optimized documentation for all tools under /docs with light/dark mode',
      'Introduced per‑tool personalized content overrides (docs-content/<tool>/intro|how-it-works|steps|examples.html)',
      'Created professional /docs landing grid with tool cards and metadata',
      'Mirrored docs to public/docs for in‑app serving; added robots.txt and sitemaps',
      'Top‑level shortcuts (/world-clock, /json-formatter, etc.) now rewrite to public docs',
      'Unauthenticated /tools/<slug> requests redirect to /docs/<slug> instead of sign‑in',
      'Added docs link icon to tool cards on the landing page',
    ],
  },
  {
    date: '2025-01-05',
    title: 'World Clock & Time Zones – Complete',
    tags: ['world-clock', 'premium'],
    items: [
      'Card‑based timezone view with real‑time updates and meeting planner',
      'Premium: unlimited cities, weather overlays, calendar export, ±30 day range',
      'Accessibility and keyboard shortcuts; responsive layout',
    ],
  },
  {
    date: '2024-12-29',
    title: 'Core Tools Suite Enhancements',
    tags: ['json', 'regex', 'jwt', 'base64', 'uuid', 'image'],
    items: [
      'JSON Formatter with validation, sorting, and minify',
      'Regex Tester with multi‑engine support and advanced analytics (premium)',
      'JWT Decoder/Encoder with signature verification (premium)',
      'Base64 Encoder/Decoder with file support and batch (premium)',
      'UUID Generator with bulk export and namespace management (premium)',
      'Image Compressor with WebP/AVIF and batch processing (premium)',
    ],
  },
]


