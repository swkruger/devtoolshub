'use client'
import { useEffect, useState, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { WysiwygEditor } from '@/components/blog/wysiwyg-editor'
import { createSupabaseClient } from '@/lib/supabase'
import { Textarea } from '@/components/ui/textarea'

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
  const [useMarkdown, setUseMarkdown] = useState(false)
  const [contentMarkdown, setContentMarkdown] = useState('')
  // SEO fields
  const [metaDescription, setMetaDescription] = useState('')
  const [metaKeywords, setMetaKeywords] = useState('')
  const [ogTitle, setOgTitle] = useState('')
  const [ogDescription, setOgDescription] = useState('')
  const [ogImage, setOgImage] = useState('')
  const [twitterTitle, setTwitterTitle] = useState('')
  const [twitterDescription, setTwitterDescription] = useState('')
  const [twitterImage, setTwitterImage] = useState('')
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
        setContent(data.content_html || '')
        setImageUrl(data.image_url || '')
        setStatus(data.status)
        setIsPopular(Boolean(data.is_popular))
        setIsFeatured(Boolean(data.is_featured))
        if (data.content_markdown) {
          setUseMarkdown(true)
          setContentMarkdown(data.content_markdown)
        }
        // SEO
        setMetaDescription(data.meta_description || '')
        setMetaKeywords(data.meta_keywords || '')
        setOgTitle(data.og_title || '')
        setOgDescription(data.og_description || '')
        setOgImage(data.og_image || '')
        setTwitterTitle(data.twitter_title || '')
        setTwitterDescription(data.twitter_description || '')
        setTwitterImage(data.twitter_image || '')
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
        // content_html column is NOT NULL, ensure it is always populated
        content_html: useMarkdown ? contentMarkdown : content,
        content_markdown: useMarkdown ? contentMarkdown : null,
        image_url: imageUrl || null,
        status,
        is_featured: isFeatured,
        is_popular: isPopular,
        published_at: status === 'published' ? new Date().toISOString() : null,
        // SEO
        meta_description: metaDescription || null,
        meta_keywords: metaKeywords || null,
        og_title: ogTitle || null,
        og_description: ogDescription || null,
        og_image: ogImage || null,
        twitter_title: twitterTitle || null,
        twitter_description: twitterDescription || null,
        twitter_image: twitterImage || null,
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
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={useMarkdown} onChange={(e) => setUseMarkdown(e.target.checked)} />
              Edit as Markdown
            </label>
          </div>
          {useMarkdown ? (
            <div>
              <label className="mb-1 block text-sm font-medium">Content (Markdown)</label>
              <Textarea
                value={contentMarkdown}
                onChange={(e) => setContentMarkdown(e.target.value)}
                placeholder="# My Post\n\nWrite your content in Markdown..."
                rows={16}
              />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium">Content (HTML)</label>
              <WysiwygEditor value={content} onChange={setContent} placeholder="Write your blog post..." />
            </div>
          )}
        </div>
        {/* SEO Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">SEO Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Meta Description</label>
              <Input 
                value={metaDescription} 
                onChange={(e) => setMetaDescription(e.target.value)} 
                placeholder="Brief description for search engines (max 160 characters)"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">{metaDescription.length}/160 characters</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Meta Keywords</label>
              <Input 
                value={metaKeywords} 
                onChange={(e) => setMetaKeywords(e.target.value)} 
                placeholder="Keywords separated by commas"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Open Graph Title</label>
              <Input 
                value={ogTitle} 
                onChange={(e) => setOgTitle(e.target.value)} 
                placeholder="Title for social media sharing"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Open Graph Description</label>
              <Input 
                value={ogDescription} 
                onChange={(e) => setOgDescription(e.target.value)} 
                placeholder="Description for social media sharing"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Open Graph Image URL</label>
              <Input 
                type="url"
                value={ogImage} 
                onChange={(e) => setOgImage(e.target.value)} 
                placeholder="https://example.com/og-image.jpg"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Twitter Title</label>
              <Input 
                value={twitterTitle} 
                onChange={(e) => setTwitterTitle(e.target.value)} 
                placeholder="Title for Twitter sharing"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Twitter Description</label>
              <Input 
                value={twitterDescription} 
                onChange={(e) => setTwitterDescription(e.target.value)} 
                placeholder="Description for Twitter sharing"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Twitter Image URL</label>
              <Input 
                type="url"
                value={twitterImage} 
                onChange={(e) => setTwitterImage(e.target.value)} 
                placeholder="https://example.com/twitter-image.jpg"
              />
            </div>
          </div>
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

