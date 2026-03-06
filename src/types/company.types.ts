export type LogoPosition = 'left' | 'center' | 'right'

export type ErpProvider =
  | 'none'
  | 'bling'
  | 'omie'
  | 'tiny'
  | 'totvs'
  | 'contaazul'

/* ─── Email Send Config ───────────────────────────────────────── */
export interface EmailSendConfig {
  enabled:         boolean
  fromName:        string   // nome exibido no remetente
  fromEmail:       string   // domínio verificado no Resend
  replyTo:         string   // e-mail de resposta
  defaultTo:       string   // destino padrão se XML não tiver e-mail
  subjectTemplate: string   // suporta {{nNF}}, {{emitente}}, {{serie}}
  bodyTemplate:    string   // HTML — vazio = usa template padrão
}

/* ─── Company Config ──────────────────────────────────────────── */
export interface CompanyConfig {
  // Schema version — permite migração futura
  version:       1

  // Dados da empresa
  name:          string
  cnpj:          string
  ie?:           string
  address?:      string
  phone?:        string
  email?:        string

  // Identidade visual
  logoUrl:       string        // base64 para portabilidade
  logoPosition:  LogoPosition
  primaryColor:  string        // hex

  // Opções de impressão
  showLogo:      boolean
  showWatermark: boolean       // "SEM VALOR FISCAL" em homologação

  // ERP
  erpProvider:   ErpProvider
  erpWebhookUrl: string

  // Envio por e-mail via Resend
  emailSend:     EmailSendConfig
}

/* ─── Default config ──────────────────────────────────────────── */
export const DEFAULT_COMPANY_CONFIG: CompanyConfig = {
  version:       1,
  name:          '',
  cnpj:          '',
  ie:            '',
  address:       '',
  phone:         '',
  email:         '',

  logoUrl:       '',
  logoPosition:  'left',
  primaryColor:  '#2563eb',
  showLogo:      true,
  showWatermark: false,

  erpProvider:   'none',
  erpWebhookUrl: '',

  emailSend: {
    enabled:         false,
    fromName:        '',
    fromEmail:       '',
    replyTo:         '',
    defaultTo:       '',
    subjectTemplate: 'DANFE NF-e {{nNF}} — {{emitente}}',
    bodyTemplate:    '',
  },
}