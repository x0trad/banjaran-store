import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret || cloudName === 'your-cloud-name') {
      return NextResponse.json(
        { error: 'Cloudinary not configured. Add CLOUDINARY credentials to .env.local' },
        { status: 500 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPG, PNG, or WebP.' }, { status: 400 })
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 })
    }

    // Build signed upload using Cloudinary REST API
    const timestamp = Math.round(Date.now() / 1000)
    const folder = 'banjaran'

    // Create signature
    const crypto = await import('crypto')
    const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
    const signature = crypto.createHash('sha1').update(toSign).digest('hex')

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const uploadFormData = new FormData()
    uploadFormData.append('file', new Blob([buffer], { type: file.type }), file.name)
    uploadFormData.append('api_key', apiKey)
    uploadFormData.append('timestamp', String(timestamp))
    uploadFormData.append('signature', signature)
    uploadFormData.append('folder', folder)
    uploadFormData.append('transformation', 'q_auto,f_auto,w_1200')

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: uploadFormData }
    )

    const uploadData = await uploadRes.json()

    if (!uploadRes.ok) {
      return NextResponse.json(
        { error: uploadData.error?.message || 'Upload failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: uploadData.secure_url,
      publicId: uploadData.public_id,
      width: uploadData.width,
      height: uploadData.height,
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
