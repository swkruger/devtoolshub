'use client'
import { useEffect, useState, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { WysiwygEditor } from '@/components/blog/wysiwyg-editor'

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
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check admin status on component mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/user/admin-status')
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.isAdmin)
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAdminStatus()
  }, [])

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/dashboard')
    }
  }, [isLoading, isAdmin, router])

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/blogs/${params.id}`)
        if (response.ok) {
          const { blog } = await response.json()
          if (blog) {
            setTitle(blog.title)
            setSlug(blog.slug)
            setContent(blog.content_html || '')
            setImageUrl(blog.image_url || '')
            setStatus(blog.status)
            setIsPopular(Boolean(blog.is_popular))
            setIsFeatured(Boolean(blog.is_featured))
            if (blog.content_markdown) {
              setUseMarkdown(true)
              setContentMarkdown(blog.content_markdown)
            }
            // SEO
            setMetaDescription(blog.meta_description || '')
            setMetaKeywords(blog.meta_keywords || '')
            setOgTitle(blog.og_title || '')
            setOgDescription(blog.og_description || '')
            setOgImage(blog.og_image || '')
            setTwitterTitle(blog.twitter_title || '')
            setTwitterDescription(blog.twitter_description || '')
            setTwitterImage(blog.twitter_image || '')
          }
        } else {
          console.error('Failed to fetch blog:', response.status)
        }
      } catch (error) {
        console.error('Error fetching blog:', error)
      }
    })()
  }, [params.id])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
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
      
      try {
        const response = await fetch(`/api/blogs/${params.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        
        if (response.ok) {
          router.push('/dashboard/blogs')
        } else {
          console.error('Failed to update blog:', response.status)
        }
      } catch (error) {
        console.error('Error updating blog:', error)
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/blogs/${params.id}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          router.push('/dashboard/blogs')
        } else {
          console.error('Failed to delete blog:', response.status)
        }
      } catch (error) {
        console.error('Error deleting blog:', error)
      }
    })
  }

  // Show loading or redirect if not admin
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-4 max-w-3xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Checking permissions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect via useEffect
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
          <Button 
            type="button" 
            variant="outline" 
            disabled={isPending}
            onClick={() => router.push(`/dashboard/blogs/preview/${slug}`)}
          >
            Preview
          </Button>
          <Button type="button" variant="outline" disabled={isPending} onClick={handleDelete}>Delete</Button>
        </div>
      </form>
    </div>
  )
}

