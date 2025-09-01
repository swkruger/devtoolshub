import { Metadata } from 'next'
import { listPublishedBlogs, listFeaturedBlogs, listPopularBlogs } from '@/lib/services/blogs'
import { BlogListClient } from '@/components/blog/blog-list-client'
import { getMetadataApplicationName } from '@/lib/app-config'
import Link from 'next/link'

export const metadata: Metadata = {
  title: `Blog - ${getMetadataApplicationName()}`,
  description: `Product updates, best practices, and tips for using ${getMetadataApplicationName()}. Stay ahead with the latest insights and tutorials.`,
  openGraph: {
    title: `Blog - ${getMetadataApplicationName()}`,
    description: `Product updates, best practices, and tips for using ${getMetadataApplicationName()}. Stay ahead with the latest insights and tutorials.`,
    type: 'website',
  },
}

export default async function BlogPage() {
  const [blogs, featuredBlogs, popularBlogs] = await Promise.all([
    listPublishedBlogs(),
    listFeaturedBlogs(3),
    listPopularBlogs(5),
  ])

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          ← Back to {getMetadataApplicationName()}
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mt-4">
          {getMetadataApplicationName()} Blog
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">
          Product updates, best practices, and tips for using {getMetadataApplicationName()}. Stay ahead with the latest insights and tutorials.
        </p>
      </div>

      <BlogListClient blogs={blogs} featuredBlogs={featuredBlogs} popularBlogs={popularBlogs} />
    </div>
  )
}

