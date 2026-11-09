import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number | null
  images: string[]
  variants: Array<{ color: string; stock: number; size?: string }>
  category?: string
  index?: number
}

const STOCK_BADGE: Record<string, { label: string; className: string }> = {
  out:  { label: 'Sold Out',  className: 'bg-surface-container-highest text-on-surface-variant' },
  low:  { label: 'Low Stock', className: 'bg-secondary-fixed text-on-secondary-fixed' },
  in:   { label: 'In Stock',  className: 'bg-primary-fixed text-on-primary-fixed' },
}

export default function ProductCard({ name, slug, price, comparePrice, images, variants, category, index = 0 }: ProductCardProps) {
  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0)
  const stockState = totalStock === 0 ? 'out' : totalStock <= 5 ? 'low' : 'in'
  const badge = STOCK_BADGE[stockState]

  // Stitch staggered grid: even-indexed cards are offset down
  const isOffset = index % 2 !== 0

  return (
    <article className={`stagger-item group ${isOffset ? 'translate-y-6' : ''}`}>
      <Link
        href={`/shop/${slug}`}
        className="block"
        aria-label={`${name} — ${formatPrice(price)}`}
      >
        {/* Image */}
        <div className="relative aspect-square bg-surface-container overflow-hidden mb-4">
          {images[0] ? (
            <Image
              src={images[0]}
              alt={name}
              fill
              sizes="(max-width: 640px) 72vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center dot-grid opacity-10">
              <span className="font-headline font-bold text-4xl text-primary tracking-[0.3em]">BNJ</span>
            </div>
          )}

          {/* Back image hover */}
          {images[1] && (
            <Image
              src={images[1]}
              alt={`${name} — alternate view`}
              fill
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              aria-hidden="true"
            />
          )}

          {/* Stock badge */}
          <div className="absolute top-3 left-3">
            <span className={`label-caps px-2 py-1 ${badge.className}`} style={{ fontSize: '9px' }}>
              {badge.label}
            </span>
          </div>

          {/* Sold out overlay */}
          {stockState === 'out' && (
            <div className="absolute inset-0 bg-surface/60" />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1">
          {category && (
            <span className="label-caps text-on-surface-variant/50" style={{ fontSize: '9px' }}>
              {category}
            </span>
          )}
          <h3 className="font-headline font-bold text-sm tracking-tight text-primary leading-tight">
            {name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-label font-bold text-xs text-on-surface">{formatPrice(price)}</span>
            {comparePrice && comparePrice > price && (
              <span className="text-[10px] text-on-surface-variant/50 line-through" aria-label={`Was ${formatPrice(comparePrice)}`}>
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
