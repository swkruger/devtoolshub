import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://devtoolshub.vercel.app'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/_next/',
          '/private/',
          '/dashboard/',
          '/settings/',
          '/go-backer/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/_next/',
          '/private/',
          '/dashboard/',
          '/settings/',
          '/go-backer/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
} 