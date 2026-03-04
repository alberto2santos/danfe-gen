export type ErpProvider =
  | 'none'
  | 'bling'
  | 'omie'
  | 'tiny'
  | 'contaazul'
  | 'totvs'

export interface ErpWebhookPayload {
  event:     'nfe_parsed' | 'pdf_generated' | 'ping'
  provider:  ErpProvider
  version:   string
  timestamp: string
  data?:     unknown
}

export interface ErpConnectionResult {
  success:   boolean
  latencyMs: number | null
  message:   string
}