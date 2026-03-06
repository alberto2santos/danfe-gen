import { useState, useCallback } from 'react'
import type { NFeDados }         from '@/types/nfe.types'
import type { CompanyConfig }    from '@/types/company.types'
import { ENV }                   from '@/env'

export function useEmailSender() {
  const [isSending, setIsSending] = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [success,   setSuccess]   = useState(false)

  const sendByEmail = useCallback(async (
    pdfBlob:  Blob,
    filename: string,
    nfe:      NFeDados,
    config:   CompanyConfig,
    toEmail?: string,
  ): Promise<void> => {
    setIsSending(true)
    setError(null)
    setSuccess(false)

    try {
      // ─── Converte blob → base64 ──────────────────────────
      const arrayBuffer = await pdfBlob.arrayBuffer()
      const uint8Array  = new Uint8Array(arrayBuffer)
      const base64      = btoa(String.fromCharCode(...uint8Array))

      // ─── Monta subject com template ──────────────────────
      const subject = (config.emailSend.subjectTemplate || 'DANFE NF-e {{nNF}} — {{emitente}}')
        .replace('{{nNF}}',      nfe.nNF)
        .replace('{{emitente}}', nfe.emitente.xNome)
        .replace('{{serie}}',    nfe.serie)

      const res = await fetch('/api/send-email', {
        method:  'POST',
        headers: {
          'Content-Type':   'application/json',
          'x-danfegen-key': ENV.DEMO_KEY,
        },
        body: JSON.stringify({
          to:        toEmail || config.emailSend.defaultTo || nfe.destinatario.email,
          fromName:  config.emailSend.fromName  || config.name,
          fromEmail: config.emailSend.fromEmail,
          replyTo:   config.emailSend.replyTo   || config.emailSend.fromEmail,
          subject,
          body:      config.emailSend.bodyTemplate || `<p>Segue em anexo o DANFE da NF-e nº <b>${nfe.nNF}</b>.</p>`,
          pdfBase64: base64,
          filename,
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(`Erro ${res.status}: ${err}`)
      }

      setSuccess(true)

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar e-mail'
      setError(msg)
      console.error('[useEmailSender]', err)
    } finally {
      setIsSending(false)
    }
  }, [])

  return { sendByEmail, isSending, error, success }
}