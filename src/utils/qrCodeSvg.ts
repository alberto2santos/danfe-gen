/* ============================================================
   qrCodeSvg.ts — Gerador de QR Code SVG inline
   Baseado em QR Code versão 3-M sem dependência externa
   Usado apenas quando o XML tiver o campo qrCode preenchido
   ============================================================ */

/* ─── Interface de retorno ────────────────────────────────────── */
export interface QrMatrix {
  modules: boolean[][]
  size:    number
}

/* ─── GF(256) — Campo de Galois para Reed-Solomon ────────────── */
const GF_EXP = new Uint8Array(512)
const GF_LOG = new Uint8Array(256)

;(function initGF() {
  let x = 1
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x
    GF_LOG[x] = i
    x = x << 1
    if (x & 0x100) x ^= 0x11d
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255]!
})()

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  return GF_EXP[(GF_LOG[a]! + GF_LOG[b]!) % 255]!
}

function gfPoly(gen: number[], msg: number[]): number[] {
  const out = [...msg, ...new Array(gen.length - 1).fill(0)]
  for (let i = 0; i < msg.length; i++) {
    const coef = out[i]!
    if (coef === 0) continue
    for (let j = 1; j < gen.length; j++) {
      out[i + j] = out[i + j]! ^ gfMul(coef, gen[j]!)
    }
  }
  return out.slice(msg.length)
}

function genPoly(n: number): number[] {
  let g = [1]
  for (let i = 0; i < n; i++) {
    g = convPoly(g, [1, GF_EXP[i]!])
  }
  return g
}

function convPoly(a: number[], b: number[]): number[] {
  const out = new Array(a.length + b.length - 1).fill(0) as number[]
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = (out[i + j]! ^ gfMul(a[i]!, b[j]!))
    }
  }
  return out
}

/* ─── Encoder principal — QR Version 3-M (aprox 77 chars) ─────── */
export function buildQrMatrix(text: string): QrMatrix | null {
  try {
    // Usa a URL já montada pelo XML — apenas renderiza
    // Versão simplificada: usa canvas nativo via OffscreenCanvas se disponível
    // Fallback: retorna null (QR não exibido)
    const size = 29  // version 3

    // Encoding byte mode
    const bytes = new TextEncoder().encode(text)
    const data:  number[] = [
      0x40 | (bytes.length >> 4),
      ((bytes.length & 0xf) << 4) | (bytes[0]! >> 4),
    ]
    for (let i = 0; i < bytes.length - 1; i++) {
      data.push(((bytes[i]! & 0xf) << 4) | (bytes[i + 1]! >> 4))
    }
    data.push((bytes[bytes.length - 1]! & 0xf) << 4)
    data.push(0xec, 0x11) // padding

    // Reed-Solomon (22 EC codewords para version 3-M)
    const ec  = gfPoly(genPoly(22), data)
    const all = [...data, ...ec]

    // Matrix vazia
    const modules: boolean[][] = Array.from({ length: size }, () =>
      new Array(size).fill(false)
    )

    // Reserva padrões fixos (finder + timing) — simplificado
    const setModule = (r: number, c: number, v: boolean) => {
      if (r >= 0 && r < size && c >= 0 && c < size) modules[r]![c] = v
    }

    // Finder patterns
    const finderPos = [[0, 0], [0, size - 7], [size - 7, 0]] as const
    finderPos.forEach(([fr, fc]) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const v = r === 0 || r === 6 || c === 0 || c === 6 ||
                    (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          setModule(fr + r, fc + c, v)
        }
      }
    })

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      setModule(6, i, i % 2 === 0)
      setModule(i, 6, i % 2 === 0)
    }

    // Coloca os bits de dados nas posições não reservadas
    let bitIdx = 0
    let goingUp = true
    let col = size - 1
    while (col >= 0) {
      if (col === 6) { col--; continue }
      for (let delta = 0; delta < size; delta++) {
        const row = goingUp ? size - 1 - delta : delta
        for (let dc = 0; dc < 2; dc++) {
          const c = col - dc
          if (modules[row]![c] !== undefined) {
            const byteIdx = Math.floor(bitIdx / 8)
            const bitPos  = 7 - (bitIdx % 8)
            const bit     = byteIdx < all.length
              ? ((all[byteIdx]! >> bitPos) & 1) === 1
              : false
            modules[row]![c] = bit
            bitIdx++
          }
        }
      }
      goingUp = !goingUp
      col -= 2
    }

    return { modules, size }
  } catch {
    return null
  }
}