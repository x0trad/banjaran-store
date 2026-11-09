'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Menu, Home, Search, BookOpen, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '@/store/cart'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { cn } from '@/lib/cn'

const drawerLinks = [
  { href: '/',        label: 'Home'    },
  { href: '/shop',    label: 'Shop'    },
  { href: '/blog',    label: 'Journal' },
  { href: '/about',   label: 'About'   },
]

const bottomTabItems = [
  { href: '/',      label: 'Store',   icon: Home     },
  { href: '/shop',  label: 'Shop',    icon: Search   },
  { href: '/blog',  label: 'Journal', icon: BookOpen },
  { href: '/account', label: 'Account', icon: User   },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount, openCart } = useCart()
  const pathname = usePathname()

  const [badgeKey, setBadgeKey] = useState(0)
  const prevCount = useRef(itemCount)
  useEffect(() => {
    if (itemCount > prevCount.current) setBadgeKey((k) => k + 1)
    prevCount.current = itemCount
  }, [itemCount])

  return (
    <>
      {/* ── Top bar — dark primary with logo ── */}
      <header className="sticky top-0 z-40 bg-primary/95 backdrop-blur-md border-b border-primary-container/30 safe-top">
        <div className="px-5 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-14">

            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 -ml-2 text-on-primary/80 active:text-on-primary active:bg-primary-container/40 rounded-sm"
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Logo — always centred */}
            <Link
              href="/"
              aria-label="Banjaran — homepage"
              className="absolute left-1/2 -translate-x-1/2 flex items-center h-8"
            >
              <Image
                src="/logo.png"
                alt="Banjaran"
                width={120}
                height={32}
                className="h-7 w-auto object-contain"
                priority
              />
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 -mr-2 text-on-primary/80 active:text-on-primary active:bg-primary-container/40 rounded-sm"
              aria-label={itemCount > 0 ? `Cart — ${itemCount} item${itemCount !== 1 ? 's' : ''}` : 'Open cart'}
            >
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              {itemCount > 0 && (
                <span
                  key={badgeKey}
                  className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-on-primary text-primary text-[10px] flex items-center justify-center rounded-full font-bold animate-badge-pop"
                  aria-hidden="true"
                >
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Side drawer — dark ── */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" onClose={() => setMenuOpen(false)} className="bg-primary border-primary-container/30">
          <SheetHeader className="border-primary-container/30">
            <SheetTitle className="flex items-center h-8">
              <Image src="/logo.png" alt="Banjaran" width={100} height={28} className="h-6 w-auto object-contain" />
            </SheetTitle>
            <SheetClose onClose={() => setMenuOpen(false)} className="text-on-primary/50 hover:text-on-primary active:bg-primary-container/40" />
          </SheetHeader>
          <nav aria-label="Navigation menu" className="flex flex-col px-2 py-6 flex-1 gap-1">
            {drawerLinks.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'px-4 py-3.5 text-base font-semibold tracking-tight transition-colors rounded-sm',
                    active ? 'bg-primary-container text-on-primary' : 'text-on-primary/70 active:bg-primary-container/40'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <div className="px-6 pb-8">
            <p className="label-caps text-on-primary/30">Born from the mountains</p>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Bottom tab bar — Stitch frosted glass ── */}
      <nav
        aria-label="Bottom navigation"
        className="fixed bottom-0 left-0 right-0 z-30 mist-glass border-t border-primary/5 rounded-t-xl shadow-[0_-24px_40px_rgba(23,49,36,0.06)] safe-bottom"
      >
        <div className="flex items-center justify-around pt-3 pb-2 max-w-md mx-auto px-4">
          {bottomTabItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && item.href !== '/account' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center justify-center px-4 py-1.5 rounded-lg transition-all duration-200 active:scale-90',
                  active
                    ? 'bg-primary text-on-primary'
                    : 'text-primary/40 hover:text-primary'
                )}
              >
                <item.icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
                <span className="label-caps mt-0.5" style={{ fontSize: '10px' }}>{item.label}</span>
              </Link>
            )
          })}

          {/* Cart tab */}
          <button
            onClick={openCart}
            aria-label={itemCount > 0 ? `Cart — ${itemCount} item${itemCount !== 1 ? 's' : ''}` : 'Cart'}
            className="relative flex flex-col items-center justify-center px-4 py-1.5 rounded-lg transition-all duration-200 active:scale-90 text-primary/40"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />
            {itemCount > 0 && (
              <span
                key={`tab-${badgeKey}`}
                className="absolute top-0 right-1 w-4 h-4 bg-primary text-on-primary text-[9px] flex items-center justify-center rounded-full font-bold animate-badge-pop"
                aria-hidden="true"
              >
                {itemCount}
              </span>
            )}
            <span className="label-caps mt-0.5" style={{ fontSize: '10px' }}>Cart</span>
          </button>
        </div>
      </nav>
    </>
  )
}
