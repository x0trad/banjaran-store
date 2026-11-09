'use client'
import AdminLayout from '@/components/admin/AdminLayout'
import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Search, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  PROCESSING: 'default',
  SHIPPED: 'warning',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  PENDING: 'secondary',
  REFUNDED: 'secondary',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [total, setTotal] = useState(0)

  const fetchOrders = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    const res = await fetch(`/api/orders?${params}`)
    const data = await res.json()
    setOrders(data.orders || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [search, status])

  return (
    <AdminLayout>
      <div className="mb-4">
        <h1 className="text-xl font-bold">Orders</h1>
        <p className="text-stone-500 text-xs mt-0.5">{total} total orders</p>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." className="pl-9" />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-11 border border-stone-200 bg-white px-3 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-banjaran-700 touch-manipulation"
        >
          <option value="">All</option>
          {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {loading ? (
          [...Array(5)].map((_, i) => <div key={i} className="h-20 bg-stone-100 animate-pulse rounded-lg" />)
        ) : orders.length === 0 ? (
          <p className="text-center text-stone-400 text-sm py-12">No orders found</p>
        ) : (
          orders.map((order) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`}>
              <Card className="p-3 active:bg-stone-50 transition-colors touch-manipulation">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-banjaran-700">{order.orderNumber}</span>
                  <Badge variant={STATUS_BADGE[order.status] || 'secondary'} className="text-xs">{order.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm truncate">{order.name}</p>
                    <p className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleDateString('en-MY')}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <span className="text-sm font-semibold">{formatPrice(order.total)}</span>
                    <ChevronRight className="w-4 h-4 text-stone-300" />
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </AdminLayout>
  )
}
