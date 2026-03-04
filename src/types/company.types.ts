export type LogoPosition = 'left' | 'center' | 'right'

export type ErpProvider =
  | 'none'
  | 'bling'
  | 'omie'
  | 'tiny'
  | 'totvs'
  | 'contaazul'

export interface CompanyConfig {
  // Schema version — permite migração futura
  version:        1

  // Dados da empresa
  name:           string
  cnpj:           string
  ie?:            string
  address?:       string
  phone?:         string
  email?:         string

  // Identidade visual
  logoUrl:        string         // base64 para portabilidade
  logoPosition:   LogoPosition
  primaryColor:   string         // hex

  // Opções de impressão
  showLogo:       boolean
  showWatermark:  boolean        // "SEM VALOR FISCAL" em homologação

  // ERP
  erpProvider:    ErpProvider
  erpWebhookUrl:  string
}

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
}