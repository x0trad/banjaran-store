import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface OrderEmailProps {
  to: string
  orderNumber: string
  name: string
  items: Array<{ name: string; color: string; size: string; quantity: number; price: number }>
  subtotal: number
  shippingCost: number
  total: number
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    postcode: string
  }
}

export async function sendOrderConfirmation(props: OrderEmailProps) {
  const itemsHtml = props.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4;">
          ${item.name} — ${item.color} / ${item.size}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4; text-align: right;">
          RM ${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>`
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, sans-serif; color: #1c1917; background: #fafaf9; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; }
        .header { background: #1f5e44; padding: 32px; text-align: center; }
        .header h1 { color: #fff; font-size: 28px; margin: 0; letter-spacing: 4px; }
        .header p { color: #bce1ce; margin: 8px 0 0; }
        .body { padding: 32px; }
        .section { margin-bottom: 24px; }
        .label { font-size: 12px; color: #78716c; text-transform: uppercase; letter-spacing: 1px; }
        table { width: 100%; border-collapse: collapse; }
        .totals td { padding: 8px 0; }
        .footer { background: #f5f5f4; padding: 24px; text-align: center; font-size: 13px; color: #78716c; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>BANJARAN</h1>
          <p>Order Confirmed #${props.orderNumber}</p>
        </div>
        <div class="body">
          <p>Hey ${props.name}, your order is confirmed and being prepared! 🏔️</p>

          <div class="section">
            <div class="label">Order Items</div>
            <table style="margin-top: 12px;">
              <thead>
                <tr style="font-size: 13px; color: #78716c;">
                  <th style="text-align: left; padding-bottom: 8px;">Item</th>
                  <th style="text-align: center; padding-bottom: 8px;">Qty</th>
                  <th style="text-align: right; padding-bottom: 8px;">Total</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
          </div>

          <div class="section">
            <table class="totals">
              <tr>
                <td style="color: #78716c;">Subtotal</td>
                <td style="text-align: right;">RM ${props.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="color: #78716c;">Shipping</td>
                <td style="text-align: right;">${props.shippingCost === 0 ? 'FREE' : 'RM ' + props.shippingCost.toFixed(2)}</td>
              </tr>
              <tr style="font-weight: 600; font-size: 16px;">
                <td style="padding-top: 12px;">Total</td>
                <td style="text-align: right; padding-top: 12px;">RM ${props.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="section" style="background: #f0f9f4; padding: 16px; border-radius: 8px;">
            <div class="label">Shipping To</div>
            <p style="margin: 8px 0 0;">
              ${props.shippingAddress.line1}<br>
              ${props.shippingAddress.line2 ? props.shippingAddress.line2 + '<br>' : ''}
              ${props.shippingAddress.city}, ${props.shippingAddress.state} ${props.shippingAddress.postcode}
            </p>
          </div>

          <p style="color: #78716c; font-size: 14px;">
            You'll receive a shipping notification with tracking details once your order is on its way.
            Questions? Reply to this email or reach us at <a href="mailto:hello@banjaran.my" style="color: #267553;">hello@banjaran.my</a>
          </p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Banjaran · Made in Malaysia 🇲🇾<br>
          Proudly born from the mountains.
        </div>
      </div>
    </body>
    </html>
  `

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: props.to,
    subject: `Order Confirmed — #${props.orderNumber} 🏔️`,
    html,
  })
}

export async function sendShippingNotification(props: {
  to: string
  name: string
  orderNumber: string
  trackingNumber: string
  courier: string
}) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: props.to,
    subject: `Your Banjaran order is on its way! #${props.orderNumber}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1f5e44; padding: 32px; text-align: center;">
          <h1 style="color: #fff; letter-spacing: 4px; margin: 0;">BANJARAN</h1>
          <p style="color: #bce1ce;">Your order is heading your way! 📦</p>
        </div>
        <div style="padding: 32px;">
          <p>Hey ${props.name}! Your order <strong>#${props.orderNumber}</strong> has been shipped.</p>
          <div style="background: #f0f9f4; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0; font-size: 13px; color: #78716c; text-transform: uppercase; letter-spacing: 1px;">Tracking Details</p>
            <p style="margin: 8px 0 0; font-size: 18px; font-weight: 600;">${props.trackingNumber}</p>
            <p style="margin: 4px 0 0; color: #78716c;">via ${props.courier}</p>
          </div>
          <p style="color: #78716c; font-size: 14px;">See you on the mountain! 🏔️</p>
        </div>
      </div>
    `,
  })
}
