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
  IM:        coerceStr.optional(),
  CNAE:      coerceStr.optional(),
  CRT:       coerceEnum(['1', '2', '3']),
})

/* ─── Destinatário ────────────────────────────────────────────── */
const DestinatarioSchema = z.object({
  CNPJ:      coerceStr.optional(),
  CPF:       coerceStr.optional(),
  idEstrang: coerceStr.optional(),
  xNome:     strReq,
  IE:        coerceStr.optional(),
  indIEDest: coerceStr.optional(),   // ← era numStr, mas SEFAZ envia string
  email:     strOpt,
  enderDest: EnderecoSchema,
}).refine(
  d => d.CNPJ ?? d.CPF ?? d.idEstrang,
  { message: 'Destinatário deve ter CNPJ, CPF ou idEstrang' }
)

/* ─── Imposto do produto ──────────────────────────────────────── */
const ImpostoSchema = z.object({
  ICMS:     z.record(z.string(), z.unknown()).optional(),
  IPI:      z.record(z.string(), z.unknown()).optional(),
  II:       z.record(z.string(), z.unknown()).optional(),
  PIS:      z.record(z.string(), z.unknown()).optional(),
  PISST:    z.record(z.string(), z.unknown()).optional(),
  COFINS:   z.record(z.string(), z.unknown()).optional(),
  COFINSST: z.record(z.string(), z.unknown()).optional(),

  // Reforma Tributária 2026 — presente no XML real
  IBSCBS:   z.record(z.string(), z.unknown()).optional(),

  // ICMS Interestadual / DIFAL
  ICMSUFDest: z.object({
    vBCUFDest:    numStr.optional(),
    vBCFCPUFDest: numStr.optional(),
    pFCPUFDest:   numStr.optional(),
    pICMSUFDest:  numStr.optional(),
    pICMSInter:   numStr.optional(),
    pICMSInterPart: numStr.optional(),
    vFCPUFDest:   numStr.optional(),
    vICMSUFDest:  numStr.optional(),
    vICMSUFRemet: numStr.optional(),
  }).optional(),
}).optional()

/* ─── Produto / item ──────────────────────────────────────────── */
export const DetSchema = z.object({
  '@_nItem': numStr,
  prod: z.object({
    cProd:      coerceStr,
    cEAN:       coerceStr.optional(),
    cBarra:     coerceStr.optional(),
    xProd:      strReq,
    NCM:        coerceStr,
    NVE:        coerceStr.optional(),
    CEST:       coerceStr.optional(),
    CFOP:       coerceStr,
    uCom:       strReq,
    qCom:       numStr,
    vUnCom:     numStr,
    vProd:      numStr,
    cEANTrib:   coerceStr.optional(),
    cBarraTrib: coerceStr.optional(),
    uTrib:      strOpt,
    qTrib:      numStr.optional(),
    vUnTrib:    numStr.optional(),
    vFrete:     numStr.optional(),
    vSeg:       numStr.optional(),
    vDesc:      numStr.optional(),
    vOutro:     numStr.optional(),
    indTot:     coerceStr.optional(),
    xPed:       strOpt,
    nItemPed:   strOpt,
    nFCI:       strOpt,
    infAdProd:  strOpt,
  }),
  imposto:    ImpostoSchema,
  infAdProd:  strOpt,
})

/* ─── Totais ──────────────────────────────────────────────────── */
const TotaisSchema = z.object({
  ICMSTot: z.object({
    vBC:            numStr,
    vICMS:          numStr,
    vICMSDeson:     numStr.optional(),
    vFCPUFDest:     numStr.optional(),
    vICMSUFDest:    numStr.optional(),
    vICMSUFRemet:   numStr.optional(),
    vFCP:           numStr.optional(),
    vBCST:          numStr.optional(),
    vST:            numStr.optional(),
    vFCPST:         numStr.optional(),
    vFCPSTRet:      numStr.optional(),
    vProd:          numStr,
    vFrete:         numStr.optional(),
    vSeg:           numStr.optional(),
    vDesc:          numStr.optional(),
    vII:            numStr.optional(),
    vIPI:           numStr.optional(),
    vIPIDevol:      numStr.optional(),
    vPIS:           numStr,
    vCOFINS:        numStr,
    vOutro:         numStr.optional(),
    vNF:            numStr,
    vTotTrib:       numStr.optional(),

    // campos mono/ICMS (NF-e 4.00 atualizado)
    qBCMono:        numStr.optional(),
    vICMSMono:      numStr.optional(),
    qBCMonoReten:   numStr.optional(),
    vICMSMonoReten: numStr.optional(),
    qBCMonoRet:     numStr.optional(),
    vICMSMonoRet:   numStr.optional(),
  }),

  // Reforma Tributária 2026
  IBSCBSTot: z.object({
    vBCIBSCBS: numStr.optional(),
    gIBS: z.record(z.string(), z.unknown()).optional(),
    gCBS: z.record(z.string(), z.unknown()).optional(),
  }).optional(),
})

/* ─── Transporte ──────────────────────────────────────────────── */
const TransporteSchema = z.object({
  modFrete: coerceEnum(['0', '1', '2', '3', '4', '9']),
  transporta: z.object({
    CNPJ:   coerceStr.optional(),
    CPF:    coerceStr.optional(),
    xNome:  strOpt,
    IE:     coerceStr.optional(),
    xEnder: strOpt,
    xMun:   strOpt,
    UF:     strOpt,
  }).optional(),
  retTransp: z.object({
    vServ:  numStr.optional(),
    vBCRet: numStr.optional(),
    pICMSRet: numStr.optional(),
    vICMSRet: numStr.optional(),
    CFOP:   coerceStr.optional(),
    cMunFG: coerceStr.optional(),
  }).optional(),
  veicTransp: z.object({
    placa: strOpt,
    UF:    strOpt,
    RNTC:  strOpt,
  }).optional(),
  reboque: z.union([
    z.array(z.object({
      placa: strOpt,
      UF:    strOpt,
      RNTC:  strOpt,
    })),
    z.object({
      placa: strOpt,
      UF:    strOpt,
      RNTC:  strOpt,
    }).transform(d => [d]),
  ]).optional(),
  vagao:    strOpt,
  balsa:    strOpt,
  vol: z.union([
    z.array(z.object({
      qVol:  numStr.optional(),
      esp:   strOpt,
      marca: strOpt,
      nVol:  coerceStr.optional(),
      pesoL: numStr.optional(),
      pesoB: numStr.optional(),
    })),
    z.object({
      qVol:  numStr.optional(),
      esp:   strOpt,
      marca: strOpt,
      nVol:  coerceStr.optional(),
      pesoL: numStr.optional(),
      pesoB: numStr.optional(),
    }).transform(d => [d]),
  ]).optional(),
}).optional()

/* ─── Cobrança / duplicatas ───────────────────────────────────── */
const dupItemSchema = z.object({
  nDup:  coerceStr,
  dVenc: strReq,
  vDup:  numStr,
})

type DupItem = z.infer<typeof dupItemSchema>

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

/* ─── Pagamento ────────────────────────────────────────── */
const detPagItemSchema = z.object({
  indPag: coerceStr.optional(),       // 0=à vista  1=a prazo
  tPag:   coerceStr,                  // 01=dinheiro 02=cheque 03=cartão...
  vPag:   numStr,
  dPag:   strOpt,
  CNPJPag: coerceStr.optional(),
  UFPag:   strOpt,
  card: z.object({
    tpIntegra: coerceStr.optional(),
    CNPJ:      coerceStr.optional(),
    tBand:     coerceStr.optional(),
    cAut:      strOpt,
    tpTransa:  coerceStr.optional(),
    vTroco:    numStr.optional(),
  }).optional(),
})

type DetPagItem = z.infer<typeof detPagItemSchema>

const PagamentoSchema = z.object({
  detPag: z.union([
    z.array(detPagItemSchema),
    detPagItemSchema.transform((d: DetPagItem) => [d]),
  ]),
  vTroco: numStr.optional(),
}).optional()

/* ─── Protocolo de autorização SEFAZ ──────────────────── */
export const ProtNFeSchema = z.object({
  '@_versao': strOpt,
  infProt: z.object({
    tpAmb:    coerceEnum(['1', '2']),
    verAplic: strOpt,
    chNFe:    strReq,
    dhRecbto: strReq,
    nProt:    coerceStr.optional(),
    digVal:   strOpt,
    cStat:    coerceStr,             // 100 = autorizada
    xMotivo:  strReq,
  }),
}).optional()

/* ─── Responsável Técnico ─────────────────────────────────────── */
const InfRespTecSchema = z.object({
  CNPJ:     coerceStr,
  xContato: strReq,
  email:    strOpt,
  fone:     coerceStr.optional(),
  idCSRT:   coerceStr.optional(),
  hashCSRT: strOpt,
}).optional()

/* ─── Autorização de download ─────────────────────────────────── */
const AutXMLSchema = z.union([
  z.object({ CNPJ: coerceStr.optional(), CPF: coerceStr.optional() }),
  z.array(z.object({ CNPJ: coerceStr.optional(), CPF: coerceStr.optional() })),
]).optional()

/* ─── Identificação ───────────────────────────────────────────── */
const IdeSchema = z.object({
  cUF:       coerceStr.optional(),
  cNF:       coerceStr.optional(),
  natOp:     strReq,
  mod:       coerceStr.optional(),   // 55=NF-e  65=NFC-e
  nNF:       coerceStr,
  serie:     coerceStr,
  dhEmi:     strReq,
  dhSaiEnt:  strOpt,
  tpNF:      coerceEnum(['0', '1']),
  idDest:    coerceStr.optional(),   // 1=interna 2=interestadual 3=exterior
  cMunFG:    coerceStr.optional(),
  tpImp:     coerceStr.optional(),   // 1=A4 portrait 2=A4 landscape 4=DANFE NFC-e
  tpEmis:    coerceStr,
  cDV:       coerceStr.optional(),
  tpAmb:     coerceEnum(['1', '2']),
  finNFe:    coerceEnum(['1', '2', '3', '4']),
  indFinal:  coerceStr.optional(),   // 0=normal 1=consumidor final
  indPres:   coerceStr.optional(),   // 0=não presencial 1=presencial...
  indIntermed: coerceStr.optional(), // 0=sem intermediador 1=com intermediador
  procEmi:   coerceStr.optional(),
  verProc:   strOpt,
  chNFe:     strOpt,
  dhCont:    strOpt,
  xJust:     strOpt,
})

/* ─── Schema raiz — infNFe ────────────────────────────────────── */
export const NFeSchema = z.object({
  ide:    IdeSchema,
  emit:   EmitenteSchema,
  avulsa: z.unknown().optional(),
  dest:   DestinatarioSchema,
  autXML: AutXMLSchema,
  det: z.union([
    z.array(DetSchema),
    DetSchema.transform(d => [d]),
  ]).refine(
    (arr: unknown[]) => arr.length >= 1,
    { message: 'NF-e deve ter ao menos um produto' }
  ),
  total:      TotaisSchema,
  transp:     TransporteSchema,
  cobr:       CobrancaSchema,
  pag:        PagamentoSchema,
  infIntermed: z.object({
    CNPJ:     coerceStr.optional(),
    idCadIntTran: strOpt,
  }).optional(),
  infAdic: z.object({
    infAdFisco: strOpt,
    infCpl:     strOpt,
  }).optional(),
  exporta: z.object({
    UFSaidaPais: strOpt,
    xLocExporta: strOpt,
    xLocDespacho: strOpt,
  }).optional(),
  compra: z.object({
    xNEmp:  strOpt,
    xPed:   strOpt,
    xCont:  strOpt,
  }).optional(),
  cana:        z.unknown().optional(),
  infRespTec:  InfRespTecSchema,
  infSolicNFF: z.unknown().optional(),
})

/* ─── Schema do nfeProc completo (raiz do XML) ─────────── */
export const NfeProcSchema = z.object({
  NFe: z.object({
    infNFe: NFeSchema,
  }),
  protNFe: ProtNFeSchema,
})

/* ─── Tipos inferidos ─────────────────────────────────────────── */
export type NFeRaw    = z.infer<typeof NFeSchema>
export type NfeProcRaw = z.infer<typeof NfeProcSchema>
export type ProtNFe   = z.infer<typeof ProtNFeSchema>
export type DetItem   = z.infer<typeof DetSchema>

/* ─── Função de validação ─────────────────────────────────────── */
export function validateNFe(
  raw: unknown
): { success: true } | { success: false; error: string } {

  const rawObj = raw as Record<string, unknown>

  console.group('[validateNFe] ── Iniciando validação ──')
  console.log('Campos raiz:', Object.keys(rawObj))

  // ─── Debug det ────────────────────────────────────────────────
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

  // ─── Debug seções principais ───────────────────────────────────
  const sections = ['ide', 'emit', 'dest', 'total', 'transp', 'cobr', 'pag', 'infRespTec'] as const
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