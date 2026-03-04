import { useState, useCallback }  from 'react'
import { pdf }                    from '@react-pdf/renderer'
import { DanfeA4 }                from '@/components/Danfe/DanfeA4'
import type { NFeDados }          from '@/types/nfe.types'
import type { CompanyConfig }     from '@/types/company.types'
import { ENV }                    from '@/env'

const DEMO_KEY = ENV.DEMO_KEY

export function usePdfGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error,        setError]        = useState<string | null>(null)

  const generateA4 = useCallback(async (
    nfe:    NFeDados,
    config: CompanyConfig,
  ): Promise<void> => {
    setIsGenerating(true)
    setError(null)

    try {
      // ─── Tenta gerar diretamente no browser ───────────────
      console.group('[DanfeGen] Tentando geração client-side')
      console.log('nfe:', nfe)
      console.log('config:', config)

      const element = DanfeA4({ nfe, config })
      console.log('DanfeA4 element criado:', element)

      const blob = await pdf(element).toBlob()
      console.log('Blob gerado:', blob.size, 'bytes')
      console.groupEnd()

      const url  = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href     = url
      link.download = `DANFE-NF${String(nfe.nNF).padStart(9, '0')}-${nfe.serie}.pdf`
      link.click()
      URL.revokeObjectURL(url)

    } catch (clientErr) {
      // ─── Log do erro real client-side ─────────────────────
      console.groupEnd()
      console.error('[DanfeGen] ❌ Falha client-side:', clientErr)
      console.error('[DanfeGen] Stack:', clientErr instanceof Error ? clientErr.stack : clientErr)

      // ─── Fallback: chama a Vercel Function ────────────────
      try {
        console.group('[DanfeGen] Tentando fallback API /api/generate-pdf')
        console.log('DEMO_KEY presente:', !!DEMO_KEY)

        const res = await fetch('/api/generate-pdf', {
          method:  'POST',
          headers: {
            'Content-Type':   'application/json',
            'x-danfegen-key': DEMO_KEY,
          },
          body: JSON.stringify({
            mode:    'single',
            nfeData: nfe,
            config,
          }),
        })

        console.log('API status:', res.status)
        console.log('API headers:', Object.fromEntries(res.headers.entries()))

        if (!res.ok) {
          const errorBody = await res.text()
          console.error('[DanfeGen] API erro body:', errorBody)
          console.groupEnd()
          throw new Error(`API erro ${res.status}: ${errorBody}`)
        }

        console.groupEnd()
        const blob = await res.blob()
        const url  = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href     = url
        link.download = `DANFE-NF${String(nfe.nNF).padStart(9, '0')}-${nfe.serie}.pdf`
        link.click()
        URL.revokeObjectURL(url)

      } catch (apiErr) {
        const msg = apiErr instanceof Error ? apiErr.message : 'Erro ao gerar PDF'
        setError(msg)
        console.error('[DanfeGen] PDF generation failed:', apiErr)
      }
    } finally {
      setIsGenerating(false)
    }
  }, [])

  return { generateA4, isGenerating, error }
}