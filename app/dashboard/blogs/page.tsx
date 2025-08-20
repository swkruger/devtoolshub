import Link from 'next/link'
import { redirect } from 'next/navigation'
import { authServer } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const revalidate = 0

export default async function AdminBlogsListPage({ searchParams }: { searchParams?: { status?: 'all' | 'draft' | 'published' } }) {
  const isAdmin = await authServer.isAdmin()
  if (!isAdmin) redirect('/dashboard')

  const status = (searchParams?.status || 'all') as 'all' | 'draft' | 'published'

  const supabase = await createSupabaseServerClient()
  let query = supabase.from('blogs').select('id,title,slug,status,is_featured,is_popular,updated_at,published_at').order('updated_at', { ascending: false })
  if (status !== 'all') query = query.eq('status', status)
  const { data: blogs } = await query

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Manage Blogs</h1>
        <Link href="/dashboard/blogs/new" className="text-sm text-primary hover:underline">New Post</Link>
      </div>
      <div className="mb-4 flex gap-3 text-sm">
        {(['all', 'draft', 'published'] as const).map((s) => (
          <Link key={s} className={s === status ? 'font-medium underline' : 'hover:underline'} href={`/dashboard/blogs?status=${s}`}>{s}</Link>
        ))}
      </div>
      <table className="w-full text-sm">
        <thead className="text-left text-muted-foreground">
          <tr>
            <th className="py-2">Title</th>
            <th className="py-2">Status</th>
            <th className="py-2">Updated</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(blogs || []).map((b) => (
            <tr key={b.id} className="border-t">
              <td className="py-2 pr-4">
                <div className="font-medium">{b.title}</div>
                <div className="text-xs text-muted-foreground">/{b.slug}</div>
              </td>
              <td className="py-2 pr-4">{b.status}</td>
              <td className="py-2 pr-4">{new Date(b.updated_at).toLocaleString()}</td>
              <td className="py-2">
                <div className="flex gap-3">
                  <Link className="hover:underline" href={`/dashboard/blogs/${b.id}/edit`}>Edit</Link>
                  {b.status === 'draft' ? (
                    <Link className="text-blue-600 hover:underline" href={`/dashboard/blogs/preview/${b.slug}`}>Preview</Link>
                  ) : (
                    <a className="text-muted-foreground hover:underline" href={`/blog/${b.slug}`} target="_blank">View</a>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

