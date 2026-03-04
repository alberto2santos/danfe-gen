import { useCallback } from 'react'
import { XMLParser } from 'fast-xml-parser'
import type { ParseResult, NFeDados } from '@/types/nfe.types'
import { validateNFe } from '@/schemas/nfeSchema'
import { extractNFe } from '@/utils/xmlParser'

export function useXmlParser() {

  const parse = useCallback(async (xmlText: string): Promise<ParseResult> => {
    try {
      // ─── Parser configurado de forma segura ───────────────
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        parseTagValue: false,
        parseAttributeValue: false,
        trimValues: true,
        processEntities: false,
        isArray: (tagName) =>
          ['det', 'vol', 'dup', 'autXML'].includes(tagName),
      })

      const raw = parser.parse(xmlText)

      // ─── Navega até o nó NFe ou nfeProc ───────────────────
      const nfeNode =
        raw?.nfeProc?.NFe?.infNFe ??
        raw?.NFe?.infNFe ??
        null

      if (!nfeNode) {
        return {
          success: false,
          error: 'XML inválido: estrutura de NF-e não encontrada. Verifique se o arquivo é um XML de NF-e válido.',
        }
      }

      // ─── Valida com Zod (nfeSchema) ────────────────────────
      const validation = validateNFe(nfeNode)
      if (!validation.success) {
        return {
          success: false,
          error: `XML com campos obrigatórios ausentes: ${validation.error}`,
        }
      }

      // ─── Extrai chave — ✅ String() garante que nunca é number
      const chNFe = String(
        raw?.nfeProc?.protNFe?.infProt?.chNFe ??
        String(nfeNode?.['@_Id'] ?? '').replace(/^NFe/, '') ??
        ''
      )

      const data: NFeDados = extractNFe(nfeNode, chNFe)

      return { success: true, data }

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      return {
        success: false,
        error: `Falha ao processar o XML: ${msg}`,
      }
    }
  }, [])

  return { parse }
}