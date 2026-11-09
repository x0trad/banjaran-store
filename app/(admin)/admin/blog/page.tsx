'use client'
import AdminLayout from '@/components/admin/AdminLayout'
import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import ImageUpload from '@/components/admin/ImageUpload'

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', image: '', published: false })
  const [saving, setSaving] = useState(false)

  const fetchPosts = async () => {
    const res = await fetch('/api/blog?published=all')
    const data = await res.json()
    setPosts(data)
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  const openNew = () => {
    setEditing(null)
    setForm({ title: '', excerpt: '', content: '', image: '', published: false })
    setShowForm(true)
  }

  const openEdit = (post: any) => {
    setEditing(post)
    setForm({ title: post.title, excerpt: post.excerpt, content: post.content, image: post.image || '', published: post.published })
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(editing ? `/api/blog/${editing.id}` : '/api/blog', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success(editing ? 'Post updated!' : 'Post created!')
        setShowForm(false)
        fetchPosts()
      }
    } finally {
      setSaving(false)
    }
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/blog/${id}`, { method: 'DELETE' })
    setPosts((prev) => prev.filter((p) => p.id !== id))
    toast.success('Post deleted')
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Blog / Journal</h1>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> New
        </Button>
      </div>

      {/* Post Form — Sheet on mobile, modal on desktop */}
      <Sheet open={showForm} onOpenChange={() => setShowForm(false)}>
        <SheetContent side="bottom" onClose={() => setShowForm(false)} className="h-[90vh] sm:h-auto sm:max-h-[85vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>{editing ? 'Edit Post' : 'New Post'}</SheetTitle>
            <SheetClose onClose={() => setShowForm(false)} />
          </SheetHeader>
          <form onSubmit={handleSave} className="space-y-4 px-1">
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Title *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Excerpt *</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="flex w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-banjaran-700 focus:ring-offset-1 touch-manipulation"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Content *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="flex w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm min-h-[160px] sm:min-h-[200px] focus:outline-none focus:ring-2 focus:ring-banjaran-700 focus:ring-offset-1 touch-manipulation"
                required
                placeholder="Supports markdown..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Cover Image</label>
              <ImageUpload
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                onRemove={() => setForm({ ...form, image: '' })}
                placeholder="Upload cover image"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer touch-manipulation py-1">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-5 h-5 accent-banjaran-700" />
              <span className="text-sm">Published</span>
            </label>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1 sm:flex-none">
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Publish Post'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 sm:flex-none">
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <div className="space-y-2">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-stone-100 animate-pulse rounded-lg" />
          ))
        ) : posts.length === 0 ? (
          <p className="text-center text-stone-400 text-sm py-12">No posts yet</p>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="p-3">
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-semibold flex-1 mr-2">{post.title}</p>
                <Badge variant={post.published ? 'success' : 'secondary'} className="text-[10px] flex-shrink-0">
                  {post.published ? 'Live' : 'Draft'}
                </Badge>
              </div>
              <p className="text-xs text-stone-400 line-clamp-1 mb-2">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400">{new Date(post.createdAt).toLocaleDateString('en-MY')}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(post)} className="p-2 text-stone-400 active:text-banjaran-700 touch-manipulation">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => deletePost(post.id)} className="p-2 text-stone-400 active:text-red-600 touch-manipulation">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  )
}
