'use client'
import AdminLayout from '@/components/admin/AdminLayout'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ImageUpload from '@/components/admin/ImageUpload'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const COLORS = ['White', 'Black', 'Navy', 'Forest', 'Stone', 'Cream']
const emptyVariant = { color: 'White', size: 'M', stock: 0, sku: '' }
const selectClass = 'flex h-11 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-banjaran-700 touch-manipulation'

export default function ProductFormPage() {
  const { id } = useParams()
  const router = useRouter()
  const isNew = id === 'new'

  const [form, setForm] = useState({
    name: '', description: '', price: '', comparePrice: '',
    category: 'tee', images: [] as string[], tags: '', featured: false, published: true,
  })
  const [variants, setVariants] = useState([{ ...emptyVariant }])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/products/${id}`)
        .then((r) => r.json())
        .then((data) => {
          if (!data.error) {
            setForm({
              name: data.name,
              description: data.description,
              price: data.price.toString(),
              comparePrice: data.comparePrice?.toString() || '',
              category: data.category,
              images: data.images.length ? data.images : [],
              tags: data.tags?.join(', ') || '',
              featured: data.featured,
              published: data.published,
            })
            setVariants(data.variants.length ? data.variants : [{ ...emptyVariant }])
          }
          setLoading(false)
        })
    }
  }, [id, isNew])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return toast.error('Product name is required')
    if (!form.price) return toast.error('Price is required')
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        images: form.images.filter(Boolean),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        variants,
      }
      const res = await fetch(isNew ? '/api/products' : `/api/products/${id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(isNew ? 'Product created!' : 'Product updated!')
        router.push('/admin/products')
      } else {
        toast.error(data.error || 'Failed to save')
      }
    } catch {
      toast.error('Error saving product')
    } finally {
      setSaving(false)
    }
  }

  const addImage = () => setForm({ ...form, images: [...form.images, ''] })
  const removeImage = (i: number) => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })
  const setImage = (i: number, url: string) => {
    const images = [...form.images]
    images[i] = url
    setForm({ ...form, images })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-stone-100 rounded w-1/3" />
          <div className="h-48 bg-stone-100 rounded" />
          <div className="h-48 bg-stone-100 rounded" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/admin/products" className="p-2 -ml-2 text-stone-400 active:text-stone-900 touch-manipulation">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">{isNew ? 'New Product' : 'Edit Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Product Details */}
        <Card>
          <CardHeader className="px-4 py-3 border-b border-stone-100">
            <CardTitle className="text-sm font-semibold">Details</CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Product Name *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Crocker Tee" />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="flex w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-banjaran-700 touch-manipulation"
                required
                placeholder="Describe the product..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Price (MYR) *</label>
                <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="99.00" inputMode="decimal" />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Compare Price</label>
                <Input type="number" step="0.01" min="0" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} placeholder="Optional" inputMode="decimal" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Tags</label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="hiking, mountain, cotton" />
            </div>
          </CardContent>
        </Card>

        {/* Publish + Category row */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-stone-600 mb-2">Visibility</p>
              <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 accent-banjaran-700" />
                <span className="text-sm">Published</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-banjaran-700" />
                <span className="text-sm">Featured</span>
              </label>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-4 py-3">
              <p className="text-xs font-semibold text-stone-600 mb-2">Category</p>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={selectClass}>
                <option value="tee">Tee</option>
                <option value="hoodie">Hoodie</option>
                <option value="cap">Cap</option>
                <option value="accessory">Accessory</option>
              </select>
            </CardContent>
          </Card>
        </div>

        {/* Images */}
        <Card>
          <CardHeader className="px-4 py-3 border-b border-stone-100 flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Images</CardTitle>
              <p className="text-xs text-stone-400 mt-0.5">First = main image</p>
            </div>
          </CardHeader>
          <CardContent className="px-4 py-4">
            {form.images.length === 0 ? (
              <ImageUpload
                value=""
                onChange={(url) => setForm({ ...form, images: [url] })}
                placeholder="Tap to upload first image"
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {form.images.map((img, i) => (
                  <div key={i} className="space-y-1">
                    <ImageUpload
                      value={img}
                      onChange={(url) => setImage(i, url)}
                      onRemove={() => removeImage(i)}
                      placeholder={i === 0 ? 'Main image' : `Image ${i + 1}`}
                    />
                    {i === 0 && <p className="text-[10px] text-center text-banjaran-700 font-medium">Main</p>}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImage}
                  className="aspect-square border-2 border-dashed border-stone-200 rounded-lg flex flex-col items-center justify-center gap-1 text-stone-400 active:bg-stone-50 touch-manipulation"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-[10px]">Add</span>
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Variants */}
        <Card>
          <CardHeader className="px-4 py-3 border-b border-stone-100 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Variants & Stock</CardTitle>
            <button type="button" onClick={() => setVariants([...variants, { ...emptyVariant }])} className="flex items-center gap-1 text-xs text-banjaran-700 touch-manipulation">
              <Plus className="w-3 h-3" /> Add
            </button>
          </CardHeader>
          <CardContent className="px-4 py-4">
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-end">
                  <div>
                    <label className="text-[10px] font-medium text-stone-500 mb-1 block">Colour</label>
                    <select value={v.color} onChange={(e) => { const u = [...variants]; u[i] = { ...u[i], color: e.target.value }; setVariants(u) }} className={selectClass}>
                      {COLORS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-stone-500 mb-1 block">Size</label>
                    <select value={v.size} onChange={(e) => { const u = [...variants]; u[i] = { ...u[i], size: e.target.value }; setVariants(u) }} className={selectClass}>
                      {SIZES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-stone-500 mb-1 block">Stock</label>
                    <Input type="number" min="0" value={v.stock} onChange={(e) => { const u = [...variants]; u[i] = { ...u[i], stock: parseInt(e.target.value) || 0 }; setVariants(u) }} inputMode="numeric" />
                  </div>
                  <button type="button" onClick={() => setVariants(variants.filter((_, j) => j !== i))} disabled={variants.length === 1} className="h-11 flex items-center justify-center text-stone-300 active:text-red-500 disabled:opacity-30 touch-manipulation">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button type="submit" disabled={saving} className="w-full h-12 text-base">
          {saving ? 'Saving...' : isNew ? 'Create Product' : 'Save Changes'}
        </Button>

        {!isNew && (
          <Link href="/admin/products" className="block text-center text-sm text-stone-400 pb-4">Cancel</Link>
        )}

      </form>
    </AdminLayout>
  )
}
