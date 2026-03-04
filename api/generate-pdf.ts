/* ============================================================
   api/generate-pdf.ts — Vercel Function
   Single NF-e  → retorna PDF binário (application/pdf)
   Lote (≤ 5)  → retorna ZIP com todos os PDFs (application/zip)
   Hobby plan  → maxDuration: 60s, payload máx 4.5 MB
   PDF gerado via @react-pdf/renderer (zero Chromium/Puppeteer)
   ============================================================ */
import type { VercelRequest, VercelResponse }   from '@vercel/node'
import { renderToBuffer }                        from '@react-pdf/renderer'
import type { DocumentProps }                    from '@react-pdf/renderer'
import React                                     from 'react'
import JSZip                                     from 'jszip'
import { DanfeA4 }                               from '../src/components/Danfe/DanfeA4'
import type { NFeDados }                         from '../src/types/nfe.types'
import type { CompanyConfig }                    from '../src/types/company.types'
import { DEFAULT_COMPANY_CONFIG }                from '../src/types/company.types'

/* ─── Configuração da Function ────────────────────────────────── */
export const config = {
  maxDuration: 60,
}

/* ─── CORS headers ────────────────────────────────────────────── */
const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin':  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-danfegen-key',
}

/* ─── Helper: aplica headers no VercelResponse ────────────────── */
// VercelResponse estende http.ServerResponse — não tem .set() do Express
function applyHeaders(res: VercelResponse, headers: Record<string, string>) {
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value))
}

/* ─── Tipos ───────────────────────────────────────────────────── */
interface GenerateSingleRequest {
  mode:    'single'
  nfeData: NFeDados
  config?: Partial<CompanyConfig>
  format?: 'a4'
}

interface GenerateBatchRequest {
  mode:  'batch'
  items: Array<{
    nfeData: NFeDados
    config?: Partial<CompanyConfig>
  }>
}

type GenerateRequest = GenerateSingleRequest | GenerateBatchRequest

/* ─── Constantes ──────────────────────────────────────────────── */
const MAX_BATCH     = 5
const MAX_PDF_BYTES = 400_000
const MAX_ZIP_BYTES = 4_000_000

/* ─── Gera um único PDF em buffer ─────────────────────────────── */
async function generatePdfBuffer(
  nfe:    NFeDados,
  cfg:    CompanyConfig,
): Promise<Buffer> {
  // ✅ React.createElement + cast para DocumentProps
  // renderToBuffer exige ReactElement<DocumentProps> do @react-pdf/renderer
  const element = React.createElement(DanfeA4, { nfe, config: cfg }) as React.ReactElement<DocumentProps>
  const buffer  = await renderToBuffer(element)
  return Buffer.from(buffer)
}

/* ─── Nome do arquivo PDF ─────────────────────────────────────── */
function pdfFilename(nfe: NFeDados): string {
  const num  = String(nfe.nNF).padStart(9, '0')
  const cnpj = (nfe.emitente.CNPJ ?? '').replace(/\D/g, '')
  return `DANFE-${cnpj}-NF${num}-S${nfe.serie}.pdf`
}

/* ─── Handler principal ───────────────────────────────────────── */
export default async function handler(req: VercelRequest, res: VercelResponse) {

  // ─── CORS preflight ───────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    applyHeaders(res, CORS)
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    applyHeaders(res, { ...CORS, 'Content-Type': 'application/json' })
    res.status(405).json({ error: 'Método não permitido. Use POST.' })
    return
  }

  const start = Date.now()

  try {
    const body = req.body as GenerateRequest

    if (!body?.mode) {
      applyHeaders(res, { ...CORS, 'Content-Type': 'application/json' })
      res.status(400).json({
        error:   'Bad Request',
        message: 'Campo "mode" obrigatório: "single" ou "batch".',
      })
      return
    }

    /* ════ MODO SINGLE ════════════════════════════════════════ */
    if (body.mode === 'single') {
      const { nfeData, config: cfgOverride } = body

      if (!nfeData) {
        applyHeaders(res, { ...CORS, 'Content-Type': 'application/json' })
        res.status(400).json({
          error:   'Bad Request',
          message: 'Campo "nfeData" obrigatório para mode="single".',
        })
        return
      }

      const companyConfig: CompanyConfig = {
        ...DEFAULT_COMPANY_CONFIG,
        ...cfgOverride,
        version: 1,
      }

      const pdfBuffer = await generatePdfBuffer(nfeData, companyConfig)
      const elapsed   = Date.now() - start
      const filename  = pdfFilename(nfeData)

      console.log(`[generate-pdf] single OK — ${filename} — ${pdfBuffer.length} bytes — ${elapsed}ms`)

      applyHeaders(res, {
        ...CORS,
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length':      String(pdfBuffer.length),
        'X-Generate-Time-Ms':  String(elapsed),
      })
      res.status(200).send(pdfBuffer)
      return
    }

    /* ════ MODO BATCH ═════════════════════════════════════════ */
    if (body.mode === 'batch') {
      const { items } = body

      if (!Array.isArray(items) || items.length === 0) {
        applyHeaders(res, { ...CORS, 'Content-Type': 'application/json' })
        res.status(400).json({
          error:   'Bad Request',
          message: 'Campo "items" deve ser array não vazio.',
        })
        return
      }

      if (items.length > MAX_BATCH) {
        applyHeaders(res, { ...CORS, 'Content-Type': 'application/json' })
        res.status(400).json({
          error:    'Batch Too Large',
          message:  `Máximo ${MAX_BATCH} NF-es por request no plano atual.`,
          hint:     'Divida o lote e faça múltiplas requisições.',
          maxBatch: MAX_BATCH,
          received: items.length,
        })
        return
      }

      const estimatedZipSize = items.length * MAX_PDF_BYTES
      if (estimatedZipSize > MAX_ZIP_BYTES) {
        applyHeaders(res, { ...CORS, 'Content-Type': 'application/json' })
        res.status(400).json({
          error:   'Estimated Payload Too Large',
          message: `Lote de ${items.length} NF-es pode exceder 4 MB.`,
          hint:    'Reduza o lote para evitar o limite de 4.5 MB da Function.',
        })
        return
      }

      const zip = new JSZip()

      const results = await Promise.allSettled(
        items.map(async (item, i) => {
          const companyConfig: CompanyConfig = {
            ...DEFAULT_COMPANY_CONFIG,
            ...item.config,
            version: 1,
          }

          const pdfBuffer = await generatePdfBuffer(item.nfeData, companyConfig)
          const filename  = pdfFilename(item.nfeData)

          zip.file(filename, pdfBuffer)

          return { index: i, filename, bytes: pdfBuffer.length }
        })
      )

      const succeeded = results
        .filter(r => r.status === 'fulfilled')
        .map(r => (r as PromiseFulfilledResult<{ index: number; filename: string; bytes: number }>).value)

      const failed = results
        .filter(r => r.status === 'rejected')
        .map((r, i) => ({
          index:  i,
          reason: (r as PromiseRejectedResult).reason?.message ?? 'Erro desconhecido',
        }))

      if (succeeded.length === 0) {
        applyHeaders(res, { ...CORS, 'Content-Type': 'application/json' })
        res.status(500).json({
          error:   'All PDFs Failed',
          message: 'Nenhum PDF foi gerado com sucesso.',
          failed,
        })
        return
      }

      const zipBuffer = await zip.generateAsync({
        type:               'nodebuffer',
        compression:        'DEFLATE',
        compressionOptions: { level: 6 },
      })

      if (zipBuffer.length > 4_500_000) {
        applyHeaders(res, { ...CORS, 'Content-Type': 'application/json' })
        res.status(413).json({
          error:   'ZIP Too Large',
          message: `ZIP gerado (${(zipBuffer.length / 1024).toFixed(0)} KB) excede 4.5 MB.`,
          hint:    'Reduza o lote ou gere individualmente.',
        })
        return
      }

      const elapsed = Date.now() - start
      const zipName = `DANFE-lote-${new Date().toISOString().slice(0, 10)}.zip`

      console.log(`[generate-pdf] batch OK — ${succeeded.length}/${items.length} PDFs — ${zipBuffer.length} bytes — ${elapsed}ms`)

      applyHeaders(res, {
        ...CORS,
        'Content-Type':        'application/zip',
        'Content-Disposition': `attachment; filename="${zipName}"`,
        'Content-Length':      String(zipBuffer.length),
        'X-Generate-Time-Ms':  String(elapsed),
        'X-PDFs-Generated':    String(succeeded.length),
        'X-PDFs-Failed':       String(failed.length),
      })
      res.status(200).send(zipBuffer)
      return
    }

    applyHeaders(res, { ...CORS, 'Content-Type': 'application/json' })
    res.status(400).json({
      error:   'Bad Request',
      message: 'Campo "mode" deve ser "single" ou "batch".',
    })

  } catch (err) {
    const elapsed = Date.now() - start
    console.error(`[generate-pdf] Erro interno após ${elapsed}ms:`, err)

    applyHeaders(res, { ...CORS, 'Content-Type': 'application/json' })
    res.status(500).json({
      error:   'Internal Server Error',
      message: 'Erro interno ao gerar PDF.',
      elapsed,
    })
  }
}