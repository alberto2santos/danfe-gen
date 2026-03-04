/* ============================================================
   accessKeyValidator.ts — Chave de acesso NF-e (44 dígitos)
   Validação por módulo 11 conforme manual SEFAZ
   ============================================================ */
export function isValidAccessKey(raw: string): boolean {
  const key = raw.replace(/\D/g, '')

  if (key.length !== 44) return false

  // ─── Pesos do módulo 11 (2 a 9, repetidos) ────────────────
  const weights: number[] = []
  let w = 2
  for (let i = 0; i < 43; i++) {
    weights.unshift(w)
    w = w === 9 ? 2 : w + 1
  }

  const sum    = weights.reduce((acc, weight, i) => acc + Number(key[i]) * weight, 0)
  const rem    = sum % 11
  const digit  = rem < 2 ? 0 : 11 - rem
  const last   = Number(key[43])

  return digit === last
}

/* ─── Extrai campos da chave de acesso ────────────────────────── */
export interface AccessKeyInfo {
  cUF:     string   // código da UF (2 dígitos)
  AAMM:    string   // ano/mês emissão
  CNPJ:    string   // CNPJ emitente (14 dígitos)
  mod:     string   // modelo (55 = NF-e, 65 = NFC-e)
  serie:   string
  nNF:     string
  tpEmis:  string
  cNF:     string
  cDV:     string   // dígito verificador
}

export function extractAccessKeyInfo(raw: string): AccessKeyInfo | null {
  const key = raw.replace(/\D/g, '')
  if (key.length !== 44) return null

  return {
    cUF:    key.slice(0,  2),
    AAMM:   key.slice(2,  6),
    CNPJ:   key.slice(6,  20),
    mod:    key.slice(20, 22),
    serie:  key.slice(22, 25),
    nNF:    key.slice(25, 34),
    tpEmis: key.slice(34, 35),
    cNF:    key.slice(35, 43),
    cDV:    key.slice(43, 44),
  }
}