import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const variants = await prisma.productVariant.findMany({
      include: {
        product: { select: { id: true, name: true, images: true, published: true } },
      },
      orderBy: [{ product: { name: 'asc' } }, { color: 'asc' }, { size: 'asc' }],
    })

    return NextResponse.json(variants)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { variantId, stock } = await req.json()

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: parseInt(stock) },
    })

    return NextResponse.json(variant)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
