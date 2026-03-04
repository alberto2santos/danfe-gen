/* ============================================================
   code128.ts — Encoder CODE-128C para a chave de acesso NF-e
   Padrão obrigatório SEFAZ (Anexo III — Manual DANFE)
   Gera array de barras {width, black} para renderizar em SVG
   ============================================================ */

/* ─── Tabelas CODE-128 ────────────────────────────────────────── */
// Cada símbolo = 6 elementos (3 barras + 3 espaços), largura 1-4
const CODE128_TABLE: number[][] = [
  [2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,2,3],
  [1,2,1,3,2,2],[1,3,1,2,2,2],[1,2,2,2,1,3],[1,2,2,3,1,2],
  [1,3,2,2,1,2],[2,2,1,2,1,3],[2,2,1,3,1,2],[2,3,1,2,1,2],
  [1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,2,3,1],[1,1,3,2,2,2],
  [1,2,3,1,2,2],[1,2,3,2,2,1],[2,2,3,2,1,1],[2,2,1,1,3,2],
  [2,2,1,2,3,1],[2,1,3,2,1,2],[2,2,3,1,1,2],[3,1,2,1,3,1],
  [3,1,1,2,2,2],[3,2,1,1,2,2],[3,2,1,2,2,1],[3,1,2,2,1,2],
  [3,2,2,1,1,2],[3,2,2,2,1,1],[2,1,2,1,2,3],[2,1,2,3,2,1],
  [2,3,2,1,2,1],[1,1,1,3,2,3],[1,3,1,1,2,3],[1,3,1,3,2,1],
  [1,1,2,3,1,3],[1,3,2,1,1,3],[1,3,2,3,1,1],[2,1,1,3,1,3],
  [2,3,1,1,1,3],[2,3,1,3,1,1],[1,1,2,1,3,3],[1,1,2,3,3,1],
  [1,3,2,1,3,1],[1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],
  [3,1,3,1,2,1],[2,1,1,3,3,1],[2,3,1,1,3,1],[2,1,3,1,1,3],
  [2,1,3,3,1,1],[2,1,3,1,3,1],[3,1,1,1,2,3],[3,1,1,3,2,1],
  [3,3,1,1,2,1],[3,1,2,1,1,3],[3,1,2,3,1,1],[3,3,2,1,1,1],
  [3,1,4,1,1,1],[2,2,1,4,1,1],[4,3,1,1,1,1],[1,1,1,2,2,4],
  [1,1,1,4,2,2],[1,2,1,1,2,4],[1,2,1,4,2,1],[1,4,1,1,2,2],
  [1,4,1,2,2,1],[1,1,2,2,1,4],[1,1,2,4,1,2],[1,2,2,1,1,4],
  [1,2,2,4,1,1],[1,4,2,1,1,2],[1,4,2,2,1,1],[2,4,1,2,1,1],
  [2,2,1,1,1,4],[4,1,3,1,1,1],[2,4,1,1,1,2],[1,3,4,1,1,1],
  [1,1,1,2,4,2],[1,2,1,1,4,2],[1,2,1,2,4,1],[1,1,4,2,1,2],
  [1,2,4,1,1,2],[1,2,4,2,1,1],[4,1,1,2,1,2],[4,2,1,1,1,2],
  [4,2,1,2,1,1],[2,1,2,1,4,1],[2,1,4,1,2,1],[4,1,2,1,2,1],
  [1,1,1,1,4,3],[1,1,1,3,4,1],[1,3,1,1,4,1],[1,1,4,1,1,3],
  [1,1,4,3,1,1],[4,1,1,1,1,3],[4,1,1,3,1,1],[1,1,3,1,4,1],
  [1,1,4,1,3,1],[3,1,1,1,4,1],[4,1,1,1,3,1],[2,1,1,4,1,2],
  [2,1,1,2,1,4],[2,1,1,2,3,2],
]

// Símbolos especiais
const START_C   = 105  // Start Code C
const STOP      = [2,3,3,1,1,1,2]
const QUIET_W   = 10   // largura da quiet zone em unidades

/* ─── Tipo de barra ───────────────────────────────────────────── */
export interface Bar { width: number; black: boolean }

/* ─── Encoder principal ───────────────────────────────────────── */
export function encodeCode128C(digits: string): Bar[] {
  // CODE-128C: encode pares de dígitos (só números pares de dígitos)
  const clean = digits.replace(/\D/g, '')
  if (clean.length % 2 !== 0 || clean.length === 0) return []

  const values: number[] = []

  // Start C
  values.push(START_C)

  // Dados — pares de dígitos
  for (let i = 0; i < clean.length; i += 2) {
    values.push(parseInt(clean.slice(i, i + 2), 10))
  }

  // Check character (soma dos valores * posição, mod 103)
  let checksum = START_C
  for (let i = 1; i < values.length; i++) {
    checksum += values[i]! * i
  }
  values.push(checksum % 103)

  // Converte para barras
  const bars: Bar[] = []

  // Quiet zone esquerda
  bars.push({ width: QUIET_W, black: false })

  for (const val of values) {
    const pattern = CODE128_TABLE[val]!
    pattern.forEach((w, i) => {
      bars.push({ width: w, black: i % 2 === 0 })
    })
  }

  // Stop
  STOP.forEach((w, i) => {
    bars.push({ width: w, black: i % 2 === 0 })
  })

  // Quiet zone direita
  bars.push({ width: QUIET_W, black: false })

  return bars
}

/* ─── Calcula largura total do SVG ────────────────────────────── */
export function calcBarcodeWidth(bars: Bar[]): number {
  return bars.reduce((acc, b) => acc + b.width, 0)
}