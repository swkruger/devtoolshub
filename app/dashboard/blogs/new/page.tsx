'use client'
import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TipTapEditor } from '@/components/blog/tiptap-editor'
import { createSupabaseClient } from '@/lib/supabase'
import { Textarea } from '@/components/ui/textarea'

export default function NewBlogPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [useMarkdown, setUseMarkdown] = useState(false)
  const [contentMarkdown, setContentMarkdown] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isPopular, setIsPopular] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { error } = await supabase
        .from('blogs')
        .insert({
          title,
          slug,
          // content_html is NOT NULL in DB, so always send content (markdown when enabled)
          content_html: useMarkdown ? contentMarkdown : content,
          content_markdown: useMarkdown ? contentMarkdown : null,
          image_url: imageUrl || null,
          status: 'draft',
          is_featured: isFeatured,
          is_popular: isPopular,
          author_id: user.id,
          published_at: null,
          // SEO fields
          meta_description: metaDescription || null,
          meta_keywords: metaKeywords || null,
          og_title: ogTitle || null,
          og_description: ogDescription || null,
          og_image: ogImage || null,
          twitter_title: twitterTitle || null,
          twitter_description: twitterDescription || null,
          twitter_image: twitterImage || null,
        })
      if (!error) router.push('/dashboard/blogs')
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
      <h1 className="mb-4 text-xl font-semibold">New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={useMarkdown} onChange={(e) => setUseMarkdown(e.target.checked)} />
              Write in Markdown
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
              <TipTapEditor value={content} onChange={setContent} placeholder="Write your blog post..." />
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
          <Button type="submit" disabled={isPending}>Save Draft</Button>
          {slug && (
            <Button 
              type="button" 
              variant="outline" 
              disabled={isPending}
              onClick={() => router.push(`/dashboard/blogs/preview/${slug}`)}
            >
              Preview
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

