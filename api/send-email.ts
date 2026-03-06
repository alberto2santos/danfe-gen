import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const config = { maxDuration: 30 }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }

  const {
    to,
    fromName,
    fromEmail,
    replyTo,
    subject,
    body,
    pdfBase64,
    filename,
  } = req.body as {
    to:         string
    fromName:   string
    fromEmail:  string
    replyTo:    string
    subject:    string
    body:       string
    pdfBase64:  string      // PDF em base64
    filename:   string
  }

  if (!to || !pdfBase64 || !filename) {
    res.status(400).json({ error: 'Campos obrigatórios: to, pdfBase64, filename' })
    return
  }

  try {
    const { data, error } = await resend.emails.send({
      from:     `${fromName} <${fromEmail}>`,
      to:       [to],
      replyTo:  replyTo || fromEmail,
      subject:  subject  || `DANFE — ${filename}`,
      html:     body     || `<p>Segue em anexo o DANFE da NF-e.</p>`,
      attachments: [
        {
          filename,
          content: pdfBase64,  // Resend aceita base64 direto
        },
      ],
    })

    if (error) {
      console.error('[send-email] Resend error:', error)
      res.status(500).json({ error: error.message })
      return
    }

    console.log('[send-email] OK — id:', data?.id, '→', to)
    res.status(200).json({ success: true, id: data?.id })

  } catch (err) {
    console.error('[send-email] Erro interno:', err)
    res.status(500).json({ error: 'Erro interno ao enviar e-mail' })
  }
}