/**
 * Run from the banjaran-store root:
 *   node scripts/upload-product-images.mjs
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IMG_DIR = join(__dirname, 'product-images')

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const API_KEY = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('Missing Cloudinary env vars. Run: source .env.local first, or use dotenv.')
  process.exit(1)
}

async function upload(filename, publicId) {
  const timestamp = Math.floor(Date.now() / 1000)
  const sigStr = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`
  const signature = crypto.createHash('sha1').update(sigStr).digest('hex')

  const bytes = readFileSync(join(IMG_DIR, filename))
  const blob = new Blob([bytes], { type: 'image/png' })
  const form = new FormData()
  form.append('file', blob, filename)
  form.append('public_id', publicId)
  form.append('timestamp', String(timestamp))
  form.append('api_key', API_KEY)
  form.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: form })
  const data = await res.json()
  if (!data.secure_url) throw new Error(JSON.stringify(data))
  return data.secure_url
}

const prisma = new PrismaClient()

console.log('⬆️  Uploading product images to Cloudinary...\n')

const crocker = []
for (const [file, pid] of [
  ['crocker-white-front.png', 'banjaran/crocker-white-front'],
  ['crocker-white-back.png',  'banjaran/crocker-white-back'],
  ['crocker-black-front.png', 'banjaran/crocker-black-front'],
  ['crocker-black-back.png',  'banjaran/crocker-black-back'],
]) {
  process.stdout.write(`  ${pid}... `)
  crocker.push(await upload(file, pid))
  console.log('✅')
}

const carabiner = []
for (const [file, pid] of [
  ['carabiner-white-front.png', 'banjaran/carabiner-white-front'],
  ['carabiner-white-back.png',  'banjaran/carabiner-white-back'],
  ['carabiner-black-front.png', 'banjaran/carabiner-black-front'],
  ['carabiner-black-back.png',  'banjaran/carabiner-black-back'],
]) {
  process.stdout.write(`  ${pid}... `)
  carabiner.push(await upload(file, pid))
  console.log('✅')
}

console.log('\n💾 Updating database...')
await prisma.product.update({ where: { slug: 'crocker-tee' },   data: { images: crocker } })
await prisma.product.update({ where: { slug: 'carabiner-tee' }, data: { images: carabiner } })
await prisma.$disconnect()

console.log('\n🏔️  Done! Crocker Tee and Carabiner Tee now have images.')
