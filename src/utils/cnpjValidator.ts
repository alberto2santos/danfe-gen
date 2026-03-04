/* ============================================================
   cnpjValidator.ts — Validação de CNPJ por checksum (módulo 11)
   ============================================================ */
export function isValidCNPJ(raw: string): boolean {
  const cnpj = raw.replace(/\D/g, '')

  if (cnpj.length !== 14)                    return false
  if (/^(\d)\1{13}$/.test(cnpj))             return false   // sequência igual

  // ─── Primeiro dígito verificador ──────────────────────────
  const calc1 = [5,4,3,2,9,8,7,6,5,4,3,2]
  const sum1  = calc1.reduce((acc, w, i) => acc + Number(cnpj[i]) * w, 0)
  const rem1  = sum1 % 11
  const d1    = rem1 < 2 ? 0 : 11 - rem1
  if (d1 !== Number(cnpj[12])) return false

  // ─── Segundo dígito verificador ───────────────────────────
  const calc2 = [6,5,4,3,2,9,8,7,6,5,4,3,2]
  const sum2  = calc2.reduce((acc, w, i) => acc + Number(cnpj[i]) * w, 0)
  const rem2  = sum2 % 11
  const d2    = rem2 < 2 ? 0 : 11 - rem2
  if (d2 !== Number(cnpj[13])) return false

  return true
}