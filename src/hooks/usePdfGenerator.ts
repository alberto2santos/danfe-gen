import { useState, useCallback }  from 'react'
import React                      from 'react'
import { pdf }                    from '@react-pdf/renderer'
import type { DocumentProps }     from '@react-pdf/renderer'
import { DanfeA4 }                from '@/components/Danfe/DanfeA4'
import type { NFeDados }          from '@/types/nfe.types'
import type { CompanyConfig }     from '@/types/company.types'
import { ENV }                    from '@/env'

const DEMO_KEY = ENV.DEMO_KEY

/* ─── Helpers ─────────────────────────────────────────────────── */
function buildFilename(nfe: NFeDados): string {
  return `DANFE-NF${String(nfe.nNF).padStart(9, '0')}-S${nfe.serie}.pdf`
}

function buildSubject(nfe: NFeDados, config: CompanyConfig): string {
  const template = config.emailSend?.subjectTemplate
    || 'DANFE NF-e {{nNF}} — {{emitente}}'

  return template
    .replace('{{nNF}}',      String(nfe.nNF))
    .replace('{{emitente}}', nfe.emitente.xNome)
    .replace('{{serie}}',    String(nfe.serie))
}

async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer()
  const uint8Array  = new Uint8Array(arrayBuffer)
  let binary = ''
  uint8Array.forEach(b => (binary += String.fromCharCode(b)))
  return btoa(binary)
}

/* ─── Hook principal ──────────────────────────────────────────── */
export function usePdfGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending,    setIsSending]    = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [emailSuccess, setEmailSuccess] = useState(false)

  /* ─── Gera PDF e retorna o Blob ─────────────────────────────── */
  const generateBlob = useCallback(async (
    nfe:    NFeDados,
    config: CompanyConfig,
  ): Promise<Blob> => {

    // ─── Tenta client-side ──────────────────────────────────
    try {
      console.group('[DanfeGen] Tentando geração client-side')
      console.log('nfe:', nfe)
      console.log('config:', config)

      const element = React.createElement(
        DanfeA4,
        { nfe, config }
      ) as unknown as React.ReactElement<DocumentProps>

      console.log('DanfeA4 element criado:', element)

      const blob = await pdf(element).toBlob()
      console.log('Blob gerado:', blob.size, 'bytes')
      console.groupEnd()

      return blob

    } catch (clientErr) {
      console.groupEnd()
      console.error('[DanfeGen] ❌ Falha client-side:', clientErr)
      console.error('[DanfeGen] Stack:', clientErr instanceof Error ? clientErr.stack : clientErr)

      // ─── Fallback: Vercel Function ────────────────────────
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

      if (!res.ok) {
        const errorBody = await res.text()
        console.error('[DanfeGen] API erro body:', errorBody)
        console.groupEnd()
        throw new Error(`API erro ${res.status}: ${errorBody}`)
      }

      console.groupEnd()
      return await res.blob()
    }
  }, [])

  /* ─── Gera e faz download ───────────────────────────────────── */
  const generateA4 = useCallback(async (
    nfe:    NFeDados,
    config: CompanyConfig,
  ): Promise<void> => {
    setIsGenerating(true)
    setError(null)

    try {
      const blob     = await generateBlob(nfe, config)
      const filename = buildFilename(nfe)
      const url      = URL.createObjectURL(blob)
      const link     = document.createElement('a')

      link.href     = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao gerar PDF'
      setError(msg)
      console.error('[DanfeGen] PDF generation failed:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [generateBlob])

  /* ─── Gera e compartilha via Web Share API ──────────────────── */
  const shareA4 = useCallback(async (
    nfe:    NFeDados,
    config: CompanyConfig,
  ): Promise<void> => {
    setIsGenerating(true)
    setError(null)

    try {
      const blob     = await generateBlob(nfe, config)
      const filename = buildFilename(nfe)
      const file     = new File([blob], filename, { type: 'application/pdf' })

      // Web Share API — mobile e desktop moderno
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `DANFE NF-e ${nfe.nNF}`,
          text:  `DANFE da NF-e nº ${nfe.nNF} — ${nfe.emitente.xNome}`,
          files: [file],
        })
        console.log('[DanfeGen] PDF compartilhado via Web Share API')
      } else {
        // Fallback: download direto se Web Share não suportado
        console.warn('[DanfeGen] Web Share API não suportada — fazendo download')
        const url  = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href     = url
        link.download = filename
        link.click()
        URL.revokeObjectURL(url)
      }

    } catch (err) {
      // AbortError = usuário cancelou o share — não é erro real
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[DanfeGen] Compartilhamento cancelado pelo usuário')
        return
      }
      const msg = err instanceof Error ? err.message : 'Erro ao compartilhar PDF'
      setError(msg)
      console.error('[DanfeGen] Share failed:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [generateBlob])

  /* ─── Gera e envia por e-mail via /api/send-email ───────────── */
  const sendByEmail = useCallback(async (
    nfe:      NFeDados,
    config:   CompanyConfig,
    toEmail?: string,
  ): Promise<void> => {
    setIsSending(true)
    setError(null)
    setEmailSuccess(false)

    try {
      const blob     = await generateBlob(nfe, config)
      const filename = buildFilename(nfe)
      const base64   = await blobToBase64(blob)

      const to = toEmail
        || config.emailSend?.defaultTo
        || nfe.destinatario?.email
        || ''

      if (!to) {
        throw new Error('Nenhum e-mail de destino configurado.')
      }

      if (!config.emailSend?.fromEmail) {
        throw new Error('Configure o e-mail de envio nas Configurações.')
      }

      const res = await fetch('/api/send-email', {
        method:  'POST',
        headers: {
          'Content-Type':   'application/json',
          'x-danfegen-key': DEMO_KEY,
        },
        body: JSON.stringify({
          to,
          fromName:  config.emailSend.fromName  || config.name,
          fromEmail: config.emailSend.fromEmail,
          replyTo:   config.emailSend.replyTo   || config.emailSend.fromEmail,
          subject:   buildSubject(nfe, config),
          body:      config.emailSend.bodyTemplate
            || `<p>Prezado(a),</p><p>Segue em anexo o DANFE referente à NF-e nº <b>${nfe.nNF}</b>.</p><p>Atenciosamente,<br/>${config.name}</p>`,
          pdfBase64: base64,
          filename,
        }),
      })

      if (!res.ok) {
        const errBody = await res.text()
        throw new Error(`Erro ${res.status}: ${errBody}`)
      }

      const data = await res.json() as { success: boolean; id?: string }
      console.log('[DanfeGen] E-mail enviado com sucesso — id:', data.id, '→', to)
      setEmailSuccess(true)

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar e-mail'
      setError(msg)
      console.error('[DanfeGen] Email send failed:', err)
    } finally {
      setIsSending(false)
    }
  }, [generateBlob])

  /* ─── Verifica suporte ao Web Share API ─────────────────────── */
  const canShare = typeof navigator !== 'undefined'
    && typeof navigator.share === 'function'

  return {
    // ações
    generateA4,
    shareA4,
    sendByEmail,

    // estados
    isGenerating,
    isSending,
    error,
    emailSuccess,

    // utilitários
    canShare,
  }
}