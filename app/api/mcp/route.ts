/**
 * Banjaran Store — MCP server (Streamable HTTP, stateless, JSON responses)
 *
 * Endpoint:  POST /api/mcp
 * Auth:      Authorization: Bearer <MCP_API_KEY>   (or ?key=<MCP_API_KEY> for clients that can't set headers)
 */
import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { tools } from '@/lib/mcp/tools'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SERVER_INFO = { name: 'banjaran-store', version: '1.0.0' }
const SUPPORTED_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05']
const LATEST = SUPPORTED_VERSIONS[0]

const toolMap = new Map(tools.map((t) => [t.name, t]))

function authorized(req: NextRequest) {
  const expected = process.env.MCP_API_KEY
  if (!expected || expected.length < 24) return false
  const header = req.headers.get('authorization') || ''
  const provided = header.toLowerCase().startsWith('bearer ')
    ? header.slice(7).trim()
    : new URL(req.url).searchParams.get('key') || ''
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

type JsonRpcRequest = { jsonrpc: '2.0'; id?: string | number | null; method: string; params?: any }

const rpcError = (id: any, code: number, message: string) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } })
const rpcResult = (id: any, result: unknown) => ({ jsonrpc: '2.0', id, result })

async function handle(msg: JsonRpcRequest) {
  const isNotification = msg.id === undefined || msg.id === null
  if (!msg || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') {
    return rpcError((msg as any)?.id, -32600, 'Invalid Request')
  }
  if (isNotification) return null // notifications/initialized, notifications/cancelled, etc.

  switch (msg.method) {
    case 'initialize': {
      const requested = msg.params?.protocolVersion
      return rpcResult(msg.id, {
        protocolVersion: SUPPORTED_VERSIONS.includes(requested) ? requested : LATEST,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions:
          'Admin tools for the Banjaran apparel store (prices in MYR). Read tools are safe. Write tools (update_product, set_stock, adjust_stock, update_order_status, create_blog_post, set_announcement) change the live store — confirm intent before using them.',
      })
    }
    case 'ping':
      return rpcResult(msg.id, {})
    case 'tools/list':
      return rpcResult(msg.id, {
        tools: tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
      })
    case 'tools/call': {
      const name = msg.params?.name
      const tool = toolMap.get(name)
      if (!tool) return rpcError(msg.id, -32602, `Unknown tool: ${name}`)
      try {
        const data = await tool.handler(msg.params?.arguments || {})
        return rpcResult(msg.id, { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] })
      } catch (e: any) {
        console.error(`[mcp] ${name} failed:`, e)
        const message = e?.code === 'P2025' ? 'Record not found' : e?.message || 'Tool failed'
        return rpcResult(msg.id, { content: [{ type: 'text', text: `Error: ${message}` }], isError: true })
      }
    }
    default:
      return rpcError(msg.id, -32601, `Method not found: ${msg.method}`)
  }
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json(rpcError(null, -32001, 'Unauthorized'), {
      status: 401,
      headers: { 'WWW-Authenticate': 'Bearer realm="banjaran-mcp"' },
    })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(rpcError(null, -32700, 'Parse error'), { status: 400 })
  }

  if (Array.isArray(body)) {
    const results = (await Promise.all(body.map(handle))).filter(Boolean)
    return results.length ? NextResponse.json(results) : new NextResponse(null, { status: 202 })
  }

  const result = await handle(body)
  return result ? NextResponse.json(result) : new NextResponse(null, { status: 202 })
}

// Stateless server: no SSE stream or sessions to resume/terminate.
export async function GET() {
  return new NextResponse('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } })
}
export async function DELETE() {
  return new NextResponse('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } })
}
