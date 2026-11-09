import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmation } from '@/lib/email'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as import('stripe').Stripe.Checkout.Session

    try {
      const order = await prisma.order.findFirst({
        where: { stripeSessionId: session.id },
        include: {
          items: { include: { product: true } },
        },
      })

      if (!order) {
        console.error('Order not found for session:', session.id)
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          status: 'PROCESSING',
          stripePaymentId: session.payment_intent as string,
        },
      })

      // Decrement stock for each variant
      for (const item of order.items) {
        if (item.variantId) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          })
        }
      }

      // Send confirmation email
      const shippingAddress = order.shippingAddress as {
        line1: string; line2?: string; city: string; state: string; postcode: string
      }

      await sendOrderConfirmation({
        to: order.email,
        orderNumber: order.orderNumber,
        name: order.name,
        items: order.items.map((item) => ({
          name: item.product.name,
          color: item.color || '',
          size: item.size || '',
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        total: order.total,
        shippingAddress,
      })

      console.log(`✅ Order ${order.orderNumber} payment confirmed`)
    } catch (error) {
      console.error('Error processing webhook:', error)
      return NextResponse.json({ error: 'Processing error' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
