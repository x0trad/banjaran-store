'use client'
import { Minus, Plus, X, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCart()

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent side="right" onClose={closeCart} className="flex flex-col bg-surface">
        <SheetHeader className="border-outline/10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" aria-hidden="true" />
            <SheetTitle className="font-headline font-bold tracking-tight text-on-surface">
              Cart{' '}
              <span aria-live="polite" aria-atomic="true" className="text-on-surface-variant font-normal">
                ({items.length})
              </span>
            </SheetTitle>
          </div>
          <SheetClose onClose={closeCart} className="text-on-surface-variant/50 hover:text-on-surface active:bg-surface-container" />
        </SheetHeader>

        {/* ── Items ── */}
        <div className="flex-1 overflow-y-auto px-4 py-5 overscroll-contain" role="region" aria-label="Cart items">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant gap-4 animate-fade-in">
              <ShoppingBag className="w-14 h-14 opacity-10" aria-hidden="true" />
              <p className="font-body text-sm">Your cart is empty</p>
              <button onClick={closeCart} className="label-caps text-primary underline touch-manipulation">
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-0 list-none" aria-label="Cart items list">
              {items.map((item, index) => (
                <li
                  key={item.variantId}
                  className="flex gap-4 py-5 border-b border-outline/10 last:border-0 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Thumbnail */}
                  <div className="relative w-[72px] h-[90px] bg-surface-container flex-shrink-0 rounded-sm overflow-hidden">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-headline font-bold text-sm text-primary leading-tight">{item.name}</p>
                        <p className="label-caps text-on-surface-variant/60 mt-1 capitalize" style={{ fontSize: '10px' }}>
                          {item.color} / {item.size}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        aria-label={`Remove ${item.name}`}
                        className="p-1 text-on-surface-variant/30 active:text-error transition-colors touch-manipulation flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Qty controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="w-8 h-8 flex items-center justify-center bg-surface-container rounded-sm active:bg-surface-container-high transition-colors touch-manipulation"
                        >
                          <Minus className="w-3 h-3" aria-hidden="true" />
                        </button>
                        <span className="font-label font-bold text-sm w-4 text-center tabular-nums" aria-label={`Quantity: ${item.quantity}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="w-8 h-8 flex items-center justify-center bg-surface-container rounded-sm active:bg-surface-container-high disabled:opacity-30 transition-colors touch-manipulation"
                        >
                          <Plus className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </div>
                      <span className="font-label font-bold text-sm text-on-surface tabular-nums">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <div className="px-4 py-4 bg-surface border-t border-outline/10 safe-bottom animate-fade-in">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-body text-on-surface-variant">Subtotal</span>
              <span className="font-label font-bold tabular-nums text-on-surface" aria-live="polite" aria-atomic="true">
                {formatPrice(total)}
              </span>
            </div>
            <p className="font-body text-xs text-on-surface-variant/50 mb-5">Shipping calculated at checkout</p>
            <Link
              href="/checkout"
              onClick={closeCart}
              aria-label={`Proceed to checkout — total ${formatPrice(total)}`}
              className="w-full h-13 moss-gradient text-on-primary label-caps px-6 py-4 rounded-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
            >
              Checkout — {formatPrice(total)}
            </Link>
            <button
              onClick={closeCart}
              className="w-full text-center label-caps text-on-surface-variant/50 active:text-primary mt-4 py-2 touch-manipulation"
            >
              Continue shopping
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
