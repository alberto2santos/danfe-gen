import { z } from 'zod'

/* ─── Schema de configuração da empresa emitente ─────────────── */
export const companySchema = z.object({

  // Identidade
  razaoSocial:  z.string().min(1, 'Razão social obrigatória').max(60),
  nomeFantasia: z.string().max(60).optional().default(''),
  cnpj:         z.string().regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos'),
  ie:           z.string().max(14).optional().default(''),

  // Endereço
  logradouro:   z.string().max(60).optional().default(''),
  numero:       z.string().max(10).optional().default(''),
  complemento:  z.string().max(60).optional().default(''),
  bairro:       z.string().max(60).optional().default(''),
  municipio:    z.string().max(60).optional().default(''),
  uf:           z.string().length(2).optional().default(''),
  cep:          z.string().regex(/^\d{8}$/).optional().or(z.literal('')).default(''),

  // Contato
  telefone:     z.string().max(14).optional().default(''),
  email:        z.email().optional().or(z.literal('')).default(''),

  // ERP
  erpProvider:   z.enum(['none', 'bling', 'omie', 'tiny', 'contaazul', 'totvs']).default('none'),
  erpWebhookUrl: z.url().optional().or(z.literal('')).default(''),
})

export type CompanyConfig = z.infer<typeof companySchema>

/* ─── Validação com retorno tipado ───────────────────────────── */
export function validateCompany(data: unknown):
  | { success: true;  data: CompanyConfig }
  | { success: false; error: string } {

  const result = companySchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const msg = result.error.issues
    .map((e: z.core.$ZodIssue) => `${e.path.join('.')}: ${e.message}`)
    .join(' | ')

  return { success: false, error: msg }
}

/* ─── Valores padrão para formulários ────────────────────────── */
export const defaultCompanyConfig: CompanyConfig = companySchema.parse({
  razaoSocial: '',
  cnpj:        '00000000000000',
  erpProvider: 'none',
})