'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useCart } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, ChevronLeft, ChevronRight, Check, Truck, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { cn } from '@/lib/cn'

// Display order for sizes. Each product shows only the sizes it actually has.
const SIZE_ORDER = ['XS', 'S', 'S/M', 'M', 'L', 'L/XL', 'XL', 'XXL', '2XL', '3XL', '4XL']
const sizeRank = (s: string) => {
  const i = SIZE_ORDER.indexOf(s)
  return i === -1 ? SIZE_ORDER.length : i
}

const COLOR_MAP: Record<string, string> = {
  white:  '#ffffff',
  black:  '#1c1917',
  navy:   '#1e3a5f',
  forest: '#173124',
  stone:  '#78716c',
  cream:  '#f5f0e8',
}

export default function ProductPage() {
  const { slug } = useParams()
  const [product, setProduct]         = useState<any>(null)
  const [loading, setLoading]         = useState(true)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize]   = useState<string>('')
  const [currentImage, setCurrentImage]   = useState(0)
  const [adding, setAdding]           = useState(false)
  const { addItem } = useCart()
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToImage = useCallback((index: number) => {
    const container = scrollRef.current
    if (!container) return
    container.scrollTo({ left: index * container.offsetWidth, behavior: 'smooth' })
    setCurrentImage(index)
  }, [])

  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return
    const index = Math.round(container.scrollLeft / container.offsetWidth)
    setCurrentImage(index)
  }, [])

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data)
        const colors = Array.from(new Set(data.variants.map((v: any) => v.color)))
        if (colors.length) setSelectedColor(colors[0] as string)
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="bg-background pb-28" aria-busy="true" aria-label="Loading product">
        <div className="aspect-[4/5] shimmer" />
        <div className="px-6 pt-8 space-y-4">
          <div className="h-4 shimmer rounded w-1/4" />
          <div className="h-8 shimmer rounded w-3/4" />
          <div className="h-6 shimmer rounded w-1/4" />
        </div>
      </div>
    )
  }

  if (!product || product.error) {
    return (
      <div className="px-6 py-20 text-center bg-background pb-28">
        <p className="text-on-surface-variant font-body">Product not found.</p>
        <Link href="/shop" className="label-caps text-primary mt-4 inline-block">← Back to shop</Link>
      </div>
    )
  }

  const colors          = Array.from(new Set(product.variants.map((v: any) => v.color))) as string[]
  const productSizes    = (Array.from(new Set(product.variants.map((v: any) => v.size))) as string[])
    .sort((a, b) => sizeRank(a) - sizeRank(b))
  const sizesForColor   = product.variants.filter((v: any) => v.color === selectedColor).map((v: any) => v.size)
  const selectedVariant = product.variants.find((v: any) => v.color === selectedColor && v.size === selectedSize)
  const stockForVariant = selectedVariant?.stock ?? 0

  const handleAddToCart = async () => {
    if (!selectedColor)    return toast.error('Please select a colour')
    if (!selectedSize)     return toast.error('Please select a size')
    if (!selectedVariant)  return toast.error('Variant not available')
    if (stockForVariant === 0) return toast.error('Out of stock')

    setAdding(true)
    addItem({
      id: product.id, productId: product.id, variantId: selectedVariant.id,
      name: product.name, slug: product.slug, image: product.images[0] || '',
      price: product.price, color: selectedColor, size: selectedSize,
      quantity: 1, stock: stockForVariant,
    })
    toast.success('Added to cart!')
    setTimeout(() => setAdding(false), 500)
  }

  return (
    <div className="bg-background pb-28">

      {/* ── Snap Image Carousel ── */}
      <section className="relative w-full bg-surface-container-low" role="region" aria-label="Product images">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
        >
          {product.images.length > 0 ? product.images.map((img: string, i: number) => (
            <div key={i} className="flex-none w-full h-[580px] snap-center p-4">
              <Image
                src={img}
                alt={`${product.name} — image ${i + 1}`}
                fill={false}
                width={600}
                height={580}
                className="w-full h-full object-cover rounded-sm shadow-sm"
                priority={i === 0}
              />
            </div>
          )) : (
            <div className="flex-none w-full h-[580px] snap-center p-4 flex items-center justify-center">
              <span className="font-headline font-bold text-6xl text-primary/20 tracking-widest">BNJ</span>
            </div>
          )}
        </div>

        {/* Back link */}
        <Link
          href="/shop"
          aria-label="Back to shop"
          className="absolute top-4 left-4 z-10 w-9 h-9 bg-surface/80 backdrop-blur-sm flex items-center justify-center rounded-sm active:bg-surface"
        >
          <ChevronLeft className="w-5 h-5 text-on-surface" aria-hidden="true" />
        </Link>

        {/* Prev / Next arrows — only shown when there are multiple images */}
        {product.images.length > 1 && (
          <>
            <button
              onClick={() => scrollToImage(Math.max(0, currentImage - 1))}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-surface/80 backdrop-blur-sm flex items-center justify-center rounded-full shadow active:bg-surface disabled:opacity-30 transition-opacity"
              disabled={currentImage === 0}
            >
              <ChevronLeft className="w-5 h-5 text-on-surface" aria-hidden="true" />
            </button>
            <button
              onClick={() => scrollToImage(Math.min(product.images.length - 1, currentImage + 1))}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-surface/80 backdrop-blur-sm flex items-center justify-center rounded-full shadow active:bg-surface disabled:opacity-30 transition-opacity"
              disabled={currentImage === product.images.length - 1}
            >
              <ChevronRight className="w-5 h-5 text-on-surface" aria-hidden="true" />
            </button>
          </>
        )}

        {/* Dash indicators */}
        {product.images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2" role="tablist" aria-label="Product images">
            {product.images.map((_: string, i: number) => (
              <button
                key={i}
                role="tab"
                aria-label={`Image ${i + 1}`}
                aria-selected={i === currentImage}
                onClick={() => scrollToImage(i)}
                className={cn(
                  'h-0.5 rounded-sm transition-all duration-300',
                  i === currentImage ? 'w-8 bg-primary' : 'w-8 bg-outline-variant/30'
                )}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Product Info ── */}
      <section className="px-6 pt-8 animate-fade-in-up">
        {product.category && (
          <span className="label-caps text-on-surface-variant block mb-2" style={{ fontSize: '11px' }}>
            {product.category}
          </span>
        )}
        <h1 className="font-headline font-bold text-3xl tracking-tight text-on-surface leading-none mb-2">
          {product.name}
        </h1>
        <p className="font-label font-bold text-xl text-primary mb-6">
          {formatPrice(product.price)}
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-on-surface-variant/50 text-sm font-normal line-through ml-3">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </p>

        {/* ── Colour ── */}
        <div className="mb-7">
          <div className="flex justify-between items-end mb-4">
            <h3 className="label-caps text-on-surface-variant">Colour</h3>
            <span className="font-label text-xs text-on-surface font-medium capitalize">{selectedColor}</span>
          </div>
          <div className="flex gap-3" role="radiogroup" aria-label="Select colour">
            {colors.map((color) => {
              const isSelected = selectedColor === color
              const isWhite = color.toLowerCase() === 'white'
              return (
                <button
                  key={color}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${color}${isSelected ? ' (selected)' : ''}`}
                  onClick={() => { setSelectedColor(color); setSelectedSize('') }}
                  className={cn(
                    'w-10 h-10 rounded-sm border-2 transition-all duration-150 touch-manipulation',
                    isSelected
                      ? 'border-primary ring-2 ring-primary ring-offset-2 scale-110'
                      : isWhite
                      ? 'border-outline/30 hover:border-outline'
                      : 'border-transparent hover:border-outline/30'
                  )}
                  style={{ backgroundColor: COLOR_MAP[color.toLowerCase()] || '#888' }}
                />
              )
            })}
          </div>
        </div>

        {/* ── Size ── */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <h3 className="label-caps text-on-surface-variant">Size</h3>
            <button className="label-caps text-on-surface underline touch-manipulation" style={{ fontSize: '10px' }}>
              Fit Guide
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Select size">
            {productSizes.map((size) => {
              const available = sizesForColor.includes(size)
              const variant   = product.variants.find((v: any) => v.color === selectedColor && v.size === size)
              const inStock   = variant && variant.stock > 0
              const isSelected = selectedSize === size
              return (
                <button
                  key={size}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${size}${!available || !inStock ? ' — unavailable' : ''}`}
                  onClick={() => available && inStock && setSelectedSize(size)}
                  disabled={!available || !inStock}
                  className={cn(
                    'h-12 font-label text-sm font-medium border-2 transition-all duration-150 touch-manipulation',
                    isSelected
                      ? 'border-primary bg-primary text-on-primary font-bold'
                      : available && inStock
                      ? 'border-outline/20 text-on-surface hover:bg-surface-container transition-colors'
                      : 'border-outline/10 text-on-surface-variant/30 cursor-not-allowed line-through'
                  )}
                >
                  {size}
                </button>
              )
            })}
          </div>

          {selectedVariant && stockForVariant <= 5 && stockForVariant > 0 && (
            <p className="label-caps text-secondary mt-3 animate-soft-pulse" role="status">
              Only {stockForVariant} left
            </p>
          )}
        </div>

        {/* ── Description ── */}
        <div className="mb-8">
          <h3 className="font-headline font-bold text-base mb-3 text-on-surface">The Technical Profile</h3>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">{product.description}</p>
        </div>

        {/* ── Info strip ── */}
        <ul className="pt-6 border-t border-outline/10 space-y-3 list-none">
          {[
            { icon: Check,     text: 'Free shipping on orders above RM150' },
            { icon: Truck,     text: 'Ships within 2–4 business days'      },
            { icon: RefreshCw, text: 'Easy returns within 14 days'         },
          ].map((item) => (
            <li key={item.text} className="flex items-center gap-3">
              <item.icon className="w-3.5 h-3.5 text-primary flex-shrink-0" aria-hidden="true" />
              <span className="font-body text-xs text-on-surface-variant">{item.text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Sticky Add to Cart bar ── */}
      <div
        className="fixed bottom-[4.5rem] left-0 right-0 z-20 bg-background/90 backdrop-blur-sm px-4 py-3 safe-bottom animate-slide-up"
        role="region"
        aria-label="Add to cart"
      >
        <button
          onClick={handleAddToCart}
          disabled={adding || (!!selectedSize && stockForVariant === 0)}
          aria-label={stockForVariant === 0 && selectedSize ? 'Sold out' : `Add ${product.name} to cart`}
          className="w-full h-14 moss-gradient text-on-primary font-label font-bold text-sm uppercase tracking-widest rounded-sm flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] disabled:opacity-50 transition-all"
        >
          <ShoppingCart className="w-4 h-4" aria-hidden="true" />
          {stockForVariant === 0 && selectedSize ? 'Sold Out' : adding ? 'Adding…' : 'Add to Expedition Bag'}
        </button>
      </div>
    </div>
  )
}
