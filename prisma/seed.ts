import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Banjaran database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('banjaran2024!', 12)
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@banjaran.my' },
    update: {},
    create: {
      email: 'admin@banjaran.my',
      password: hashedPassword,
      name: 'Banjaran Admin',
    },
  })
  console.log(`✅ Admin user: ${admin.email} / password: banjaran2024!`)

  // Create the 3 SKUs
  const products = [
    {
      name: 'Crocker Tee',
      slug: 'crocker-tee',
      description: 'Inspired by the Crocker Range in Sabah — Malaysia\'s most biodiverse mountain system and home to Mount Kinabalu. A tribute to Borneo\'s wild heart. Premium 100% cotton, heavyweight 220gsm, oversized fit.',
      price: 99,
      images: [],
      featured: true,
      published: true,
      variants: [
        { color: 'White', size: 'S', stock: 20, sku: 'CKR-WHT-S' },
        { color: 'White', size: 'M', stock: 30, sku: 'CKR-WHT-M' },
        { color: 'White', size: 'L', stock: 30, sku: 'CKR-WHT-L' },
        { color: 'White', size: 'XL', stock: 20, sku: 'CKR-WHT-XL' },
        { color: 'White', size: 'XXL', stock: 10, sku: 'CKR-WHT-XXL' },
        { color: 'Black', size: 'S', stock: 20, sku: 'CKR-BLK-S' },
        { color: 'Black', size: 'M', stock: 30, sku: 'CKR-BLK-M' },
        { color: 'Black', size: 'L', stock: 30, sku: 'CKR-BLK-L' },
        { color: 'Black', size: 'XL', stock: 20, sku: 'CKR-BLK-XL' },
        { color: 'Black', size: 'XXL', stock: 10, sku: 'CKR-BLK-XXL' },
      ],
    },
    {
      name: 'Carabiner Tee',
      slug: 'carabiner-tee',
      description: 'A nod to the climbing community. The carabiner — the connector of all things vertical. Wear it to the crag, the gym, or the streets. Premium 100% cotton, heavyweight 220gsm, oversized fit.',
      price: 99,
      images: [],
      featured: true,
      published: true,
      variants: [
        { color: 'White', size: 'S', stock: 15, sku: 'CAR-WHT-S' },
        { color: 'White', size: 'M', stock: 25, sku: 'CAR-WHT-M' },
        { color: 'White', size: 'L', stock: 25, sku: 'CAR-WHT-L' },
        { color: 'White', size: 'XL', stock: 15, sku: 'CAR-WHT-XL' },
        { color: 'White', size: 'XXL', stock: 8, sku: 'CAR-WHT-XXL' },
        { color: 'Black', size: 'S', stock: 15, sku: 'CAR-BLK-S' },
        { color: 'Black', size: 'M', stock: 25, sku: 'CAR-BLK-M' },
        { color: 'Black', size: 'L', stock: 25, sku: 'CAR-BLK-L' },
        { color: 'Black', size: 'XL', stock: 15, sku: 'CAR-BLK-XL' },
        { color: 'Black', size: 'XXL', stock: 8, sku: 'CAR-BLK-XXL' },
      ],
    },
    {
      name: 'Titiwangsa Tee',
      slug: 'titiwangsa-tee',
      description: 'The Titiwangsa Range — the backbone of Peninsular Malaysia. Running from Kelantan to Negeri Sembilan, this is the range every Malaysian hiker knows. Premium 100% cotton, heavyweight 220gsm, relaxed fit.',
      price: 99,
      images: [],
      featured: true,
      published: true,
      variants: [
        { color: 'White', size: 'S', stock: 20, sku: 'TTW-WHT-S' },
        { color: 'White', size: 'M', stock: 35, sku: 'TTW-WHT-M' },
        { color: 'White', size: 'L', stock: 35, sku: 'TTW-WHT-L' },
        { color: 'White', size: 'XL', stock: 20, sku: 'TTW-WHT-XL' },
        { color: 'White', size: 'XXL', stock: 10, sku: 'TTW-WHT-XXL' },
      ],
    },
  ]

  for (const p of products) {
    const { variants, ...productData } = p
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: productData,
      create: productData,
    })

    for (const v of variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: { stock: v.stock },
        create: { ...v, productId: product.id },
      })
    }
    console.log(`✅ Product: ${product.name}`)
  }

  // Site settings
  await prisma.siteSettings.upsert({
    where: { id: 'settings' },
    update: {},
    create: {
      id: 'settings',
      storeName: 'Banjaran',
      storeEmail: 'hello@banjaran.my',
      currency: 'MYR',
    },
  })

  console.log('\n🏔️  Banjaran database seeded successfully!')
  console.log('Admin login: admin@banjaran.my / banjaran2024!')
  console.log('⚠️  Change the admin password after first login!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
