'use client'
import { Suspense, useEffect } from 'react'
import { CheckCircle, ShoppingBag, Home, Mail } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/store/cart'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

function OrderSuccessContent() {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="px-5 pb-24 sm:pb-12 pt-12 sm:pt-20 text-center max-w-md mx-auto">
      {/* Success icon */}
      <div className="flex justify-center mb-5">
        <div className="w-16 h-16 rounded-full bg-banjaran-50 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-banjaran-700" />
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Order Confirmed!</h1>

      {orderNumber && (
        <p className="text-stone-500 mb-1 text-sm">
          Order <span className="font-medium text-stone-900">#{orderNumber}</span>
        </p>
      )}

      <p className="text-stone-500 text-sm leading-relaxed mb-8">
        Thank you for supporting a Malaysian outdoor brand. We&apos;re preparing your order and you&apos;ll receive an email confirmation shortly.
      </p>

      {/* Action buttons — stacked on mobile */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
        <Button asChild className="h-12 text-sm gap-2">
          <Link href="/shop">
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12 text-sm gap-2">
          <Link href="/">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Contact info */}
      <div className="mt-10 pt-6 border-t border-stone-100">
        <p className="flex items-center justify-center gap-2 text-xs text-stone-400">
          <Mail className="w-3.5 h-3.5" />
          Questions? Email us at{' '}
          <a href="mailto:hello@banjaran.my" className="text-banjaran-700 active:underline">
            hello@banjaran.my
          </a>
        </p>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="px-5 pb-24 pt-12 text-center max-w-md mx-auto">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-stone-100 animate-pulse" />
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}
