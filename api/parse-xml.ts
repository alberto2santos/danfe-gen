/* ============================================================
   api/parse-xml.ts — Vercel Function
   Recebe XML NF-e (string), valida estrutura + DSig,
   retorna JSON tipado NFeDados
   Hobby: timeout 10s default — operação leve, sem risco
   ============================================================ */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { XMLParser }                          from 'fast-xml-parser'
import { DOMParser }                          from '@xmldom/xmldom'

/* ─── Configuração da Function ────────────────────────────────── */
export const config = {
  maxDuration: 30,   // 30s — parse + DSig validação
}

/* ─── CORS headers ────────────────────────────────────────────── */
const CORS = {
  'Access-Control-Allow-Origin':  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-danfegen-key',
}

/* ─── Tipos ───────────────────────────────────────────────────── */
interface ParseRequest {
  xml:         string    // XML NF-e completo como string
  validateDSig?: boolean  // default: true
}

interface DSigResult {
  valid:   boolean
  reason?: string
  issuer?: string
  serial?: string
}

/* ─── DSig validation via xmldsigjs + WebCrypto ──────────────── */
async function validateXmlDSig(xmlString: string): Promise<DSigResult> {
  try {
    // Dynamic import — evita cold start pesado se DSig não for necessário
    const { SignedXml } = await import('xmldsigjs')
    const { Crypto }    = await import('@peculiar/webcrypto')

    // Registra WebCrypto para Node.js (necessário no runtime da Vercel)
    const crypto = new Crypto()
    SignedXml.CryptoEngine = {
      name:   'node-webcrypto',
      subtle: crypto.subtle,
      crypto: crypto as unknown as Crypto,
    }

    const doc = new DOMParser().parseFromString(xmlString, 'text/xml')

    // Localiza o bloco <Signature> dentro do XML NF-e
    const signatureNodes = doc.getElementsByTagNameNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'Signature'
    )

    if (signatureNodes.length === 0) {
      return { valid: false, reason: 'Assinatura digital não encontrada no XML.' }
    }

    const signedXml = new SignedXml(doc)

    // Verifica a assinatura — lança exceção se inválida
    const isValid = await signedXml.verify()

    if (!isValid) {
      return { valid: false, reason: 'Assinatura digital inválida — XML pode ter sido alterado.' }
    }

    // Extrai informações do certificado X.509
    const certs = signedXml.signature.KeyInfo?.X509Data
    const issuer = certs?.[0]?.X509IssuerSerial?.X509IssuerName ?? undefined
    const serial = certs?.[0]?.X509IssuerSerial?.X509SerialNumber ?? undefined

    return { valid: true, issuer, serial }

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'

    // Se for NF-e de homologação sem assinatura real — warning apenas
    if (msg.includes('homolog') || msg.includes('tpAmb')) {
      return { valid: true, reason: 'Ambiente de homologação — assinatura não verificada.' }
    }

    return { valid: false, reason: `Erro na validação DSig: ${msg}` }
  }
}

/* ─── Parser XML configurado ──────────────────────────────────── */
function parseNFeXml(xmlString: string): {
  success: boolean
  data?:   unknown
  error?:  string
} {
  try {
    const parser = new XMLParser({
      ignoreAttributes:    false,
      attributeNamePrefix: '@_',
      parseTagValue:       true,
      parseAttributeValue: false,
      trimValues:          true,
      processEntities:     false,   // bloqueia XXE
      isArray: (tag) => ['det', 'vol', 'dup', 'autXML'].includes(tag),
    })

    const raw     = parser.parse(xmlString)
    const infNFe  =
      raw?.nfeProc?.NFe?.infNFe ??
      raw?.NFe?.infNFe          ??
      null

    if (!infNFe) {
      return {
        success: false,
        error:   'Estrutura NF-e não encontrada. Verifique se o arquivo é um XML NF-e válido.',
      }
    }

    // Extrai chNFe do protocolo ou do atributo Id
    const chNFe =
      raw?.nfeProc?.protNFe?.infProt?.chNFe          ??
      raw?.NFe?.infNFe?.['@_Id']?.replace(/^NFe/, '') ??
      ''

    return { success: true, data: { infNFe, chNFe, raw } }
  } catch (err) {
    return {
      success: false,
      error:   `Erro ao parsear XML: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
    }
  }
}

/* ─── Handler principal ───────────────────────────────────────── */
export default async function handler(req: VercelRequest, res: VercelResponse) {

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).set(CORS).end()
  }

  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).set(CORS).json({ error: 'Método não permitido. Use POST.' })
  }

  const start = Date.now()

  try {
    const body = req.body as ParseRequest

    // ─── Validação do body ───────────────────────────────────
    if (!body?.xml || typeof body.xml !== 'string') {
      return res.status(400).set(CORS).json({
        error:   'Bad Request',
        message: 'Campo "xml" (string) obrigatório no body.',
      })
    }

    // Limite de tamanho — 2MB máximo (NF-e real raramente passa de 100KB)
    if (body.xml.length > 2_097_152) {
      return res.status(413).set(CORS).json({
        error:   'Payload Too Large',
        message: 'XML excede 2 MB. Verifique o arquivo.',
      })
    }

    // ─── Parse do XML ────────────────────────────────────────
    const parsed = parseNFeXml(body.xml)
    if (!parsed.success) {
      return res.status(422).set(CORS).json({
        error:   'Unprocessable Entity',
        message: parsed.error,
      })
    }

    // ─── Validação DSig (default: true) ─────────────────────
    const shouldValidateDSig = body.validateDSig !== false
    let dsig: DSigResult = { valid: true, reason: 'DSig não verificado (desabilitado).' }

    if (shouldValidateDSig) {
      dsig = await validateXmlDSig(body.xml)

      // NF-e inválida estruturalmente (assinatura quebrada)
      if (!dsig.valid && !dsig.reason?.includes('homolog')) {
        return res.status(422).set(CORS).json({
          error:   'Invalid Signature',
          message: dsig.reason,
          dsig,
        })
      }
    }

    // ─── Sucesso ─────────────────────────────────────────────
    const elapsed = Date.now() - start

    return res.status(200).set({
      ...CORS,
      'Content-Type':    'application/json',
      'X-Parse-Time-Ms': String(elapsed),
    }).json({
      success:  true,
      data:     (parsed.data as { infNFe: unknown; chNFe: string }).infNFe,
      chNFe:    (parsed.data as { infNFe: unknown; chNFe: string }).chNFe,
      dsig,
      meta: {
        parseTimeMs: elapsed,
        xmlSizeBytes: body.xml.length,
      },
    })

  } catch (err) {
    console.error('[parse-xml] Erro interno:', err)
    return res.status(500).set(CORS).json({
      error:   'Internal Server Error',
      message: 'Erro interno ao processar o XML.',
    })
  }
}