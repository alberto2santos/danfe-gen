import { useState }          from 'react'
import { NFeProvider }       from '@/contexts/NFeContext'
import { CompanyProvider }   from '@/contexts/CompanyContext'
import { ThemeProvider }     from '@/contexts/ThemeContext'
import { AppHeader }         from '@/components/Layout/AppHeader'
import { AppFooter }         from '@/components/Layout/AppFooter'
import { UploadZone }        from '@/components/Upload/UploadZone'
import { DanfePreview }      from '@/components/Preview/DanfePreview'
import { CompanyConfig }     from '@/components/Settings/CompanyConfig'
import { useNFe }            from '@/contexts/NFeContext'

/* ─── Wizard — controla qual tela renderizar ──────────────────── */
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

/* ─── Shell — layout com drawer ───────────────────────────────── */
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

/* ─── Root — providers em ordem correta ───────────────────────── */
export default function App() {
  return (
    <ThemeProvider>
      <CompanyProvider>
        <NFeProvider>
          <AppShell />
        </NFeProvider>
      </CompanyProvider>
    </ThemeProvider>
  )
}