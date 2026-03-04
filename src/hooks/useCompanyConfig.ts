import { useCompany } from '@/contexts/CompanyContext'

// Re-exporta o contexto com nome alternativo
// para compatibilidade com imports legados
export function useCompanyConfig() {
  return useCompany()
}