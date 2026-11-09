import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { sendShippingNotification } from '@/lib/email'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: { include: { product: true } },
        customer: true,
      },
    })
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { status, trackingNumber, courier } = body

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status, ...(body.notes && { notes: body.notes }) },
    })

    // Auto-send shipping notification when marked as SHIPPED
    if (status === 'SHIPPED' && trackingNumber) {
      await sendShippingNotification({
        to: order.email,
        name: order.name,
        orderNumber: order.orderNumber,
        trackingNumber,
        courier: courier || 'Poslaju',
      })
    }

    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
