import { Blog } from '@/lib/types/blog'
import { BlogCard } from '@/components/blog/blog-card'

interface BlogListProps {
  blogs: Blog[]
}

export function BlogList({ blogs }: BlogListProps) {
  if (!blogs || blogs.length === 0) {
    return <div className="text-sm text-muted-foreground">No posts found.</div>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {blogs.map((b) => (
        <BlogCard key={b.id} blog={b} />
      ))}
    </div>
  )
}

