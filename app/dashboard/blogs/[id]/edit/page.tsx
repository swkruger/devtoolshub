'use client'
import { useEffect, useState, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { WysiwygEditor } from '@/components/blog/wysiwyg-editor'
import { createSupabaseClient } from '@/lib/supabase'

export default function EditBlogPage() {
  const params = useParams() as { id: string }
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [isPopular, setIsPopular] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    (async () => {
      const supabase = createSupabaseClient()
      const { data } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', params.id)
        .single()
      if (data) {
        setTitle(data.title)
        setSlug(data.slug)
        setContent(data.content_html)
        setImageUrl(data.image_url || '')
        setStatus(data.status)
        setIsPopular(Boolean(data.is_popular))
        setIsFeatured(Boolean(data.is_featured))
      }
    })()
  }, [params.id])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const supabase = createSupabaseClient()
      const payload: any = {
        title,
        slug,
        content_html: content,
        image_url: imageUrl || null,
        status,
        is_featured: isFeatured,
        is_popular: isPopular,
        published_at: status === 'published' ? new Date().toISOString() : null,
      }
      const { error } = await supabase.from('blogs').update(payload).eq('id', params.id)
      if (!error) router.push('/dashboard/blogs')
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const supabase = createSupabaseClient()
      const { error } = await supabase.from('blogs').delete().eq('id', params.id)
      if (!error) router.push('/dashboard/blogs')
    })
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-3xl">
      <h1 className="mb-4 text-xl font-semibold">Edit Post</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Slug</label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Image URL (optional)</label>
          <Input 
            type="url" 
            value={imageUrl} 
            onChange={(e) => setImageUrl(e.target.value)} 
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select className="w-full rounded border bg-background p-2" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Content</label>
          <WysiwygEditor value={content} onChange={setContent} placeholder="Write your blog post..." />
        </div>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Featured
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} /> Popular
          </label>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>Save</Button>
          <Button type="button" variant="outline" disabled={isPending} onClick={handleDelete}>Delete</Button>
        </div>
      </form>
    </div>
  )
}

