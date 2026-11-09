'use client'
import AdminLayout from '@/components/admin/AdminLayout'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Save, Minus, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function InventoryPage() {
  const [variants, setVariants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [edits, setEdits] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/api/inventory')
      .then((r) => r.json())
      .then((data) => {
        setVariants(data)
        const initial: Record<string, number> = {}
        data.forEach((v: any) => { initial[v.id] = v.stock })
        setEdits(initial)
        setLoading(false)
      })
  }, [])

  const handleSave = async (variantId: string) => {
    setSaving(variantId)
    const res = await fetch('/api/inventory', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId, stock: edits[variantId] }),
    })
    if (res.ok) {
      setVariants((prev) =>
        prev.map((v) => (v.id === variantId ? { ...v, stock: edits[variantId] } : v))
      )
      toast.success('Stock updated')
    } else {
      toast.error('Failed to update stock')
    }
    setSaving(null)
  }

  // Group by product
  const grouped = variants.reduce((acc: Record<string, any>, v) => {
    const name = v.product.name
    if (!acc[name]) acc[name] = { product: v.product, variants: [] }
    acc[name].variants.push(v)
    return acc
  }, {})

  const getStockBadge = (stock: number): 'destructive' | 'warning' | 'success' => {
    if (stock === 0) return 'destructive'
    if (stock <= 5) return 'warning'
    return 'success'
  }

  return (
    <AdminLayout>
      <div className="mb-4">
        <h1 className="text-xl font-bold">Inventory</h1>
        <p className="text-stone-500 text-xs mt-0.5">Manage stock levels</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-stone-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([productName, group]: [string, any]) => (
            <Card key={productName} className="overflow-hidden">
              <CardHeader className="px-4 py-3 border-b border-stone-100 bg-stone-50">
                <CardTitle className="text-sm">{productName}</CardTitle>
                <p className="text-xs text-stone-400 mt-0.5">
                  Total: {group.variants.reduce((s: number, v: any) => s + (edits[v.id] ?? v.stock), 0)} units
                </p>
              </CardHeader>

              <CardContent className="p-0">
                <div className="divide-y divide-stone-50">
                  {group.variants.map((variant: any) => {
                    const currentStock = edits[variant.id] ?? variant.stock
                    const changed = currentStock !== variant.stock
                    return (
                      <div key={variant.id} className="px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-sm font-medium">{variant.color} / {variant.size}</span>
                            <p className="text-[10px] text-stone-400 font-mono">{variant.sku}</p>
                          </div>
                          <Badge variant={getStockBadge(currentStock)} className="text-[10px]">
                            {currentStock === 0 ? 'Out' : currentStock <= 5 ? 'Low' : 'OK'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setEdits((prev) => ({ ...prev, [variant.id]: Math.max(0, (prev[variant.id] ?? variant.stock) - 1) }))}
                              className="w-9 h-9 flex items-center justify-center border border-stone-200 rounded-md active:bg-stone-100 touch-manipulation"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min={0}
                              value={currentStock}
                              onChange={(e) => setEdits((prev) => ({ ...prev, [variant.id]: parseInt(e.target.value) || 0 }))}
                              className="w-16 h-9 border border-stone-200 text-center text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-banjaran-700 touch-manipulation"
                            />
                            <button
                              onClick={() => setEdits((prev) => ({ ...prev, [variant.id]: (prev[variant.id] ?? variant.stock) + 1 }))}
                              className="w-9 h-9 flex items-center justify-center border border-stone-200 rounded-md active:bg-stone-100 touch-manipulation"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {changed && (
                            <Button
                              onClick={() => handleSave(variant.id)}
                              disabled={saving === variant.id}
                              size="sm"
                              className="h-9 text-xs gap-1"
                            >
                              <Save className="w-3 h-3" />
                              {saving === variant.id ? '...' : 'Save'}
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
