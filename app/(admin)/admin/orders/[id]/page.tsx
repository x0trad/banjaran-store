'use client'
import AdminLayout from '@/components/admin/AdminLayout'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Package, Truck, MapPin, User, Mail, Phone, Hash } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const STATUS_OPTIONS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  PROCESSING: 'default',
  SHIPPED: 'warning',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  PENDING: 'secondary',
  REFUNDED: 'secondary',
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [courier, setCourier] = useState('Poslaju')

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          toast.error('Order not found')
          router.push('/admin/orders')
        } else {
          setOrder(data)
          setNewStatus(data.status)
        }
        setLoading(false)
      })
  }, [id])

  const handleUpdate = async () => {
    setUpdating(true)
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, trackingNumber, courier }),
    })
    if (res.ok) {
      const updated = await res.json()
      setOrder({ ...order, status: updated.status })
      toast.success('Order updated')
      if (newStatus === 'SHIPPED' && trackingNumber) {
        toast.success('Shipping notification sent!')
      }
    } else {
      toast.error('Failed to update order')
    }
    setUpdating(false)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-stone-100 rounded w-48" />
          <div className="h-40 bg-stone-100 rounded" />
          <div className="h-40 bg-stone-100 rounded" />
        </div>
      </AdminLayout>
    )
  }

  if (!order) return null

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <Link href="/admin/orders" className="p-2 -ml-2 text-stone-400 active:text-stone-900 touch-manipulation">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold truncate">{order.orderNumber}</h1>
          <p className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <Badge variant={STATUS_BADGE[order.status] || 'secondary'}>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left: order details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <Card>
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 flex-row items-center gap-2">
              <Package className="w-4 h-4 text-stone-400" />
              <CardTitle className="text-sm">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-stone-50">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-3 px-4 sm:px-6 py-3">
                    <div className="relative w-14 h-14 bg-stone-100 flex-shrink-0 rounded-sm overflow-hidden">
                      {item.product?.images?.[0] && (
                        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product?.name || item.productName}</p>
                      <p className="text-xs text-stone-400">{item.color} / {item.size}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{formatPrice(item.price)} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-100 px-4 sm:px-6 py-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Subtotal</span>
                  <span>{formatPrice(order.subtotal || order.total - order.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Shipping</span>
                  <span>{order.shippingCost === 0 ? 'FREE' : formatPrice(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-1 border-t border-stone-100 mt-1">
                  <span>Total</span>
                  <span className="text-banjaran-700">{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 flex-row items-center gap-2">
              <User className="w-4 h-4 text-stone-400" />
              <CardTitle className="text-sm">Customer</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-3 space-y-2">
              <p className="text-sm font-medium">{order.name}</p>
              <p className="flex items-center gap-2 text-sm text-stone-500">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" /> {order.email}
              </p>
              {order.phone && (
                <p className="flex items-center gap-2 text-sm text-stone-500">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" /> {order.phone}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Shipping address */}
          <Card>
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 flex-row items-center gap-2">
              <MapPin className="w-4 h-4 text-stone-400" />
              <CardTitle className="text-sm">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-3">
              <address className="not-italic text-sm text-stone-600 leading-relaxed">
                {order.address}<br />
                {order.address2 && <>{order.address2}<br /></>}
                {order.postcode} {order.city}<br />
                {order.state}
              </address>
            </CardContent>
          </Card>
        </div>

        {/* Right: update status */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 flex-row items-center gap-2">
              <Truck className="w-4 h-4 text-stone-400" />
              <CardTitle className="text-sm">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-banjaran-700 touch-manipulation"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {newStatus === 'SHIPPED' && (
                <>
                  <div>
                    <label className="text-xs font-medium text-stone-500 mb-1 block">Tracking Number</label>
                    <input
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="EE123456789MY"
                      className="flex h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-banjaran-700 touch-manipulation"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-500 mb-1 block">Courier</label>
                    <select
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      className="flex h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-banjaran-700 touch-manipulation"
                    >
                      {['Poslaju', 'J&T Express', 'GDex', 'DHL', 'Ninja Van', 'ABX Express'].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-stone-400">Shipping notification will be emailed to customer.</p>
                </>
              )}

              <Button
                onClick={handleUpdate}
                disabled={updating || newStatus === order.status}
                className="w-full"
              >
                {updating ? 'Updating...' : 'Update Order'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 flex-row items-center gap-2">
              <Hash className="w-4 h-4 text-stone-400" />
              <CardTitle className="text-sm">Payment</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Status</span>
                <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'secondary'} className="text-xs">
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.stripeSessionId && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Stripe</span>
                  <span className="text-xs font-mono text-stone-400 truncate max-w-[120px]">{order.stripeSessionId.slice(-8)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
