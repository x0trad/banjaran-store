import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber, calculateShipping, PICKUP_LOCATIONS, isPickup } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { items, customerInfo, fulfilment = 'delivery' } = await req.json()

    if (!items?.length) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }
    const pickup = isPickup(fulfilment)
    if (!pickup && fulfilment !== 'delivery') {
      return NextResponse.json({ error: 'Invalid delivery method' }, { status: 400 })
    }
    if (!customerInfo?.email || !customerInfo?.name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }
    if (pickup && !customerInfo.phone) {
      return NextResponse.json({ error: 'Phone number is required for self pickup' }, { status: 400 })
    }
    if (!pickup && (!customerInfo.address || !customerInfo.city || !customerInfo.state || !customerInfo.postcode)) {
      return NextResponse.json({ error: 'Please complete your shipping address' }, { status: 400 })
    }
    const shippingAddress = pickup
      ? { method: 'pickup' as const, pickupLocation: PICKUP_LOCATIONS[fulfilment] }
      : {
          method: 'delivery' as const,
          line1: customerInfo.address,
          line2: customerInfo.address2 || '',
          city: customerInfo.city,
          state: customerInfo.state,
          postcode: customerInfo.postcode,
        }

    // Validate stock and get current prices from DB
    const validatedItems = []
    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      })
      if (!variant) return NextResponse.json({ error: `Variant not found: ${item.variantId}` }, { status: 400 })
      if (variant.stock < item.quantity)
        return NextResponse.json({ error: `Insufficient stock for ${variant.product.name} (${variant.color}/${variant.size})` }, { status: 400 })

      validatedItems.push({
        ...item,
        price: variant.product.price,
        name: variant.product.name,
        color: variant.color,
        size: variant.size,
        productId: variant.productId,
        image: variant.product.images[0],
      })
    }

    const subtotal = validatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const shippingCost = pickup ? 0 : calculateShipping(subtotal, customerInfo?.state)
    const total = subtotal + shippingCost

    // Stripe's minimum charge for MYR card payments
    if (total < 2) {
      return NextResponse.json({ error: 'Minimum order total for card payment is RM 2.00' }, { status: 400 })
    }

    const orderNumber = generateOrderNumber()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerInfo?.email,
      line_items: [
        ...validatedItems.map((item) => ({
          price_data: {
            currency: 'myr',
            product_data: {
              name: `${item.name} — ${item.color} / ${item.size}`,
              images: item.image ? [item.image] : [],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        ...(shippingCost > 0
          ? [{
              price_data: {
                currency: 'myr',
                product_data: { name: 'Shipping' },
                unit_amount: Math.round(shippingCost * 100),
              },
              quantity: 1,
            }]
          : []),
      ],
      metadata: {
        orderNumber,
        customerEmail: customerInfo?.email || '',
        customerName: customerInfo?.name || '',
        customerPhone: customerInfo?.phone || '',
        fulfilment: pickup ? `Self pickup — ${PICKUP_LOCATIONS[fulfilment]}` : 'Delivery',
        shippingAddress: JSON.stringify(shippingAddress),
        items: JSON.stringify(validatedItems.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          price: i.price,
          color: i.color,
          size: i.size,
        }))),
      },
      success_url: `${appUrl}/order-success?session_id={CHECKOUT_SESSION_ID}&order=${orderNumber}`,
      cancel_url: `${appUrl}/checkout`,
    })

    // Create pending order in DB
    let customer = await prisma.customer.findUnique({ where: { email: customerInfo.email } })
    if (!customer && customerInfo.email) {
      customer = await prisma.customer.create({
        data: {
          email: customerInfo.email,
          name: customerInfo.name || '',
          phone: customerInfo.phone || '',
        },
      })
    }

    await prisma.order.create({
      data: {
        orderNumber,
        email: customerInfo.email,
        name: customerInfo.name,
        phone: customerInfo.phone || '',
        customerId: customer?.id,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        subtotal,
        shippingCost,
        total,
        stripeSessionId: session.id,
        shippingAddress,
        ...(pickup && { notes: `Self pickup — ${PICKUP_LOCATIONS[fulfilment]}` }),
        items: {
          create: validatedItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            color: item.color,
            size: item.size,
          })),
        },
      },
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error: any) {
    console.error('Checkout error:', error)
    // Stripe request errors carry a customer-safe message (e.g. amount too small)
    if (error?.type === 'StripeInvalidRequestError' && error?.message) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
