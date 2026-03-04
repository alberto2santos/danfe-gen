/* ============================================================
   formatters.ts — Máscaras, moeda, datas e utilitários fiscais
   ============================================================ */

/* ─── Documentos ──────────────────────────────────────────────── */
export function formatCNPJ(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 14)
  if (d.length !== 14) return raw
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function formatCPF(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length !== 11) return raw
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatCEP(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8)
  if (d.length !== 8) return raw
  return d.replace(/(\d{5})(\d{3})/, '$1-$2')
}

export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '')
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  return raw
}

/* ─── Moeda e números ─────────────────────────────────────────── */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style:                 'currency',
    currency:              'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatQuantity(value: number): string {
  // Até 4 casas decimais — remove zeros à direita
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value)
  return formatted
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + '%'
}

/* ─── Datas ───────────────────────────────────────────────────── */
export function formatDate(iso: string): string {
  try {
    const date = new Date(iso)
    if (isNaN(date.getTime())) return iso
    return new Intl.DateTimeFormat('pt-BR', {
      day:   '2-digit',
      month: '2-digit',
      year:  'numeric',
    }).format(date)
  } catch {
    return iso
  }
}

export function formatDateTime(iso: string): string {
  try {
    const date = new Date(iso)
    if (isNaN(date.getTime())) return iso
    return new Intl.DateTimeFormat('pt-BR', {
      day:    '2-digit',
      month:  '2-digit',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return iso
  }
}

/* ─── Chave de acesso ─────────────────────────────────────────── */
export function formatAccessKey(key: string): string {
  const d = key.replace(/\D/g, '')
  if (d.length !== 44) return key
  // Grupos de 4 dígitos: 0000 0000 0000 ... (11 grupos)
  return d.match(/.{1,4}/g)?.join(' ') ?? key
}

/* ─── Modal de frete ──────────────────────────────────────────── */
const MODAL_FRETE: Record<string, string> = {
  '0': 'Por conta do emitente',
  '1': 'Por conta do destinatário',
  '2': 'Por conta de terceiros',
  '3': 'Próprio por conta do remetente',
  '4': 'Próprio por conta do destinatário',
  '9': 'Sem frete',
}

export function formatModalFrete(code: string): string {
  return MODAL_FRETE[code] ?? code
}

/* ─── CRT ─────────────────────────────────────────────────────── */
const CRT_LABELS: Record<string, string> = {
  '1': 'Simples Nacional',
  '2': 'Simples Nacional — Excesso',
  '3': 'Regime Normal',
}

export function formatCRT(code: string): string {
  return CRT_LABELS[code] ?? code
}

/* ─── Tipo de NF-e ────────────────────────────────────────────── */
export function formatTipoNFe(tpNF: '0' | '1'): string {
  return tpNF === '0' ? 'Entrada' : 'Saída'
}

/* ─── Finalidade da NF-e ──────────────────────────────────────── */
const FINALIDADE: Record<string, string> = {
  '1': 'Normal',
  '2': 'Complementar',
  '3': 'Ajuste',
  '4': 'Devolução',
}

export function formatFinalidade(code: string): string {
  return FINALIDADE[code] ?? code
}

/* ─── Ambiente ────────────────────────────────────────────────── */
export function formatAmbiente(tpAmb: '1' | '2'): string {
  return tpAmb === '1' ? 'Produção' : 'Homologação'
}

/* ─── Truncate seguro ─────────────────────────────────────────── */
export function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max - 1) + '…'
}