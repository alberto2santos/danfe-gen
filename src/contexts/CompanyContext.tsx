import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { CompanyConfig } from '@/types/company.types'
import { DEFAULT_COMPANY_CONFIG } from '@/types/company.types'

const STORAGE_KEY = 'danfegen-company'

/* ─── Context ─────────────────────────────────────────────────── */
interface CompanyContextValue {
  config:        CompanyConfig
  updateConfig:  (partial: Partial<CompanyConfig>) => void
  resetConfig:   () => void
  exportConfig:  () => void
  importConfig:  (json: string) => boolean
}

const CompanyContext = createContext<CompanyContextValue | null>(null)

/* ─── Helpers de persistência ─────────────────────────────────── */
function loadFromStorage(): CompanyConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_COMPANY_CONFIG
    const parsed = JSON.parse(raw) as CompanyConfig
    // Migration — garante que versões antigas recebam defaults
    return { ...DEFAULT_COMPANY_CONFIG, ...parsed, version: 1 }
  } catch {
    return DEFAULT_COMPANY_CONFIG
  }
}

function saveToStorage(config: CompanyConfig): void {
  try {
    // Mascara o token ERP antes de salvar (segurança)
    const safe: CompanyConfig = {
      ...config,
      erpWebhookUrl: config.erpWebhookUrl ? '***ENCRYPTED***' : '',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe))
  } catch {
    // quota exceeded — falha silenciosa
  }
}

/* ─── Provider ────────────────────────────────────────────────── */
export function CompanyProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<CompanyConfig>(loadFromStorage)

  // Persiste no localStorage sempre que a config mudar
  useEffect(() => {
    saveToStorage(config)
  }, [config])

  const updateConfig = useCallback((partial: Partial<CompanyConfig>) => {
    setConfig(prev => ({ ...prev, ...partial }))
  }, [])

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_COMPANY_CONFIG)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const exportConfig = useCallback(() => {
    const exportData: CompanyConfig = {
      ...config,
      erpWebhookUrl: '',  // nunca exporta token real
    }
    const blob = new Blob(
      [JSON.stringify(exportData, null, 2)],
      { type: 'application/json' }
    )
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = 'danfegen-config.json'
    link.click()
    URL.revokeObjectURL(url)
  }, [config])

  const importConfig = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as Partial<CompanyConfig>
      if (typeof parsed !== 'object' || parsed === null) return false
      setConfig(prev => ({ ...prev, ...parsed, version: 1 }))
      return true
    } catch {
      return false
    }
  }, [])

  return (
    <CompanyContext.Provider value={{ config, updateConfig, resetConfig, exportConfig, importConfig }}>
      {children}
    </CompanyContext.Provider>
  )
}

/* ─── Hook ────────────────────────────────────────────────────── */
export function useCompany(): CompanyContextValue {
  const ctx = useContext(CompanyContext)
  if (!ctx) throw new Error('useCompany deve ser usado dentro de <CompanyProvider>')
  return ctx
}