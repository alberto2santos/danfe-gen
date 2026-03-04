import {
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  type ChangeEvent,
}  from 'react'
import {
  X, Upload, RotateCcw,
  Download, FolderOpen,
  Building2, Palette,
  Plug, Save,
}                                from 'lucide-react'
import { useCompany }            from '@/contexts/CompanyContext'
import type { CompanyConfig as CompanyConfigType, ErpProvider, LogoPosition } from '@/types/company.types'
import { isValidCNPJ }           from '@/utils/cnpjValidator'
import { formatCNPJ }            from '@/utils/formatters'

/* ─── Props ───────────────────────────────────────────────────── */
interface CompanyConfigProps {
  open:    boolean
  onClose: () => void
}

/* ─── Helpers ─────────────────────────────────────────────────── */
const ERP_OPTIONS: { value: ErpProvider; label: string }[] = [
  { value: 'none',      label: 'Nenhum'         },
  { value: 'bling',     label: 'Bling'           },
  { value: 'omie',      label: 'Omie'            },
  { value: 'tiny',      label: 'Tiny ERP'        },
  { value: 'contaazul', label: 'Conta Azul'      },
  { value: 'totvs',     label: 'TOTVS Protheus'  },
]

const LOGO_POSITIONS: { value: LogoPosition; label: string }[] = [
  { value: 'left',   label: 'Esquerda' },
  { value: 'center', label: 'Centro'   },
  { value: 'right',  label: 'Direita'  },
]

const PRESET_COLORS = [
  '#2563eb', '#7c3aed', '#059669',
  '#dc2626', '#d97706', '#0891b2',
  '#be185d', '#374151',
]

/* ─── Sub-componente: campo de formulário ─────────────────────── */
interface FormFieldProps {
  label:       string
  htmlFor:     string
  required?:   boolean
  error?:      string | null
  children:    React.ReactNode
}

function FormField({ label, htmlFor, required, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium text-surface-600 dark:text-surface-400"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-danger-500">*</span>
        )}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}
    </div>
  )
}

/* ─── Sub-componente: input base ─────────────────────────────────*/
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={`
          w-full px-3 py-2 rounded-lg text-sm
          border transition-colors duration-150
          bg-white dark:bg-surface-900
          text-surface-900 dark:text-surface-100
          placeholder:text-surface-400 dark:placeholder:text-surface-600
          ${hasError
            ? 'border-danger-400 focus:ring-danger-300 dark:border-danger-600'
            : 'border-surface-200 dark:border-surface-700 focus:border-brand-400 dark:focus:border-brand-500'}
          focus:outline-none focus:ring-2
          ${hasError ? 'focus:ring-danger-200' : 'focus:ring-brand-100 dark:focus:ring-brand-900'}
          ${className}
        `}
      />
    )
  }
)

Input.displayName = 'Input' 

/* ─── Sub-componente: textarea base ──────────────────────────────*/
function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`
        w-full px-3 py-2 rounded-lg text-sm resize-none
        border border-surface-200 dark:border-surface-700
        bg-white dark:bg-surface-900
        text-surface-900 dark:text-surface-100
        placeholder:text-surface-400 dark:placeholder:text-surface-600
        focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900
        focus:border-brand-400 dark:focus:border-brand-500
        transition-colors duration-150
        ${className}
      `}
    />
  )
}

/* ─── Seção do drawer ─────────────────────────────────────────── */
interface DrawerSectionProps {
  title:    string
  icon:     React.ReactNode
  children: React.ReactNode
}

function DrawerSection({ title, icon, children }: DrawerSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-surface-100 dark:border-surface-800">
        <span className="text-brand-600 dark:text-brand-400" aria-hidden="true">
          {icon}
        </span>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400">
          {title}
        </h3>
      </div>
      {children}
    </section>
  )
}

/* ─── Componente principal ────────────────────────────────────── */
export function CompanyConfig({ open, onClose }: CompanyConfigProps) {
  const { config, updateConfig, resetConfig, exportConfig, importConfig } = useCompany()
  const importInputRef = useRef<HTMLInputElement>(null)
  const firstFocusRef  = useRef<HTMLInputElement>(null)

  /* ─── Foco inicial quando drawer abre ──────────────────────── */
  useEffect(() => {
    if (open) {
      // Delay mínimo para a transição CSS terminar
      const t = setTimeout(() => firstFocusRef.current?.focus(), 150)
      return () => clearTimeout(t)
    }
  }, [open])

  /* ─── Fecha ao pressionar Escape ────────────────────────────── */
  useEffect(() => {
    if (!open) return
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  /* ─── Trava o scroll do body quando drawer está aberto ─────── */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open] as const)

  /* ─── Handler de upload de logo ─────────────────────────────── */
  const handleLogoUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Envie uma imagem (PNG, JPG, SVG ou WEBP).')
      return
    }

    if (file.size > 512_000) {
      alert('Imagem muito grande. Máximo: 512 KB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result
      if (typeof result === 'string') {
        updateConfig({ logoUrl: result })
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [updateConfig])

  /* ─── Handler de import de JSON ─────────────────────────────── */
  const handleImportJson = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text !== 'string') return

      const ok = importConfig(text)
      if (!ok) {
        alert('Arquivo JSON inválido. Verifique o formato e tente novamente.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [importConfig])

  /* ─── Validação do CNPJ ─────────────────────────────────────── */
  const cnpjError = config.cnpj && config.cnpj.replace(/\D/g, '').length === 14
    ? isValidCNPJ(config.cnpj) ? null : 'CNPJ inválido'
    : null

  /* ─── Handler CNPJ com máscara ──────────────────────────────── */
  const handleCNPJChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const raw     = e.target.value.replace(/\D/g, '').slice(0, 14)
    const masked  = raw.length === 14 ? formatCNPJ(raw) : e.target.value
    updateConfig({ cnpj: masked })
  }, [updateConfig])

  /* ─── Não renderiza nada se fechado (mantém DOM limpo) ─────── */
  if (!open) return null

  return (
    <>
      {/* ─── Overlay ────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="
          fixed inset-0 z-[60]
          bg-black/40 dark:bg-black/60
          backdrop-blur-sm
          animate-fade-in
        "
        onClick={onClose}
      />

      {/* ─── Drawer ─────────────────────────────────────────── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Configurações da empresa"
        className="
          fixed top-0 right-0 z-[70]
          h-full w-full sm:w-[420px]
          flex flex-col
          bg-white dark:bg-surface-950
          border-l border-surface-200 dark:border-surface-800
          shadow-drawer
          animate-slide-in-right
        "
      >

        {/* ─── Header do drawer ────────────────────────────── */}
        <div className="
          flex items-center justify-between
          px-5 py-4
          border-b border-surface-100 dark:border-surface-800
          shrink-0
        ">
          <div className="flex items-center gap-2.5">
            <div
              aria-hidden="true"
              className="
                flex items-center justify-center
                w-8 h-8 rounded-lg
                bg-brand-50 dark:bg-brand-950
                text-brand-600 dark:text-brand-400
              "
            >
              <Building2 size={16} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-50">
                Configurações
              </h2>
              <p className="text-xs text-surface-400 dark:text-surface-500">
                Personalize o DANFE da sua empresa
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar configurações"
            className="
              touch-target
              flex items-center justify-center
              w-8 h-8 rounded-lg
              text-surface-400 hover:text-surface-700
              dark:hover:text-surface-200
              hover:bg-surface-100 dark:hover:bg-surface-800
              transition-colors duration-150
            "
          >
            <X aria-hidden="true" size={16} strokeWidth={2} />
          </button>
        </div>

        {/* ─── Corpo com scroll ────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-5 space-y-6">

            {/* ════ Seção 1 — Dados da Empresa ════════════════ */}
            <DrawerSection
              title="Dados da Empresa"
              icon={<Building2 size={14} strokeWidth={2} />}
            >
              <FormField label="Razão Social" htmlFor="cfg-name">
                <Input
                  ref={firstFocusRef}
                  id="cfg-name"
                  type="text"
                  value={config.name}
                  onChange={e => updateConfig({ name: e.target.value })}
                  placeholder="Ex: Empresa ABC Ltda"
                  maxLength={120}
                  autoComplete="organization"
                />
              </FormField>

              <FormField label="CNPJ" htmlFor="cfg-cnpj" error={cnpjError}>
                <Input
                  id="cfg-cnpj"
                  type="text"
                  value={config.cnpj}
                  onChange={handleCNPJChange}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  hasError={!!cnpjError}
                  inputMode="numeric"
                />
              </FormField>

              <FormField label="Inscrição Estadual" htmlFor="cfg-ie">
                <Input
                  id="cfg-ie"
                  type="text"
                  value={config.ie ?? ''}
                  onChange={e => updateConfig({ ie: e.target.value })}
                  placeholder="Ex: 123.456.789.110"
                  maxLength={30}
                />
              </FormField>

              <FormField label="Endereço Completo" htmlFor="cfg-address">
                <Textarea
                  id="cfg-address"
                  rows={2}
                  value={config.address ?? ''}
                  onChange={e => updateConfig({ address: e.target.value })}
                  placeholder="Rua, número, bairro, cidade – UF"
                  maxLength={200}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Telefone" htmlFor="cfg-phone">
                  <Input
                    id="cfg-phone"
                    type="tel"
                    value={config.phone ?? ''}
                    onChange={e => updateConfig({ phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    maxLength={20}
                    inputMode="tel"
                  />
                </FormField>
                <FormField label="E-mail" htmlFor="cfg-email">
                  <Input
                    id="cfg-email"
                    type="email"
                    value={config.email ?? ''}
                    onChange={e => updateConfig({ email: e.target.value })}
                    placeholder="contato@empresa.com"
                    maxLength={80}
                    inputMode="email"
                  />
                </FormField>
              </div>
            </DrawerSection>

            {/* ════ Seção 2 — Identidade Visual ═══════════════ */}
            <DrawerSection
              title="Identidade Visual"
              icon={<Palette size={14} strokeWidth={2} />}
            >
              {/* Upload de logo */}
              <FormField label="Logotipo" htmlFor="cfg-logo-upload">
                <div className="space-y-2">
                  {config.logoUrl ? (
                    <div className="
                      relative flex items-center justify-center
                      h-20 rounded-lg
                      border border-surface-200 dark:border-surface-700
                      bg-surface-50 dark:bg-surface-900
                      overflow-hidden
                    ">
                      <img
                        src={config.logoUrl}
                        alt="Logo da empresa"
                        className="max-h-16 max-w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => updateConfig({ logoUrl: '' })}
                        aria-label="Remover logo"
                        className="
                          absolute top-1.5 right-1.5
                          flex items-center justify-center
                          w-6 h-6 rounded-full
                          bg-surface-800/70 text-white
                          hover:bg-danger-600
                          transition-colors duration-150
                        "
                      >
                        <X aria-hidden="true" size={10} strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => document.getElementById('cfg-logo-upload')?.click()}
                      className="
                        w-full flex flex-col items-center gap-2
                        py-4 rounded-lg
                        border-2 border-dashed border-surface-200 dark:border-surface-700
                        text-surface-400 hover:text-brand-600 dark:hover:text-brand-400
                        hover:border-brand-400 dark:hover:border-brand-500
                        hover:bg-brand-50 dark:hover:bg-brand-950/30
                        transition-colors duration-150
                      "
                    >
                      <Upload aria-hidden="true" size={20} strokeWidth={1.5} />
                      <span className="text-xs">
                        Clique para enviar logo
                      </span>
                      <span className="text-[10px] text-surface-300">
                        PNG, JPG, SVG, WEBP — máx. 512 KB
                      </span>
                    </button>
                  )}
                  <input
                    id="cfg-logo-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    aria-hidden="true"
                    onChange={handleLogoUpload}
                  />
                </div>
              </FormField>

              {/* Posição do logo */}
              <FormField label="Posição do Logo no DANFE" htmlFor="cfg-logo-pos">
                <div
                  role="group"
                  aria-label="Posição do logo"
                  className="
                    flex items-center rounded-lg
                    border border-surface-200 dark:border-surface-700
                    overflow-hidden bg-surface-50 dark:bg-surface-900
                    p-0.5 gap-0.5
                  "
                >
                  {LOGO_POSITIONS.map(pos => (
                    <button
                      key={pos.value}
                      type="button"
                      role="radio"
                      aria-checked={config.logoPosition === pos.value}
                      onClick={() => updateConfig({ logoPosition: pos.value })}
                      className={`
                        flex-1 py-1.5 rounded text-xs font-medium
                        transition-colors duration-150
                        ${config.logoPosition === pos.value
                          ? 'bg-white dark:bg-surface-800 text-brand-700 dark:text-brand-300 shadow-sm'
                          : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-200'}
                      `}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </FormField>

              {/* Cor primária */}
              <FormField label="Cor Primária" htmlFor="cfg-color">
                <div className="space-y-2">
                  {/* Presets */}
                  <div
                    role="group"
                    aria-label="Cores predefinidas"
                    className="flex items-center gap-2 flex-wrap"
                  >
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateConfig({ primaryColor: color })}
                        aria-label={`Cor ${color}`}
                        aria-pressed={config.primaryColor === color}
                        className={`
                          w-7 h-7 rounded-full
                          transition-transform duration-150
                          ${config.primaryColor === color
                            ? 'ring-2 ring-offset-2 ring-surface-400 dark:ring-offset-surface-950 scale-110'
                            : 'hover:scale-105'}
                        `}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Input color nativo */}
                  <div className="flex items-center gap-2">
                    <input
                      id="cfg-color"
                      type="color"
                      value={config.primaryColor}
                      onChange={e => updateConfig({ primaryColor: e.target.value })}
                      className="
                        w-8 h-8 rounded-lg cursor-pointer
                        border border-surface-200 dark:border-surface-700
                        bg-transparent p-0.5
                      "
                    />
                    <span className="text-xs font-mono text-surface-500 dark:text-surface-400">
                      {config.primaryColor.toUpperCase()}
                    </span>
                  </div>
                </div>
              </FormField>

              {/* Opções de impressão */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-surface-600 dark:text-surface-400">
                  Opções de Impressão
                </span>
                {[
                  {
                    key:   'showLogo' as keyof CompanyConfigType,
                    label: 'Exibir logo no DANFE',
                  },
                  {
                    key:   'showWatermark' as keyof CompanyConfigType,
                    label: 'Marca d\'água "Sem Valor Fiscal" (homologação)',
                  },
                ].map(opt => (
                  <label
                    key={opt.key}
                    className="
                      flex items-center gap-3 cursor-pointer
                      py-2 px-3 rounded-lg
                      hover:bg-surface-50 dark:hover:bg-surface-900
                      transition-colors duration-150
                    "
                  >
                    <input
                      type="checkbox"
                      checked={!!config[opt.key]}
                      onChange={e => updateConfig({ [opt.key]: e.target.checked })}
                      className="
                        w-4 h-4 rounded
                        border-surface-300 dark:border-surface-600
                        text-brand-600 dark:text-brand-500
                        focus:ring-brand-400 dark:focus:ring-brand-500
                        accent-[--brand]
                      "
                    />
                    <span className="text-sm text-surface-700 dark:text-surface-300">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </DrawerSection>

            {/* ════ Seção 3 — Integração ERP ══════════════════ */}
            <DrawerSection
              title="Integração ERP"
              icon={<Plug size={14} strokeWidth={2} />}
            >
              <FormField label="ERP / Sistema" htmlFor="cfg-erp">
                <select
                  id="cfg-erp"
                  value={config.erpProvider}
                  onChange={e => updateConfig({ erpProvider: e.target.value as ErpProvider })}
                  className="
                    w-full px-3 py-2 rounded-lg text-sm
                    border border-surface-200 dark:border-surface-700
                    bg-white dark:bg-surface-900
                    text-surface-900 dark:text-surface-100
                    focus:outline-none focus:ring-2
                    focus:ring-brand-100 dark:focus:ring-brand-900
                    focus:border-brand-400 dark:focus:border-brand-500
                    transition-colors duration-150
                    cursor-pointer
                  "
                >
                  {ERP_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FormField>

              {config.erpProvider !== 'none' && (
                <div className="space-y-3 animate-slide-in-up">
                  <FormField label="URL do Webhook" htmlFor="cfg-webhook">
                    <Input
                      id="cfg-webhook"
                      type="url"
                      value={config.erpWebhookUrl}
                      onChange={e => updateConfig({ erpWebhookUrl: e.target.value })}
                      placeholder="https://api.seuserp.com/webhook/danfe"
                      inputMode="url"
                    />
                  </FormField>

                  <div
                    role="note"
                    className="
                      flex items-start gap-2 px-3 py-2.5 rounded-lg
                      bg-brand-50 dark:bg-brand-950/30
                      border border-brand-100 dark:border-brand-900
                      text-xs text-brand-700 dark:text-brand-400
                    "
                  >
                    <svg
                      aria-hidden="true"
                      width="14" height="14" viewBox="0 0 16 16"
                      fill="none" className="shrink-0 mt-0.5"
                    >
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span>
                      Configure o webhook no painel do{' '}
                      <strong>{ERP_OPTIONS.find(o => o.value === config.erpProvider)?.label}</strong>{' '}
                      para enviar XMLs automaticamente.
                    </span>
                  </div>
                </div>
              )}
            </DrawerSection>

            {/* ════ Seção 4 — Import / Export ══════════════════ */}
            <DrawerSection
              title="Backup de Configurações"
              icon={<Save size={14} strokeWidth={2} />}
            >
              <p className="text-xs text-surface-500 dark:text-surface-400">
                Exporte as configurações em JSON para fazer backup ou compartilhar entre dispositivos.
                O token ERP não é exportado por segurança.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {/* Exportar */}
                <button
                  type="button"
                  onClick={exportConfig}
                  className="
                    flex items-center justify-center gap-2
                    px-3 py-2.5 rounded-lg text-xs font-medium
                    border border-surface-200 dark:border-surface-700
                    text-surface-700 dark:text-surface-300
                    hover:bg-surface-50 dark:hover:bg-surface-900
                    hover:border-surface-300 dark:hover:border-surface-600
                    transition-colors duration-150
                  "
                >
                  <Download aria-hidden="true" size={14} strokeWidth={2} />
                  Exportar JSON
                </button>

                {/* Importar */}
                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  className="
                    flex items-center justify-center gap-2
                    px-3 py-2.5 rounded-lg text-xs font-medium
                    border border-surface-200 dark:border-surface-700
                    text-surface-700 dark:text-surface-300
                    hover:bg-surface-50 dark:hover:bg-surface-900
                    hover:border-surface-300 dark:hover:border-surface-600
                    transition-colors duration-150
                  "
                >
                  <FolderOpen aria-hidden="true" size={14} strokeWidth={2} />
                  Importar JSON
                </button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="sr-only"
                  aria-hidden="true"
                  onChange={handleImportJson}
                />
              </div>
            </DrawerSection>

          </div>
        </div>

        {/* ─── Footer do drawer ────────────────────────────── */}
        <div className="
          shrink-0 flex items-center justify-between
          px-5 py-4
          border-t border-surface-100 dark:border-surface-800
          bg-surface-50/50 dark:bg-surface-900/50
        ">
          {/* Resetar */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Resetar todas as configurações para o padrão?')) {
                resetConfig()
              }
            }}
            className="
              flex items-center gap-1.5
              text-xs text-surface-400
              hover:text-danger-600 dark:hover:text-danger-400
              transition-colors duration-150
            "
          >
            <RotateCcw aria-hidden="true" size={12} strokeWidth={2} />
            Resetar configurações
          </button>

          {/* Salvar / Fechar */}
          <button
            type="button"
            onClick={onClose}
            className="
              flex items-center gap-2
              px-4 py-2 rounded-lg
              text-sm font-semibold text-white
              bg-brand-600 hover:bg-brand-700
              dark:bg-brand-600 dark:hover:bg-brand-500
              transition-colors duration-150
              shadow-sm
            "
          >
            <Save aria-hidden="true" size={14} strokeWidth={2} />
            Salvar e Fechar
          </button>
        </div>

      </aside>
    </>
  )
}