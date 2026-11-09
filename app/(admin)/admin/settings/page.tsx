'use client'
import AdminLayout from '@/components/admin/AdminLayout'
import { useEffect, useState } from 'react'
import { Save, Store, Mail, Megaphone, Truck, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const [store, setStore] = useState({ storeName: '', storeEmail: '' })
  const [announcement, setAnnouncement] = useState('')
  const [shipping, setShipping] = useState({
    westMY: '8',
    eastMY: '15',
    freeAbove: '150',
  })
  const [social, setSocial] = useState({
    instagram: '',
    tiktok: '',
    whatsapp: '',
  })

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        setStore({ storeName: data.storeName || 'Banjaran', storeEmail: data.storeEmail || 'hello@banjaran.my' })
        setAnnouncement(data.announcement || '')
        const rates = data.shippingRates || {}
        setShipping({
          westMY: String(rates.westMY ?? 8),
          eastMY: String(rates.eastMY ?? 15),
          freeAbove: String(rates.freeAbove ?? 150),
        })
        setSocial({
          instagram: rates.instagram || '',
          tiktok: rates.tiktok || '',
          whatsapp: rates.whatsapp || '',
        })
        setLoading(false)
      })
  }, [])

  const save = async (section: string, data: object) => {
    setSaving(section)
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success('Saved!')
    } else {
      toast.error('Failed to save')
    }
    setSaving(null)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-stone-100 rounded-lg" />)}
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-5 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
        <p className="text-stone-500 text-xs sm:text-sm mt-0.5">Manage your store configuration</p>
      </div>

      <div className="space-y-4 sm:space-y-6 max-w-2xl">

        {/* Store Info */}
        <Card>
          <CardHeader className="px-4 sm:px-6 py-4 border-b border-stone-100 flex-row items-center gap-2">
            <Store className="w-4 h-4 text-stone-400" />
            <CardTitle className="text-sm font-semibold">Store Info</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 py-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Store Name</label>
              <Input
                value={store.storeName}
                onChange={(e) => setStore({ ...store, storeName: e.target.value })}
                placeholder="Banjaran"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Store Email</label>
              <Input
                type="email"
                value={store.storeEmail}
                onChange={(e) => setStore({ ...store, storeEmail: e.target.value })}
                placeholder="hello@banjaran.my"
              />
              <p className="text-xs text-stone-400 mt-1">Used as reply-to address for order emails</p>
            </div>
            <Button
              onClick={() => save('store', { storeName: store.storeName, storeEmail: store.storeEmail })}
              disabled={saving === 'store'}
              size="sm"
              className="gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              {saving === 'store' ? 'Saving...' : 'Save'}
            </Button>
          </CardContent>
        </Card>

        {/* Announcement Banner */}
        <Card>
          <CardHeader className="px-4 sm:px-6 py-4 border-b border-stone-100 flex-row items-center gap-2">
            <Megaphone className="w-4 h-4 text-stone-400" />
            <CardTitle className="text-sm font-semibold">Announcement Banner</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 py-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Message</label>
              <Input
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="e.g. Free shipping on orders above RM150 🏔️"
              />
              <p className="text-xs text-stone-400 mt-1">Shows as a top banner on the storefront. Leave empty to hide.</p>
            </div>
            <Button
              onClick={() => save('announcement', { announcement })}
              disabled={saving === 'announcement'}
              size="sm"
              className="gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              {saving === 'announcement' ? 'Saving...' : 'Save'}
            </Button>
          </CardContent>
        </Card>

        {/* Shipping Rates */}
        <Card>
          <CardHeader className="px-4 sm:px-6 py-4 border-b border-stone-100 flex-row items-center gap-2">
            <Truck className="w-4 h-4 text-stone-400" />
            <CardTitle className="text-sm font-semibold">Shipping Rates (MYR)</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 py-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">West MY (RM)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shipping.westMY}
                  onChange={(e) => setShipping({ ...shipping, westMY: e.target.value })}
                  inputMode="decimal"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">East MY (RM)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shipping.eastMY}
                  onChange={(e) => setShipping({ ...shipping, eastMY: e.target.value })}
                  inputMode="decimal"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Free above (RM)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shipping.freeAbove}
                  onChange={(e) => setShipping({ ...shipping, freeAbove: e.target.value })}
                  inputMode="decimal"
                />
              </div>
            </div>
            <p className="text-xs text-stone-400">East MY = Sabah, Sarawak, WP Labuan. Free shipping applies to all zones.</p>
            <Button
              onClick={() => save('shipping', {
                shippingRates: {
                  westMY: parseFloat(shipping.westMY) || 8,
                  eastMY: parseFloat(shipping.eastMY) || 15,
                  freeAbove: parseFloat(shipping.freeAbove) || 150,
                  instagram: social.instagram,
                  tiktok: social.tiktok,
                  whatsapp: social.whatsapp,
                }
              })}
              disabled={saving === 'shipping'}
              size="sm"
              className="gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              {saving === 'shipping' ? 'Saving...' : 'Save'}
            </Button>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader className="px-4 sm:px-6 py-4 border-b border-stone-100 flex-row items-center gap-2">
            <Globe className="w-4 h-4 text-stone-400" />
            <CardTitle className="text-sm font-semibold">Social Links</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 py-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Instagram</label>
              <Input
                value={social.instagram}
                onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
                placeholder="https://instagram.com/banjaranofficial"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">TikTok</label>
              <Input
                value={social.tiktok}
                onChange={(e) => setSocial({ ...social, tiktok: e.target.value })}
                placeholder="https://tiktok.com/@banjaranofficial"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">WhatsApp Number</label>
              <Input
                value={social.whatsapp}
                onChange={(e) => setSocial({ ...social, whatsapp: e.target.value })}
                placeholder="60123456789"
                inputMode="tel"
              />
              <p className="text-xs text-stone-400 mt-1">Include country code without +, e.g. 60123456789</p>
            </div>
            <Button
              onClick={() => save('social', {
                shippingRates: {
                  westMY: parseFloat(shipping.westMY) || 8,
                  eastMY: parseFloat(shipping.eastMY) || 15,
                  freeAbove: parseFloat(shipping.freeAbove) || 150,
                  instagram: social.instagram,
                  tiktok: social.tiktok,
                  whatsapp: social.whatsapp,
                }
              })}
              disabled={saving === 'social'}
              size="sm"
              className="gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              {saving === 'social' ? 'Saving...' : 'Save'}
            </Button>
          </CardContent>
        </Card>

        {/* Admin Account */}
        <Card>
          <CardHeader className="px-4 sm:px-6 py-4 border-b border-stone-100 flex-row items-center gap-2">
            <Mail className="w-4 h-4 text-stone-400" />
            <CardTitle className="text-sm font-semibold">Admin Account</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 py-4">
            <div className="bg-stone-50 rounded-lg p-4 text-sm text-stone-500 space-y-1">
              <p>Login: <span className="font-medium text-stone-900">admin@banjaran.my</span></p>
              <p className="text-xs">To change your password, update the hash directly in the database via Neon SQL Editor.</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  )
}
