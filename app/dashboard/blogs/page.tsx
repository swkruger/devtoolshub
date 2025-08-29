'use client'

import Link from 'next/link'
import { redirect, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { authServer } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { Button } from '@/components/ui/button'
import { Trash2, ChevronUp, ChevronDown, Search } from 'lucide-react'
import { toast } from 'sonner'
import { BlogStatusBadge } from '@/components/blog/blog-status-badge'

interface Blog {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'editing' | 'rejected' | 'ready to publish'
  is_featured: boolean
  is_popular: boolean
  created_at: string
  updated_at: string
  published_at: string | null
}

export default function AdminBlogsListPage({ searchParams }: { searchParams?: { status?: 'all' | 'draft' | 'published' | 'editing' | 'rejected' | 'ready to publish' } }) {
  const router = useRouter()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; blog: Blog | null }>({ isOpen: false, blog: null })
  const [isDeleting, setIsDeleting] = useState(false)
  const [sortField, setSortField] = useState<'title' | 'status' | 'created_at' | 'updated_at'>('updated_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')

  const status = (searchParams?.status || 'all') as 'all' | 'draft' | 'published' | 'editing' | 'rejected' | 'ready to publish'

  useEffect(() => {
    const checkAuthAndLoadBlogs = async () => {
      try {
        // Check if user is admin
        const adminCheck = await fetch('/api/user/admin-status')
        const adminData = await adminCheck.json()
        
        if (!adminData.isAdmin) {
          router.push('/dashboard')
          return
        }
        
        setIsAdmin(true)

        // Load blogs
        const searchParams = new URLSearchParams({
          status,
          sortField,
          sortDirection
        })
        if (searchQuery.trim()) {
          searchParams.append('search', searchQuery.trim())
        }
        const response = await fetch(`/api/blogs/list?${searchParams.toString()}`)
        const data = await response.json()
        
        if (response.ok) {
          setBlogs(data.blogs || [])
        } else {
          console.error('Failed to load blogs:', data.error)
          toast.error('Failed to load blogs')
        }
      } catch (error) {
        console.error('Error loading blogs:', error)
        toast.error('Error loading blogs')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndLoadBlogs()
  }, [status, sortField, sortDirection, searchQuery, router])

  const handleDeleteClick = (blog: Blog) => {
    setDeleteModal({ isOpen: true, blog })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.blog) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/blogs/${deleteModal.blog.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove the blog from the list
        setBlogs(prev => prev.filter(blog => blog.id !== deleteModal.blog!.id))
        toast.success(`Blog "${deleteModal.blog.title}" deleted successfully`)
      } else {
        const error = await response.json()
        console.error('Failed to delete blog:', error)
        toast.error(error.error || 'Failed to delete blog')
      }
    } catch (error) {
      console.error('Error deleting blog:', error)
      toast.error('Error deleting blog')
    } finally {
      setIsDeleting(false)
      setDeleteModal({ isOpen: false, blog: null })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, blog: null })
  }

  const handleSort = (field: 'title' | 'status' | 'created_at' | 'updated_at') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: 'title' | 'status' | 'created_at' | 'updated_at') => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 opacity-30" />
    }
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading blogs...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Manage Blogs</h1>
        <Link href="/dashboard/blogs/new" className="text-sm text-primary hover:underline">New Post</Link>
      </div>
             <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
         <div className="flex gap-3 text-sm">
           {(['all', 'draft', 'editing', 'ready to publish', 'rejected', 'published'] as const).map((s) => (
             <Link key={s} className={s === status ? 'font-medium underline' : 'hover:underline'} href={`/dashboard/blogs?status=${s}`}>{s}</Link>
           ))}
         </div>
         <div className="relative max-w-sm">
           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
           <input
             type="text"
             placeholder="Search by title or ID..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full rounded-md border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
           />
         </div>
       </div>
             <table className="w-full text-sm">
         <thead className="text-left text-muted-foreground">
           <tr>
             <th className="py-2">
               <button 
                 onClick={() => handleSort('title')} 
                 className="flex items-center gap-1 hover:text-foreground transition-colors"
               >
                 Title
                 {getSortIcon('title')}
               </button>
             </th>
             <th className="py-2">
               <button 
                 onClick={() => handleSort('status')} 
                 className="flex items-center gap-1 hover:text-foreground transition-colors"
               >
                 Status
                 {getSortIcon('status')}
               </button>
             </th>
             <th className="py-2">
               <button 
                 onClick={() => handleSort('created_at')} 
                 className="flex items-center gap-1 hover:text-foreground transition-colors"
               >
                 Created
                 {getSortIcon('created_at')}
               </button>
             </th>
             <th className="py-2">
               <button 
                 onClick={() => handleSort('updated_at')} 
                 className="flex items-center gap-1 hover:text-foreground transition-colors"
               >
                 Updated
                 {getSortIcon('updated_at')}
               </button>
             </th>
             <th className="py-2">Actions</th>
           </tr>
         </thead>
        <tbody>
          {blogs.map((b) => (
            <tr key={b.id} className="border-t">
              <td className="py-2 pr-4">
                <div className="font-medium">{b.title}</div>
                <div className="text-xs text-muted-foreground">/{b.slug}</div>
              </td>
              <td className="py-2 pr-4">
                <BlogStatusBadge status={b.status} size="sm" />
              </td>
                             <td className="py-2 pr-4">
                 {b.created_at ? `${new Date(b.created_at).toLocaleDateString()} ${new Date(b.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}` : 'N/A'}
               </td>
               <td className="py-2 pr-4">
                 {b.updated_at ? `${new Date(b.updated_at).toLocaleDateString()} ${new Date(b.updated_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}` : 'N/A'}
               </td>
              <td className="py-2">
                <div className="flex gap-3">
                  <Link className="hover:underline" href={`/dashboard/blogs/${b.id}/edit`}>Edit</Link>
                  {b.status === 'draft' || b.status === 'editing' || b.status === 'ready to publish' || b.status === 'rejected' ? (
                    <Link className="text-blue-600 hover:underline" href={`/dashboard/blogs/preview/${b.slug}`}>Preview</Link>
                  ) : (
                    <a className="text-muted-foreground hover:underline" href={`/blog/${b.slug}`} target="_blank">View</a>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(b)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Blog"
        message={`Are you sure you want to delete "${deleteModal.blog?.title}"? This action cannot be undone and will permanently remove the blog post.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        icon={<Trash2 className="h-5 w-5" />}
      />
    </div>
  )
}

