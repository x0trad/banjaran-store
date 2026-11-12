export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/store/ProductCard'
import Link from 'next/link'
import { cn } from '@/lib/cn'

export const metadata = { title: 'Shop — Banjaran' }

const CATEGORIES = [
  { label: 'All',      value: ''         },
  { label: 'Tees',     value: 'tee'      },
  { label: 'Featured', value: 'featured' },
]

async function getProducts(category?: string, featured?: string) {
  return prisma.product.findMany({
    where: {
      published: true,
      ...(category && { category }),
      ...(featured === 'true' && { featured: true }),
    },
    include: { variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] } },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string; featured?: string }
}) {
  const products = await getProducts(searchParams.category, searchParams.featured)
  const activeCategory = searchParams.category || (searchParams.featured === 'true' ? 'featured' : '')

  return (
    <div className="bg-background pb-24 min-h-screen">

      {/* ── Announcement Banner ── */}
      <div className="w-full bg-primary text-on-primary py-2 px-6 text-center">
        <p className="label-caps">Complimentary local shipping on orders above RM150</p>
      </div>

      {/* ── Editorial Page Title ── */}
      <section className="px-6 pt-10 pb-6">
        <h1 className="font-headline font-bold text-5xl tracking-[-0.04em] text-primary leading-none">
          The Store
        </h1>
        <p className="label-caps text-on-surface-variant/60 mt-3">
          Essential equipment for the highland wayfarer — {products.length} items
        </p>
      </section>

      {/* ── Category Filters ── */}
      <nav aria-label="Filter by category" className="mb-10">
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-6">
          {CATEGORIES.map((cat) => {
            const isActive =
              (cat.value === '' && !activeCategory) ||
              cat.value === activeCategory
            const href =
              cat.value === ''        ? '/shop'
              : cat.value === 'featured' ? '/shop?featured=true'
              : `/shop?category=${cat.value}`
            return (
              <Link
                key={cat.value}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex-none px-5 py-2 label-caps rounded-sm transition-colors touch-manipulation',
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant active:bg-surface-container-high'
                )}
              >
                {cat.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ── Staggered Product Grid ── */}
      <section className="px-6">
        {products.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">
            <p className="font-headline font-bold text-2xl text-primary mb-2">Nothing here yet.</p>
            <p className="font-body text-sm">Check back soon for new drops.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12">
            {products.map((p, i) => (
              <ProductCard key={p.id} {...p} comparePrice={p.comparePrice} index={i} category={p.category ?? undefined} />
            ))}
          </div>
        )}
      </section>

      {/* ── CTA Editorial Banner ── */}
      {products.length > 0 && (
        <section className="mt-20 mx-6">
          <div className="relative h-[320px] bg-primary overflow-hidden flex items-end p-7">
            <div
              className="absolute inset-0 opacity-30"
              style={{ backgroundImage: "url('/hero-mountain.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%)' }}
            />
            <div className="relative z-10 max-w-[220px]">
              <h2 className="font-headline text-2xl font-bold text-on-primary mb-3 leading-tight">
                Beyond the Tree Line.
              </h2>
              <p className="font-body text-xs text-on-primary/70 mb-5 leading-relaxed">
                Designed and tested in the unforgiving humidity of the central highlands.
              </p>
              <Link
                href="/blog"
                className="bg-surface text-primary label-caps px-5 py-3 rounded-sm inline-block active:scale-95 transition-all"
              >
                Explore Journal
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Subtle dot-grid texture */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-[0.025] dot-grid" aria-hidden="true" />
    </div>
  )
}
