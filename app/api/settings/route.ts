import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'settings' },
      update: {},
      create: { id: 'settings' },
    })
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'settings' },
      update: {
        ...(body.storeName !== undefined && { storeName: body.storeName }),
        ...(body.storeEmail !== undefined && { storeEmail: body.storeEmail }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.announcement !== undefined && { announcement: body.announcement || null }),
        ...(body.shippingRates !== undefined && { shippingRates: body.shippingRates }),
      },
      create: { id: 'settings' },
    })

    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
