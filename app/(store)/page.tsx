export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/store/ProductCard'
import { ArrowUpRight } from 'lucide-react'

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { published: true, featured: true },
    include: { variants: true },
    take: 6,
  })
}
async function getAllProducts() {
  return prisma.product.findMany({
    where: { published: true },
    include: { variants: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })
}

export default async function HomePage() {
  const [featured, products] = await Promise.all([getFeaturedProducts(), getAllProducts()])
  const displayProducts = featured.length >= 3 ? featured : products

  return (
    <div className="bg-background pb-24">

      {/* ── Announcement Banner ── */}
      <div className="w-full bg-primary text-on-primary py-2 px-6 text-center">
        <p className="label-caps">Free shipping on orders above RM150</p>
      </div>

      {/* ── Hero ── */}
      <section className="relative w-full h-[78vh] flex items-end overflow-hidden bg-surface-container">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('/hero-mountain.jpg')", filter: 'brightness(0.8) grayscale(15%)' }}
          />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(to top, rgba(23,49,36,0.92) 0%, rgba(23,49,36,0.2) 55%, transparent 100%)' }} />

        <div className="relative z-10 px-6 pb-10 w-full">
          <span className="inline-block bg-primary text-on-primary label-caps px-3 py-1 mb-5">
            Limited Drop 01
          </span>
          <h1 className="font-headline font-extrabold text-5xl text-white leading-[0.92] tracking-[-0.04em] mb-7">
            Gear for the<br />Modern<br />Wayfarer.
          </h1>
          <Link
            href="/shop"
            className="moss-gradient text-on-primary label-caps px-7 py-4 rounded-sm inline-flex items-center gap-3 active:scale-95 transition-all"
          >
            Explore Shop
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-16 bg-surface">
        <div className="px-6 mb-8 flex justify-between items-end">
          <div>
            <p className="label-caps text-primary mb-2">Essential Equipment</p>
            <h2 className="font-headline font-bold text-3xl text-on-background tracking-tight">Featured Items</h2>
          </div>
          <Link href="/shop" className="label-caps text-on-surface-variant flex items-center gap-1 active:text-primary">
            All <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Horizontal scroll */}
        <div className="overflow-x-auto no-scrollbar px-6 gap-6" style={{ display: 'flex' }}>
          {displayProducts.map((p, i) => (
            <div key={p.id} className="flex-none w-[72vw] max-w-[300px]">
              <ProductCard {...p} comparePrice={p.comparePrice} index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission Section ── */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Divider accent */}
          <div className="flex justify-center mb-10">
            <div className="w-10 h-px bg-primary/30" />
          </div>
          <h2 className="font-headline font-bold text-3xl tracking-tight text-on-background mb-6 leading-tight">
            Built for the untamed path.
          </h2>
          <p className="font-body text-base text-on-surface-variant leading-relaxed mb-14 max-w-md mx-auto">
            Banjaran creates apparel inspired by the rugged landscapes of Malaysia. Three pillars guide every stitch.
          </p>
          <div className="grid grid-cols-3 gap-6 text-left">
            {[
              { num: '01', label: 'Rugged',     desc: 'Materials tested in tropical humidity and elevation. Built to endure.' },
              { num: '02', label: 'Minimalist', desc: 'Technical precision and functional aesthetics for the modern explorer.' },
              { num: '03', label: 'Local',      desc: 'Deeply rooted in Malaysian heritage. Designed on the peninsula.' },
            ].map((p) => (
              <div key={p.num} className="space-y-3">
                <span className="label-caps text-primary">{p.num}. {p.label}</span>
                <p className="font-body text-xs text-on-surface-variant leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Journal Teaser ── */}
      <section className="py-16 px-6 bg-surface">
        <div className="space-y-6">
          <div
            className="w-full aspect-video bg-surface-container overflow-hidden"
            style={{ backgroundImage: "url('/hero-mountain.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(30%)' }}
            role="img"
            aria-label="Misty Malaysian highland ridge"
          />
          <div className="space-y-4">
            <p className="label-caps text-primary">Banjaran Journal</p>
            <h2 className="font-headline font-bold text-3xl tracking-tight leading-tight text-on-background">
              Stories from<br />the Elevation.
            </h2>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              Field notes, expedition guides, and gear journals written by the community.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 label-caps text-on-background group active:text-primary"
            >
              Read the Journal
              <ArrowUpRight className="w-4 h-4 transition-transform group-active:translate-x-0.5 group-active:-translate-y-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
