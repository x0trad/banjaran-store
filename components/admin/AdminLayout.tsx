'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  FileText, Settings, LogOut, Menu, Archive, X
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/inventory', icon: Archive, label: 'Inventory' },
  { href: '/admin/customers', icon: Users, label: 'Customers' },
  { href: '/admin/blog', icon: FileText, label: 'Blog' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

// Bottom tab items (subset for mobile)
const bottomTabs = [
  { href: '/admin', icon: LayoutDashboard, label: 'Home' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/inventory', icon: Archive, label: 'Stock' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' })
    router.push('/admin-login')
  }

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href))

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-stone-950 fixed inset-y-0 left-0 z-30">
        <div className="flex flex-col h-full">
          <div className="px-6 py-5 border-b border-stone-800">
            <p className="font-display text-white font-bold tracking-[0.25em] text-lg uppercase">banjaran</p>
            <p className="text-stone-500 text-xs mt-0.5 tracking-widest uppercase">Admin</p>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                  isActive(item.href)
                    ? 'bg-banjaran-900 text-banjaran-300 font-medium'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-3 py-4 border-t border-stone-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-stone-500 hover:text-red-400 w-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar sheet */}
      <Sheet open={sidebarOpen} onOpenChange={() => setSidebarOpen(false)}>
        <SheetContent side="left" onClose={() => setSidebarOpen(false)} className="bg-stone-950 border-r-0 w-64 flex flex-col p-0">
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-stone-800">
            <SheetTitle className="text-left">
              <span className="font-display text-white font-bold tracking-[0.25em] text-lg uppercase">banjaran</span>
              <span className="block text-stone-500 text-xs mt-0.5 tracking-widest uppercase">Admin</span>
            </SheetTitle>
            <SheetClose onClose={() => setSidebarOpen(false)} />
          </SheetHeader>
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 text-sm transition-colors touch-manipulation rounded-md',
                  isActive(item.href)
                    ? 'bg-banjaran-900 text-banjaran-300 font-medium'
                    : 'text-stone-400 active:text-stone-100 active:bg-stone-800'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-3 py-4 border-t border-stone-800">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-3 text-sm text-stone-500 active:text-stone-300 touch-manipulation"
            >
              View Store
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 text-sm text-stone-500 active:text-red-400 w-full touch-manipulation"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 lg:ml-56 pb-16 lg:pb-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-stone-200 px-4 sm:px-6 h-12 lg:h-14 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 -ml-1.5 text-stone-500 active:text-stone-900 touch-manipulation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <p className="lg:hidden text-sm font-semibold font-display tracking-wider uppercase">Banjaran</p>
          <div className="hidden lg:block flex-1" />
          <Link
            href="/"
            target="_blank"
            className="text-xs text-stone-500 hover:text-stone-900 transition-colors hidden lg:block"
          >
            View Store →
          </Link>
          <div className="lg:hidden w-8" />
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-stone-200 safe-bottom">
        <div className="flex items-center justify-around h-14">
          {bottomTabs.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-16 h-full touch-manipulation transition-colors',
                isActive(item.href) ? 'text-banjaran-700' : 'text-stone-400 active:text-stone-700'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 w-16 h-full text-stone-400 active:text-stone-700 touch-manipulation"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </div>
    </div>
  )
}
