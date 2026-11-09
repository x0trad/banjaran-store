import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const featured = searchParams.get('featured')
    const category = searchParams.get('category')
    const published = searchParams.get('published')

    const where: Record<string, unknown> = {}
    if (featured === 'true') where.featured = true
    if (category) where.category = category
    // Public endpoint only shows published, admin can see all
    const session = await getSession()
    if (!session && published !== 'false') where.published = true

    const products = await prisma.product.findMany({
      where,
      include: {
        variants: {
          orderBy: [{ color: 'asc' }, { size: 'asc' }],
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('GET /api/products error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, description, price, comparePrice, images, category, tags, featured, published, variants } = body

    const slug = slugify(name)

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        images: images || [],
        category: category || 'tee',
        tags: tags || [],
        featured: featured ?? false,
        published: published ?? true,
        variants: {
          create: (variants || []).map((v: { color: string; size: string; stock: number; sku: string }) => ({
            color: v.color,
            size: v.size,
            stock: parseInt(v.stock as unknown as string),
            sku: v.sku || `${slug}-${v.color}-${v.size}`.toLowerCase().replace(/\s+/g, '-'),
          })),
        },
      },
      include: { variants: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/products error:', error)
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 })
  }
}
