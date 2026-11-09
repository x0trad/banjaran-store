import AdminLayout from '@/components/admin/AdminLayout'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, Users, Package, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function getDashboardData() {
  const [
    totalOrders, pendingOrders, totalRevenue, totalCustomers,
    totalProducts, recentOrders, lowStock,
  ] = await Promise.all([
    prisma.order.count({ where: { paymentStatus: 'PAID' } }),
    prisma.order.count({ where: { status: 'PROCESSING' } }),
    prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { total: true } }),
    prisma.customer.count(),
    prisma.product.count({ where: { published: true } }),
    prisma.order.findMany({
      where: { paymentStatus: 'PAID' },
      include: { items: { include: { product: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 5 } },
      include: { product: { select: { name: true } } },
      orderBy: { stock: 'asc' },
      take: 8,
    }),
  ])

  return {
    totalOrders, pendingOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    totalCustomers, totalProducts, recentOrders, lowStock,
  }
}

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  PROCESSING: 'default',
  SHIPPED: 'warning',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  PENDING: 'secondary',
  REFUNDED: 'secondary',
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  const stats = [
    { label: 'Revenue', value: formatPrice(data.totalRevenue), icon: TrendingUp, color: 'text-banjaran-700' },
    { label: 'Orders', value: data.totalOrders, icon: ShoppingCart, color: 'text-blue-600' },
    { label: 'Customers', value: data.totalCustomers, icon: Users, color: 'text-purple-600' },
    { label: 'Products', value: data.totalProducts, icon: Package, color: 'text-amber-600' },
  ]

  return (
    <AdminLayout>
      <div className="mb-5 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
        <p className="text-stone-500 text-xs sm:text-sm mt-0.5">Welcome back to Banjaran.</p>
      </div>

      {/* Pending alert */}
      {data.pendingOrders > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 flex items-center justify-between">
          <p className="text-sm text-amber-800 font-medium">
            {data.pendingOrders} order{data.pendingOrders > 1 ? 's' : ''} to process
          </p>
          <Link href="/admin/orders?status=PROCESSING" className="text-xs text-amber-700 font-medium active:underline touch-manipulation">
            View
          </Link>
        </div>
      )}

      {/* Stats — 2×2 grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-5 sm:mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-3 sm:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-stone-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100">
            <CardTitle className="text-sm font-semibold">Recent Orders</CardTitle>
            <Link href="/admin/orders" className="text-xs text-banjaran-700 active:underline touch-manipulation">View all</Link>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentOrders.length === 0 ? (
              <p className="text-center text-stone-400 text-sm py-10">No orders yet</p>
            ) : (
              <div className="divide-y divide-stone-50">
                {data.recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between px-4 sm:px-6 py-3 active:bg-stone-50 transition-colors touch-manipulation"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-stone-400 truncate">{order.name} · {new Date(order.createdAt).toLocaleDateString('en-MY')}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-3">
                      <Badge variant={STATUS_BADGE[order.status] || 'secondary'} className="text-[10px] sm:text-xs">{order.status}</Badge>
                      <span className="text-sm font-medium hidden sm:inline">{formatPrice(order.total)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100">
            <CardTitle className="text-sm font-semibold">Low Stock</CardTitle>
            <Link href="/admin/inventory" className="text-xs text-banjaran-700 active:underline touch-manipulation">Manage</Link>
          </CardHeader>
          <CardContent className="p-0">
            {data.lowStock.length === 0 ? (
              <p className="text-center text-stone-400 text-sm py-10">All stock healthy</p>
            ) : (
              <div className="divide-y divide-stone-50">
                {data.lowStock.map((variant) => (
                  <div key={variant.id} className="px-4 sm:px-6 py-3">
                    <p className="text-sm font-medium">{variant.product.name}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-stone-400">{variant.color} / {variant.size}</p>
                      <span className={`text-xs font-semibold ${variant.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                        {variant.stock === 0 ? 'Out of Stock' : `${variant.stock} left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
