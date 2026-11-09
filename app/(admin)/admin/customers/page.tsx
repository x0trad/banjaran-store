'use client'
import AdminLayout from '@/components/admin/AdminLayout'
import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'
import { Search, Mail, Phone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    fetch(`/api/customers?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setCustomers(data.customers || [])
        setTotal(data.total || 0)
        setLoading(false)
      })
  }, [search])

  return (
    <AdminLayout>
      <div className="mb-4">
        <h1 className="text-xl font-bold">Customers</h1>
        <p className="text-stone-500 text-xs mt-0.5">{total} total customers</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." className="pl-9" />
      </div>

      <div className="space-y-2">
        {loading ? (
          [...Array(5)].map((_, i) => <div key={i} className="h-20 bg-stone-100 animate-pulse rounded-lg" />)
        ) : customers.length === 0 ? (
          <p className="text-center text-stone-400 text-sm py-12">No customers found</p>
        ) : (
          customers.map((customer) => {
            const totalSpent = customer.orders
              ?.filter((o: any) => o.status !== 'CANCELLED')
              .reduce((s: number, o: any) => s + o.total, 0) || 0
            return (
              <Card key={customer.id} className="p-3">
                <div className="flex items-start justify-between mb-1.5">
                  <p className="text-sm font-semibold">{customer.name}</p>
                  <span className="text-sm font-semibold text-banjaran-700">{formatPrice(totalSpent)}</span>
                </div>
                <div className="space-y-1 mb-2">
                  <p className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Mail className="w-3 h-3 flex-shrink-0" /> {customer.email}
                  </p>
                  {customer.phone && (
                    <p className="flex items-center gap-1.5 text-xs text-stone-500">
                      <Phone className="w-3 h-3 flex-shrink-0" /> {customer.phone}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-stone-50">
                  <span className="text-xs text-stone-400">{customer.orders?.length || 0} orders</span>
                  <span className="text-xs text-stone-400">Since {new Date(customer.createdAt).toLocaleDateString('en-MY')}</span>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </AdminLayout>
  )
}
