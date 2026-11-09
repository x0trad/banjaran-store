import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
      include: { variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] } },
    })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { variants, ...data } = body

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...data,
        price: data.price ? parseFloat(data.price) : undefined,
        comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
      },
    })

    // Update variants if provided
    if (variants) {
      for (const v of variants) {
        if (v.id) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: { stock: parseInt(v.stock), color: v.color, size: v.size },
          })
        } else {
          await prisma.productVariant.create({
            data: {
              productId: params.id,
              color: v.color,
              size: v.size,
              stock: parseInt(v.stock),
              sku: v.sku || `${product.slug}-${v.color}-${v.size}`.toLowerCase().replace(/\s+/g, '-'),
            },
          })
        }
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: true },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/products/[id] error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
