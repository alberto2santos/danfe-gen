import { lazy, Suspense, useState } from 'react'
import { Routes, Route }            from 'react-router-dom'
import { NFeProvider }              from '@/contexts/NFeContext'
import { CompanyProvider }          from '@/contexts/CompanyContext'
import { ThemeProvider }            from '@/contexts/ThemeContext'
import { AppHeader }                from '@/components/Layout/AppHeader'
import { AppFooter }                from '@/components/Layout/AppFooter'
import { UploadZone }               from '@/components/Upload/UploadZone'
import { DanfePreview }             from '@/components/Preview/DanfePreview'
import { CompanyConfig }            from '@/components/Settings/CompanyConfig'
import { useNFe }                   from '@/contexts/NFeContext'

/* ─── HelpPage — lazy load (não faz parte do bundle inicial) ── */
const HelpPage = lazy(() =>
  import('@/pages/HelpPage').then(m => ({ default: m.HelpPage }))
)

/* ─── Spinner de fallback do Suspense ────────────────────────── */
function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Carregando página"
      className="min-h-dvh flex items-center justify-center bg-surface-50 dark:bg-surface-950"
    >
      <svg
        className="animate-spin-slow"
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="14" cy="14" r="11"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="50 18"
          strokeLinecap="round"
          className="text-brand-600 dark:text-brand-400"
        />
      </svg>
    </div>
  )
}

/* ─── Wizard — controla qual tela renderizar ─────────────────── */
function AppWizard() {
  const { state } = useNFe()
  const { step }  = state

  return (
    <main
      id="main-content"
      className="flex-1 flex flex-col"
      aria-label="Conteúdo principal"
    >
      {step === 'upload' && (
        <section
          id="upload-zone"
          aria-label="Upload de XML NF-e"
          className="flex-1 flex flex-col items-center justify-center px-4 py-12 animate-fade-in"
        >
          <UploadZone />
        </section>
      )}

      {(step === 'preview' || step === 'download') && (
        <section
          aria-label={step === 'preview' ? 'Visualização do DANFE' : 'Download do DANFE'}
          className="flex-1 flex flex-col animate-fade-in-scale"
        >
          <DanfePreview />
        </section>
      )}
    </main>
  )
}

/* ─── Shell — layout principal com drawer ────────────────────── */
function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-dvh flex flex-col bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-surface-50 transition-colors duration-200">
      <AppHeader onOpenSettings={() => setDrawerOpen(true)} />
      <AppWizard />
      <AppFooter />
      <CompanyConfig
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}

/* ─── Root — providers + rotas ───────────────────────────────── */
export default function App() {
  return (
    <ThemeProvider>
      <CompanyProvider>
        <NFeProvider>
          <Routes>

            {/* ─── App principal ──────────────────────────── */}
            <Route
              path="/"
              element={<AppShell />}
            />

            {/* ─── Documentação completa — lazy loaded ────── */}
            <Route
              path="/ajuda"
              element={
                <Suspense fallback={<PageLoader />}>
                  <HelpPage />
                </Suspense>
              }
            />

            {/* ─── Fallback — rota desconhecida ────────────── */}
            <Route
              path="*"
              element={<AppShell />}
            />

          </Routes>
        </NFeProvider>
      </CompanyProvider>
    </ThemeProvider>
  )
}