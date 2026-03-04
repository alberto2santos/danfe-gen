import { z } from 'zod'

/* ─── Helpers ─────────────────────────────────────────────────── */
const strReq = z.string().min(1)
const strOpt = z.string().optional()

const numStr = z.union([z.string(), z.number()])
  .transform((v: string | number) => Number(v))
  .refine((v: number) => !isNaN(v), { message: 'Valor numérico inválido' })

const coerceStr = z.union([z.string(), z.number()])
  .transform((v: string | number) => String(v))

function coerceEnum<T extends string>(values: [T, ...T[]]) {
  return z.union([z.string(), z.number()])
    .transform((v: string | number) => String(v))
    .pipe(z.enum(values))
}

/* ─── Endereço ────────────────────────────────────────────────── */
const EnderecoSchema = z.object({
  xLgr:    strReq,
  nro:     coerceStr,
  xBairro: strReq,
  cMun:    coerceStr,
  xMun:    strReq,
  UF:      strReq,
  CEP:     coerceStr,
  fone:    coerceStr.optional(),
  xCpl:    strOpt,
})

/* ─── Emitente ────────────────────────────────────────────────── */
const EmitenteSchema = z.object({
  CNPJ:      coerceStr.optional(),
  CPF:       coerceStr.optional(),
  xNome:     strReq,
  xFant:     strOpt,
  enderEmit: EnderecoSchema,
  IE:        coerceStr.optional(),
  CRT:       coerceEnum(['1', '2', '3']),
})

/* ─── Destinatário ────────────────────────────────────────────── */
const DestinatarioSchema = z.object({
  CNPJ:      coerceStr.optional(),
  CPF:       coerceStr.optional(),
  xNome:     strReq,
  IE:        coerceStr.optional(),
  indIEDest: numStr.optional(),
  enderDest: EnderecoSchema,
  email:     strOpt,
}).refine(
  d => d.CNPJ ?? d.CPF,
  { message: 'Destinatário deve ter CNPJ ou CPF' }
)

/* ─── Imposto do produto ──────────────────────────────────────── */
const ImpostoSchema = z.object({
  ICMS:   z.record(z.string(), z.unknown()).optional(),
  IPI:    z.record(z.string(), z.unknown()).optional(),
  PIS:    z.record(z.string(), z.unknown()).optional(),
  COFINS: z.record(z.string(), z.unknown()).optional(),
}).optional()

/* ─── Produto / item ──────────────────────────────────────────── */
export const DetSchema = z.object({
  '@_nItem': numStr,
  prod: z.object({
    cProd:    coerceStr,
    cEAN:     coerceStr.optional(),
    xProd:    strReq,
    NCM:      coerceStr,
    CFOP:     coerceStr,
    uCom:     strReq,
    qCom:     numStr,
    vUnCom:   numStr,
    vProd:    numStr,
    xPed:     strOpt,
    nItemPed: strOpt,
  }),
  imposto: ImpostoSchema,
})

/* ─── Totais ──────────────────────────────────────────────────── */
const TotaisSchema = z.object({
  ICMSTot: z.object({
    vBC:      numStr,
    vICMS:    numStr,
    vIPI:     numStr.optional(),
    vPIS:     numStr,
    vCOFINS:  numStr,
    vProd:    numStr,
    vFrete:   numStr.optional(),
    vSeg:     numStr.optional(),
    vDesc:    numStr.optional(),
    vOutro:   numStr.optional(),
    vNF:      numStr,
    vTotTrib: numStr.optional(),
  }),
})

/* ─── Transporte ──────────────────────────────────────────────── */
const TransporteSchema = z.object({
  modFrete: coerceEnum(['0', '1', '2', '3', '4', '9']),
  transporta: z.object({
    CNPJ:   coerceStr.optional(),
    xNome:  strOpt,
    IE:     coerceStr.optional(),
    xEnder: strOpt,
    xMun:   strOpt,
    UF:     strOpt,
  }).optional(),
  veicTransp: z.object({
    placa: strOpt,
    UF:    strOpt,
  }).optional(),
  vol: z.array(z.object({
    qVol:  numStr.optional(),
    esp:   strOpt,
    marca: strOpt,
    pesoL: numStr.optional(),
    pesoB: numStr.optional(),
  })).optional(),
}).optional()

/* ─── Cobrança / duplicatas ───────────────────────────────────── */
const dupItemSchema = z.object({
  nDup:  coerceStr,
  dVenc: strReq,
  vDup:  numStr,
})

type DupItem = { nDup: string; dVenc: string; vDup: number }

const CobrancaSchema = z.object({
  fat: z.object({
    nFat:  coerceStr.optional(),
    vOrig: numStr.optional(),
    vDesc: numStr.optional(),
    vLiq:  numStr.optional(),
  }).optional(),
  dup: z.union([
    z.array(dupItemSchema),
    dupItemSchema.transform((d: DupItem) => [d]),
  ]).optional(),
}).optional()

/* ─── Identificação ───────────────────────────────────────────── */
const IdeSchema = z.object({
  natOp:    strReq,
  nNF:      coerceStr,
  serie:    coerceStr,
  dhEmi:    strReq,
  dhSaiEnt: strOpt,
  tpNF:     coerceEnum(['0', '1']),
  tpEmis:   coerceStr,
  tpAmb:    coerceEnum(['1', '2']),
  finNFe:   coerceEnum(['1', '2', '3', '4']),
  cMunFG:   coerceStr.optional(),
  chNFe:    strOpt,
})

/* ─── Schema raiz — infNFe ────────────────────────────────────── */
export const NFeSchema = z.object({
  ide: IdeSchema,
  emit: EmitenteSchema,
  dest: DestinatarioSchema,
  det: z.union([
    z.array(DetSchema),
    DetSchema.transform(d => [d]),
  ]).refine(
    (arr: unknown[]) => arr.length >= 1,
    { message: 'NF-e deve ter ao menos um produto' }
  ),
  total:   TotaisSchema,
  transp:  TransporteSchema,
  cobr:    CobrancaSchema,
  infAdic: z.object({
    infCpl:     strOpt,
    infAdFisco: strOpt,
  }).optional(),
})

/* ─── Tipo inferido ───────────────────────────────────────────── */
export type NFeRaw = z.infer<typeof NFeSchema>

/* ─── Função de validação ─────────────────────────────────────── */
export function validateNFe(
  raw: unknown
): { success: true } | { success: false; error: string } {

  const rawObj = raw as Record<string, unknown>

  console.group('[validateNFe] ── Iniciando validação ──')
  console.log('Campos raiz:', Object.keys(rawObj))

  const det = rawObj['det']
  console.log(
    'det → tipo:', typeof det,
    '| isArray:', Array.isArray(det),
    Array.isArray(det) ? `| length: ${(det as unknown[]).length}` : ''
  )

  const detItems: unknown[] = Array.isArray(det)
    ? (det as unknown[])
    : det !== undefined ? [det] : []

  detItems.forEach((item, i) => {
    const r = DetSchema.safeParse(item)
    if (r.success) {
      console.log(`  det[${i}] ✅ OK → nItem: ${r.data['@_nItem']}, xProd: ${r.data.prod.xProd}`)
    } else {
      console.error(`  det[${i}] ❌ FALHOU`)
      r.error.issues.forEach((issue: z.core.$ZodIssue) => {
        console.error(
          `    campo: ${issue.path.join('.')} | erro: ${issue.message} | recebido:`,
          issue.path.reduce((obj: unknown, key: PropertyKey) => {
            if (obj && typeof obj === 'object')
              return (obj as Record<string, unknown>)[String(key)]
            return undefined
          }, item)
        )
      })
      console.error(`  det[${i}] valor completo:`, JSON.stringify(item, null, 2))
    }
  })

  const sections = ['ide', 'emit', 'dest', 'total', 'transp', 'cobr'] as const
  sections.forEach(section => {
    const val = rawObj[section]
    if (val === undefined) console.warn(`  ${section} → ausente`)
    else                   console.log(`  ${section} → presente`)
  })

  const result = NFeSchema.safeParse(raw)
  console.groupEnd()

  if (result.success) return { success: true }

  console.error('[validateNFe] ❌ Todos os erros:')
  result.error.issues.forEach((issue: z.core.$ZodIssue, i: number) => {
    console.error(`  [${i}] path: ${issue.path.join('.')} | ${issue.message}`)
  })

  const messages = result.error.issues.map((issue: z.core.$ZodIssue) => {
    const path = issue.path.join('.')
    return path ? `${path}: ${issue.message}` : issue.message
  })

  return {
    success: false,
    error:   messages.slice(0, 5).join(' · '),
  }
}