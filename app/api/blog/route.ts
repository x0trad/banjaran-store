import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const session = await getSession()
    const published = !session ? true : searchParams.get('published') !== 'false'

    const posts = await prisma.blogPost.findMany({
      where: session ? {} : { published: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(posts)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { title, content, excerpt, image, tags, published } = body

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: slugify(title),
        content,
        excerpt,
        image: image || null,
        tags: tags || [],
        published: published ?? false,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
