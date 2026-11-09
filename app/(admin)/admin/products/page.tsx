'use client'
import AdminLayout from '@/components/admin/AdminLayout'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    const res = await fetch('/api/products?published=all')
    const data = await res.json()
    setProducts(data)
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  const togglePublish = async (id: string, current: boolean) => {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !current }),
    })
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, published: !current } : p))
    toast.success(current ? 'Product unpublished' : 'Product published')
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    setProducts((prev) => prev.filter((p) => p.id !== id))
    toast.success('Product deleted')
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">Products</h1>
          <p className="text-stone-500 text-xs mt-0.5">{products.length} products</p>
        </div>
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4" /> Add
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-stone-100 animate-pulse rounded-lg" />)
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <p className="mb-3 text-sm">No products yet</p>
            <Link href="/admin/products/new" className="text-banjaran-700 text-sm font-medium">
              + Add your first product
            </Link>
          </div>
        ) : (
          products.map((product) => {
            const totalStock = product.variants?.reduce((s: number, v: any) => s + v.stock, 0) ?? 0
            return (
              <Card key={product.id} className="p-3">
                <div className="flex gap-3">
                  <div className="relative w-14 h-14 bg-stone-100 flex-shrink-0 rounded-md overflow-hidden">
                    {product.images?.[0] && (
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{product.name}</p>
                        <p className="text-xs text-stone-400">/{product.slug}</p>
                      </div>
                      <Badge variant={product.published ? 'success' : 'secondary'} className="text-xs flex-shrink-0">
                        {product.published ? 'Live' : 'Draft'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <span className="font-semibold text-stone-900">{formatPrice(product.price)}</span>
                        <span>{product.variants?.length ?? 0} variants</span>
                        <span className={totalStock === 0 ? 'text-red-600 font-medium' : totalStock <= 10 ? 'text-amber-600 font-medium' : ''}>
                          {totalStock} units
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Link href={`/admin/products/${product.id}`} className="p-2 text-stone-400 active:text-banjaran-700 touch-manipulation" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => togglePublish(product.id, product.published)} className="p-2 text-stone-400 active:text-stone-700 touch-manipulation" title={product.published ? 'Unpublish' : 'Publish'}>
                          {product.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button onClick={() => deleteProduct(product.id)} className="p-2 text-stone-400 active:text-red-600 touch-manipulation" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </AdminLayout>
  )
}
