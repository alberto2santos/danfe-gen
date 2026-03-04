/* ============================================================
   middleware.ts — Vercel Edge Middleware (Vite — sem Next.js)
   Arquivo deve ficar na RAIZ do projeto (não dentro de /src)
   ============================================================ */

const MASTER_KEY = process.env.DANFEGEN_API_KEY  ?? ''
const DEMO_KEY   = process.env.DANFEGEN_DEMO_KEY ?? 'demo-public-key-2024'
const RATE_LIMIT = 10
const WINDOW_MS  = 60_000

const rateMap = new Map<string, { count: number; ts: number }>()

export default function middleware(req: Request): Response | undefined {
  const url      = new URL(req.url)
  const pathname = url.pathname

  if (!pathname.startsWith('/api/')) return undefined

  const ip  = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
             ?? req.headers.get('x-real-ip')
             ?? 'unknown'
  const key = req.headers.get('x-danfegen-key') ?? ''

  const isDemo   = key === DEMO_KEY
  const isMaster = !!MASTER_KEY && key === MASTER_KEY

  if (!isDemo && !isMaster) {
    return new Response(
      JSON.stringify({
        error:   'Unauthorized',
        message: 'Header x-danfegen-key ausente ou inválido.',
        hint:    `Use a chave pública de demo: "${DEMO_KEY}" para testar.`,
      }),
      {
        status:  401,
        headers: {
          'Content-Type':                'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }

  const limit = isDemo ? 5 : RATE_LIMIT
  const now   = Date.now()
  const entry = rateMap.get(ip)

  if (entry) {
    if (now - entry.ts < WINDOW_MS) {
      if (entry.count >= limit) {
        const retryAfter = Math.ceil((WINDOW_MS - (now - entry.ts)) / 1000)
        return new Response(
          JSON.stringify({
            error:      'Too Many Requests',
            message:    `Limite de ${limit} requisições/minuto atingido.`,
            retryAfter,
          }),
          {
            status:  429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After':  String(retryAfter),
            },
          }
        )
      }
      entry.count++
    } else {
      rateMap.set(ip, { count: 1, ts: now })
    }
  } else {
    rateMap.set(ip, { count: 1, ts: now })
  }

  return undefined   // ← deixa passar para a Function
}

export const config = {
  matcher: '/api/:path*',
}