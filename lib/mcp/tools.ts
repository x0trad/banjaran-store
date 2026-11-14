import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { sendShippingNotification } from '@/lib/email'

type JsonSchema = Record<string, unknown>

export interface McpTool {
  name: string
  description: string
  inputSchema: JsonSchema
  handler: (args: any) => Promise<unknown>
}

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']
const PAYMENT_STATUSES = ['UNPAID', 'PAID', 'REFUNDED']

function clampLimit(n: unknown, def = 20, max = 100) {
  const v = Number(n)
  if (!Number.isFinite(v) || v <= 0) return def
  return Math.min(Math.floor(v), max)
}

async function findVariant(args: { variantId?: string; sku?: string }) {
  if (args.variantId) return prisma.productVariant.findUnique({ where: { id: args.variantId }, include: { product: { select: { name: true } } } })
  if (args.sku) return prisma.productVariant.findUnique({ where: { sku: args.sku }, include: { product: { select: { name: true } } } })
  throw new Error('Provide variantId or sku')
}

async function findOrder(args: { id?: string; orderNumber?: string }) {
  const include = { items: { include: { product: { select: { name: true, slug: true } } } }, customer: true }
  if (args.id) return prisma.order.findUnique({ where: { id: args.id }, include })
  if (args.orderNumber) return prisma.order.findUnique({ where: { orderNumber: args.orderNumber }, include })
  throw new Error('Provide id or orderNumber')
}

export const tools: McpTool[] = [
  // ---------- Products ----------
  {
    name: 'list_products',
    description: 'List products with their variants (colour, size, stock, SKU). Includes unpublished products unless publishedOnly is true.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Filter by category, e.g. "tee"' },
        featured: { type: 'boolean' },
        publishedOnly: { type: 'boolean', default: false },
        search: { type: 'string', description: 'Case-insensitive match on product name' },
      },
    },
    handler: async (a) => {
      const where: any = {}
      if (a.category) where.category = a.category
      if (typeof a.featured === 'boolean') where.featured = a.featured
      if (a.publishedOnly) where.published = true
      if (a.search) where.name = { contains: a.search, mode: 'insensitive' }
      return prisma.product.findMany({
        where,
        include: { variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] } },
        orderBy: { createdAt: 'desc' },
      })
    },
  },
  {
    name: 'get_product',
    description: 'Get one product with variants by id or slug.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' }, slug: { type: 'string' } },
    },
    handler: async (a) => {
      if (!a.id && !a.slug) throw new Error('Provide id or slug')
      const p = await prisma.product.findUnique({
        where: a.id ? { id: a.id } : { slug: a.slug },
        include: { variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] } },
      })
      if (!p) throw new Error('Product not found')
      return p
    },
  },
  {
    name: 'update_product',
    description: 'Update product fields (price in MYR, compare-at price, name, description, tags, category, featured, published). Only fields you pass are changed. Pass comparePrice null to remove a sale price.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        comparePrice: { type: ['number', 'null'] },
        category: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        featured: { type: 'boolean' },
        published: { type: 'boolean' },
      },
    },
    handler: async (a) => {
      const data: any = {}
      for (const k of ['name', 'description', 'category', 'tags', 'featured', 'published']) if (a[k] !== undefined) data[k] = a[k]
      if (a.price !== undefined) {
        if (!(a.price > 0)) throw new Error('price must be greater than 0')
        data.price = a.price
      }
      if (a.comparePrice !== undefined) data.comparePrice = a.comparePrice
      if (Object.keys(data).length === 0) throw new Error('No fields to update')
      return prisma.product.update({ where: { id: a.id }, data, include: { variants: true } })
    },
  },

  // ---------- Inventory ----------
  {
    name: 'list_inventory',
    description: 'List every variant with stock level. Use lowStockThreshold to return only variants at or below that stock.',
    inputSchema: {
      type: 'object',
      properties: { lowStockThreshold: { type: 'integer', minimum: 0 } },
    },
    handler: async (a) => {
      const where: any = {}
      if (Number.isInteger(a.lowStockThreshold)) where.stock = { lte: a.lowStockThreshold }
      const variants = await prisma.productVariant.findMany({
        where,
        include: { product: { select: { id: true, name: true, published: true } } },
        orderBy: [{ product: { name: 'asc' } }, { color: 'asc' }, { size: 'asc' }],
      })
      return variants.map((v) => ({
        variantId: v.id, sku: v.sku, product: v.product.name, productId: v.product.id,
        published: v.product.published, color: v.color, size: v.size, stock: v.stock,
      }))
    },
  },
  {
    name: 'set_stock',
    description: 'Set the exact stock count for a variant (identify by variantId or sku).',
    inputSchema: {
      type: 'object',
      required: ['stock'],
      properties: { variantId: { type: 'string' }, sku: { type: 'string' }, stock: { type: 'integer', minimum: 0 } },
    },
    handler: async (a) => {
      if (!Number.isInteger(a.stock) || a.stock < 0) throw new Error('stock must be a non-negative integer')
      const v = await findVariant(a)
      if (!v) throw new Error('Variant not found')
      const previousStock = v.stock
      const updated = await prisma.productVariant.update({ where: { id: v.id }, data: { stock: a.stock } })
      return { sku: updated.sku, product: v.product.name, color: updated.color, size: updated.size, previousStock, stock: updated.stock }
    },
  },
  {
    name: 'adjust_stock',
    description: 'Add or subtract stock for a variant, e.g. delta 20 after a restock or -1 for a damaged item. Stock will not go below 0.',
    inputSchema: {
      type: 'object',
      required: ['delta'],
      properties: { variantId: { type: 'string' }, sku: { type: 'string' }, delta: { type: 'integer' } },
    },
    handler: async (a) => {
      if (!Number.isInteger(a.delta) || a.delta === 0) throw new Error('delta must be a non-zero integer')
      const v = await findVariant(a)
      if (!v) throw new Error('Variant not found')
      const previousStock = v.stock
      const next = Math.max(0, previousStock + a.delta)
      const updated = await prisma.productVariant.update({ where: { id: v.id }, data: { stock: next } })
      return { sku: updated.sku, product: v.product.name, color: updated.color, size: updated.size, previousStock, stock: updated.stock }
    },
  },

  // ---------- Orders ----------
  {
    name: 'list_orders',
    description: 'List recent orders, newest first. Filter by fulfilment status, payment status, or days back.',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ORDER_STATUSES },
        paymentStatus: { type: 'string', enum: PAYMENT_STATUSES },
        days: { type: 'integer', minimum: 1, description: 'Only orders created in the last N days' },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      },
    },
    handler: async (a) => {
      const where: any = {}
      if (a.status) where.status = a.status
      if (a.paymentStatus) where.paymentStatus = a.paymentStatus
      if (a.days) where.createdAt = { gte: new Date(Date.now() - a.days * 86400000) }
      const orders = await prisma.order.findMany({
        where,
        include: { items: { include: { product: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: clampLimit(a.limit),
      })
      return orders.map((o) => ({
        id: o.id, orderNumber: o.orderNumber, createdAt: o.createdAt, name: o.name, email: o.email,
        status: o.status, paymentStatus: o.paymentStatus, total: o.total,
        items: o.items.map((i) => `${i.quantity}x ${i.product.name}${i.color ? ` ${i.color}` : ''}${i.size ? `/${i.size}` : ''}`),
      }))
    },
  },
  {
    name: 'get_order',
    description: 'Get full order details (items, shipping address, customer, notes) by id or orderNumber (e.g. BNJ-XXXX-XXXX).',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' }, orderNumber: { type: 'string' } },
    },
    handler: async (a) => {
      const o = await findOrder(a)
      if (!o) throw new Error('Order not found')
      return o
    },
  },
  {
    name: 'update_order_status',
    description: 'Change an order\'s fulfilment status and/or notes. When status is SHIPPED and trackingNumber is given, the customer is emailed a shipping notification.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        orderNumber: { type: 'string' },
        status: { type: 'string', enum: ORDER_STATUSES },
        notes: { type: 'string' },
        trackingNumber: { type: 'string' },
        courier: { type: 'string', default: 'Poslaju' },
      },
    },
    handler: async (a) => {
      const o = await findOrder(a)
      if (!o) throw new Error('Order not found')
      const data: any = {}
      if (a.status) data.status = a.status
      if (a.notes !== undefined) data.notes = a.notes
      if (Object.keys(data).length === 0) throw new Error('Provide status or notes')
      const updated = await prisma.order.update({ where: { id: o.id }, data })
      let emailSent = false
      if (a.status === 'SHIPPED' && a.trackingNumber) {
        await sendShippingNotification({
          to: updated.email, name: updated.name, orderNumber: updated.orderNumber,
          trackingNumber: a.trackingNumber, courier: a.courier || 'Poslaju',
        })
        emailSent = true
      }
      return { orderNumber: updated.orderNumber, previousStatus: o.status, status: updated.status, notes: updated.notes, shippingEmailSent: emailSent }
    },
  },

  // ---------- Customers ----------
  {
    name: 'list_customers',
    description: 'List customers with order count and total spent. Optional search on name or email.',
    inputSchema: {
      type: 'object',
      properties: { search: { type: 'string' }, limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
    },
    handler: async (a) => {
      const where: any = a.search
        ? { OR: [{ name: { contains: a.search, mode: 'insensitive' } }, { email: { contains: a.search, mode: 'insensitive' } }] }
        : {}
      const customers = await prisma.customer.findMany({
        where,
        include: { orders: { select: { total: true, paymentStatus: true, createdAt: true } } },
        orderBy: { createdAt: 'desc' },
        take: clampLimit(a.limit),
      })
      return customers.map((c) => {
        const paid = c.orders.filter((o) => o.paymentStatus === 'PAID')
        return {
          id: c.id, name: c.name, email: c.email, phone: c.phone, since: c.createdAt,
          orders: c.orders.length, totalSpent: Number(paid.reduce((s, o) => s + o.total, 0).toFixed(2)),
          lastOrderAt: c.orders.length ? c.orders.map((o) => o.createdAt).sort((x, y) => +y - +x)[0] : null,
        }
      })
    },
  },

  // ---------- Analytics ----------
  {
    name: 'sales_summary',
    description: 'Revenue summary for paid orders over the last N days (default 30): revenue, order count, average order value, units sold, top products, and orders waiting to ship.',
    inputSchema: {
      type: 'object',
      properties: { days: { type: 'integer', minimum: 1, maximum: 365, default: 30 } },
    },
    handler: async (a) => {
      const days = a.days || 30
      const since = new Date(Date.now() - days * 86400000)
      const orders = await prisma.order.findMany({
        where: { paymentStatus: 'PAID', createdAt: { gte: since } },
        include: { items: { include: { product: { select: { name: true } } } } },
      })
      const revenue = orders.reduce((s, o) => s + o.total, 0)
      const byProduct = new Map<string, { units: number; revenue: number }>()
      let units = 0
      for (const o of orders) for (const i of o.items) {
        units += i.quantity
        const cur = byProduct.get(i.product.name) || { units: 0, revenue: 0 }
        cur.units += i.quantity
        cur.revenue += i.price * i.quantity
        byProduct.set(i.product.name, cur)
      }
      const toShip = await prisma.order.count({ where: { paymentStatus: 'PAID', status: { in: ['PENDING', 'PROCESSING'] } } })
      return {
        periodDays: days, currency: 'MYR', paidOrders: orders.length,
        revenue: Number(revenue.toFixed(2)),
        averageOrderValue: orders.length ? Number((revenue / orders.length).toFixed(2)) : 0,
        unitsSold: units,
        topProducts: Array.from(byProduct.entries()).sort((x, y) => y[1].revenue - x[1].revenue).slice(0, 10)
          .map(([name, v]) => ({ name, units: v.units, revenue: Number(v.revenue.toFixed(2)) })),
        paidOrdersAwaitingShipment: toShip,
      }
    },
  },

  // ---------- Blog ----------
  {
    name: 'list_blog_posts',
    description: 'List blog posts (title, slug, published, dates). Content is omitted; use the slug on the site to read it.',
    inputSchema: { type: 'object', properties: { publishedOnly: { type: 'boolean', default: false } } },
    handler: async (a) =>
      prisma.blogPost.findMany({
        where: a.publishedOnly ? { published: true } : {},
        select: { id: true, title: true, slug: true, excerpt: true, tags: true, published: true, createdAt: true, updatedAt: true },
        orderBy: { createdAt: 'desc' },
      }),
  },
  {
    name: 'create_blog_post',
    description: 'Create a blog post. Saved as a draft unless published is true. content is HTML or Markdown as used by the site.',
    inputSchema: {
      type: 'object',
      required: ['title', 'content', 'excerpt'],
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        excerpt: { type: 'string' },
        image: { type: 'string', description: 'Image URL' },
        tags: { type: 'array', items: { type: 'string' } },
        published: { type: 'boolean', default: false },
      },
    },
    handler: async (a) => {
      let slug = slugify(a.title)
      if (await prisma.blogPost.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`
      const post = await prisma.blogPost.create({
        data: { title: a.title, slug, content: a.content, excerpt: a.excerpt, image: a.image || null, tags: a.tags || [], published: a.published ?? false },
      })
      return { id: post.id, slug: post.slug, published: post.published }
    },
  },

  // ---------- Settings ----------
  {
    name: 'get_store_settings',
    description: 'Read store settings (name, email, currency, shipping rates, announcement bar).',
    inputSchema: { type: 'object', properties: {} },
    handler: async () => prisma.siteSettings.findUnique({ where: { id: 'settings' } }),
  },
  {
    name: 'set_announcement',
    description: 'Set or clear the announcement bar text on the storefront. Pass an empty string to clear it.',
    inputSchema: { type: 'object', required: ['text'], properties: { text: { type: 'string' } } },
    handler: async (a) => {
      const announcement = a.text?.trim() ? a.text.trim() : null
      const s = await prisma.siteSettings.upsert({
        where: { id: 'settings' },
        update: { announcement },
        create: { id: 'settings', announcement },
      })
      return { announcement: s.announcement }
    },
  },
]
