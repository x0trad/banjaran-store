'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/store/cart'
import { formatPrice, calculateShipping } from '@/lib/utils'
import { ChevronLeft, Lock, Truck, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const STATES = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang',
  'Perak', 'Perlis', 'Pulau Pinang', 'Sabah', 'Sarawak', 'Selangor',
  'Terengganu', 'WP Kuala Lumpur', 'WP Labuan', 'WP Putrajaya',
]

export default function CheckoutPage() {
  const { items, total } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', address2: '', city: '', state: '', postcode: '',
  })
  const [showSummary, setShowSummary] = useState(false)

  const shippingCost = calculateShipping(total, form.state)
  const grandTotal = total + shippingCost

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!items.length) return toast.error('Your cart is empty')

    const required = ['name', 'email', 'address', 'city', 'state', 'postcode'] as const
    for (const field of required) {
      if (!form[field]) return toast.error(`Please fill in your ${field}`)
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customerInfo: form }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Checkout failed. Please try again.')
        setLoading(false)
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="px-5 py-20 text-center pb-24 sm:pb-20">
        <p className="text-stone-400 mb-4">Your cart is empty.</p>
        <Button asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="pb-20 sm:pb-0">
      {/* Mobile header */}
      <div className="sm:hidden sticky top-0 z-10 bg-white border-b border-stone-100">
        <div className="flex items-center h-12 px-4">
          <Link href="/shop" className="flex items-center gap-1 text-sm text-stone-500 active:text-stone-900 touch-manipulation">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="flex-1 text-center text-sm font-semibold">Checkout</h1>
          <div className="w-12" />
        </div>
      </div>

      {/* Mobile: collapsible order summary */}
      <div className="sm:hidden border-b border-stone-100">
        <button
          onClick={() => setShowSummary(!showSummary)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm touch-manipulation"
        >
          <span className="text-banjaran-700 font-medium">
            {showSummary ? 'Hide' : 'Show'} order summary ({items.length} {items.length === 1 ? 'item' : 'items'})
          </span>
          <span className="font-semibold">{formatPrice(grandTotal)}</span>
        </button>
        {showSummary && (
          <div className="px-4 pb-4 space-y-3">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-3">
                <div className="relative w-14 h-14 bg-stone-50 flex-shrink-0 rounded-sm overflow-hidden">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-stone-600 text-white text-[10px] flex items-center justify-center rounded-full">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-stone-400">{item.color} / {item.size}</p>
                </div>
                <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
            <div className="pt-2 border-t border-stone-100 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 sm:py-12">
        {/* Desktop heading */}
        <h1 className="hidden sm:block text-3xl font-bold mb-10">Checkout</h1>

        <div className="sm:grid sm:grid-cols-5 sm:gap-12">
          {/* Form */}
          <form onSubmit={handleSubmit} className="sm:col-span-3 px-4 pt-5 sm:px-0 sm:pt-0">
            {/* Contact */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest mb-3">Contact</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Full Name *</label>
                  <Input name="name" value={form.name} onChange={handleChange} required autoComplete="name" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-stone-500 mb-1 block">Email *</label>
                    <Input name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="email" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-500 mb-1 block">Phone</label>
                    <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+60 12-xxx xxxx" autoComplete="tel" />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest mb-3">Shipping Address</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Address Line 1 *</label>
                  <Input name="address" value={form.address} onChange={handleChange} required autoComplete="address-line1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Address Line 2</label>
                  <Input name="address2" value={form.address2} onChange={handleChange} autoComplete="address-line2" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-stone-500 mb-1 block">City *</label>
                    <Input name="city" value={form.city} onChange={handleChange} required autoComplete="address-level2" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-500 mb-1 block">State *</label>
                    <select
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      required
                      className="flex h-11 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-banjaran-700 focus:ring-offset-1 touch-manipulation"
                    >
                      <option value="">Select</option>
                      {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-500 mb-1 block">Postcode *</label>
                    <Input name="postcode" value={form.postcode} onChange={handleChange} required maxLength={5} inputMode="numeric" autoComplete="postal-code" />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping info */}
            <div className="bg-stone-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-banjaran-700 flex-shrink-0" />
                <span className="text-stone-600">
                  {shippingCost === 0
                    ? 'Free shipping on your order!'
                    : `Shipping: ${formatPrice(shippingCost)} (${['Sabah', 'Sarawak', 'WP Labuan'].includes(form.state) ? 'East Malaysia' : 'West Malaysia'})`}
                </span>
              </div>
              {shippingCost > 0 && total < 150 && (
                <p className="text-xs text-stone-400 ml-6">
                  Add {formatPrice(150 - total)} more for free shipping
                </p>
              )}
            </div>

            {/* Desktop submit */}
            <div className="hidden sm:block">
              <Button type="submit" disabled={loading} className="w-full h-13 text-sm gap-2" size="lg">
                <Lock className="w-4 h-4" />
                {loading ? 'Redirecting to payment...' : `Pay ${formatPrice(grandTotal)} via Stripe`}
              </Button>
              <div className="flex items-center justify-center gap-4 mt-4">
                <span className="flex items-center gap-1.5 text-xs text-stone-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Secured by Stripe
                </span>
              </div>
            </div>
          </form>

          {/* Desktop order summary */}
          <div className="hidden sm:block sm:col-span-2">
            <div className="bg-stone-50 p-6 sticky top-24 rounded-lg">
              <h2 className="text-sm font-semibold uppercase tracking-widest mb-5">Order Summary</h2>
              <div className="space-y-4 mb-5">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-4">
                    <div className="relative w-16 h-16 bg-stone-100 flex-shrink-0 rounded-sm overflow-hidden">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-stone-600 text-white text-[10px] flex items-center justify-center rounded-full">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-stone-400">{item.color} / {item.size}</p>
                      <p className="text-sm font-medium mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
                </div>
                {shippingCost === 0 && (
                  <p className="text-xs text-banjaran-700">Free shipping on orders above RM150</p>
                )}
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-stone-200">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky pay bar */}
      <div className="sm:hidden fixed bottom-14 left-0 right-0 z-20 bg-white border-t border-stone-100 px-4 py-3 safe-bottom">
        <Button
          onClick={handleSubmit as any}
          disabled={loading}
          className="w-full h-12 text-sm gap-2"
        >
          <Lock className="w-4 h-4" />
          {loading ? 'Redirecting...' : `Pay ${formatPrice(grandTotal)}`}
        </Button>
      </div>
    </div>
  )
}
