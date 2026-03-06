// src/pages/HelpPage.tsx
import { useState, useEffect }  from 'react'
import { useNavigate }          from 'react-router-dom'
import {
  ArrowLeft,
  HelpCircle,
  FileText,
  Printer,
  Download,
  Mail,
  Share2,
  Settings,
  Plug,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Search,
}                               from 'lucide-react'
import {
  HELP_TABS,
  HELP_FAQ,
  HELP_GLOSSARY,
  HELP_ERPS,
}                               from '@/content/help.content'
import { HelpSection }          from '@/components/Help/HelpSection'
import { HelpFAQ }              from '@/components/Help/HelpFAQ'
import { HelpSearch }           from '@/components/Help/HelpSearch'

/* ─── Ícones por tab ──────────────────────────────────────────── */
const TAB_ICONS: Record<string, React.ReactNode> = {
  inicio:        <HelpCircle  size={16} strokeWidth={2} />,
  imprimir:      <Printer     size={16} strokeWidth={2} />,
  exportar:      <Download    size={16} strokeWidth={2} />,
  email:         <Mail        size={16} strokeWidth={2} />,
  compartilhar:  <Share2      size={16} strokeWidth={2} />,
  configuracoes: <Settings    size={16} strokeWidth={2} />,
  erp:           <Plug        size={16} strokeWidth={2} />,
}

/* ─── Componente principal ────────────────────────────────────── */
export function HelpPage() {
  const navigate                        = useNavigate()
  const [activeTab, setActiveTab]       = useState(HELP_TABS[0]!.id)
  const [sidebarOpen, setSidebarOpen]   = useState(false)

  /* ─── Sincroniza hash da URL com a tab ───────────────────── */
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    const match = HELP_TABS.find(t => t.id === hash)
    if (match) setActiveTab(match.id)
  }, [])

  const handleTabChange = (id: string) => {
    setActiveTab(id)
    window.location.hash = id
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const currentTab = HELP_TABS.find(t => t.id === activeTab)

  return (
    <div className="min-h-dvh flex flex-col bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-50 transition-colors duration-200">

      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="
        sticky top-0 z-50
        border-b border-surface-200 dark:border-surface-800
        bg-white/80 dark:bg-surface-950/80
        backdrop-blur-md
      ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-14 md:h-16">

            {/* Voltar */}
            <button
              type="button"
              onClick={() => navigate('/')}
              aria-label="Voltar para o DanfeGen"
              className="
                flex items-center gap-1.5
                text-xs font-medium
                text-surface-500 dark:text-surface-400
                hover:text-brand-600 dark:hover:text-brand-400
                transition-colors duration-150
              "
            >
              <ArrowLeft size={14} strokeWidth={2} />
              <span className="hidden sm:inline">Voltar</span>
            </button>

            <div className="h-4 w-px bg-surface-200 dark:bg-surface-700" />

            {/* Título */}
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-brand-600 dark:text-brand-400" />
              <span className="text-sm font-semibold text-surface-900 dark:text-surface-50">
                Central de Ajuda
              </span>
              <ChevronRight size={12} className="text-surface-300 dark:text-surface-600" />
              <span className="text-sm text-surface-500 dark:text-surface-400 hidden sm:inline">
                {currentTab?.label}
              </span>
            </div>

            {/* Busca — desktop */}
            <div className="ml-auto w-64 hidden md:block">
              <HelpSearch onSelectTab={handleTabChange} />
            </div>

            {/* Menu mobile */}
            <button
              type="button"
              onClick={() => setSidebarOpen(v => !v)}
              aria-label="Abrir menu de seções"
              className="
                md:hidden ml-auto
                flex items-center justify-center
                w-8 h-8 rounded-lg
                text-surface-500 hover:text-surface-700 dark:hover:text-surface-200
                hover:bg-surface-100 dark:hover:bg-surface-800
                transition-colors duration-150
              "
            >
              <Search size={16} strokeWidth={2} />
            </button>

          </div>

          {/* Busca — mobile */}
          {sidebarOpen && (
            <div className="md:hidden py-3 border-t border-surface-100 dark:border-surface-800">
              <HelpSearch onSelectTab={handleTabChange} />
            </div>
          )}
        </div>
      </header>

      {/* ─── Body ───────────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* ─── Sidebar ──────────────────────────────────── */}
          <aside className="
            hidden md:flex flex-col
            w-56 shrink-0
          ">
            {/* Navegação principal */}
            <nav aria-label="Seções de ajuda">
              <p className="
                text-[10px] font-semibold uppercase tracking-widest
                text-surface-400 dark:text-surface-600
                mb-3 px-3
              ">
                Seções
              </p>
              <ul className="space-y-0.5">
                {HELP_TABS.map(tab => (
                  <li key={tab.id}>
                    <button
                      type="button"
                      onClick={() => handleTabChange(tab.id)}
                      aria-current={activeTab === tab.id ? 'page' : undefined}
                      className={`
                        w-full flex items-center gap-2.5
                        px-3 py-2 rounded-lg text-xs font-medium text-left
                        transition-colors duration-150
                        ${activeTab === tab.id
                          ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400'
                          : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'}
                      `}
                    >
                      <span aria-hidden="true" className={activeTab === tab.id ? 'text-brand-600 dark:text-brand-400' : 'text-surface-400'}>
                        {TAB_ICONS[tab.id]}
                      </span>
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Divisor */}
            <div className="my-5 border-t border-surface-100 dark:border-surface-800" />

            {/* Glossário rápido */}
            <div>
              <p className="
                text-[10px] font-semibold uppercase tracking-widest
                text-surface-400 dark:text-surface-600
                mb-3 px-3
              ">
                Glossário
              </p>
              <ul className="space-y-2 px-3">
                {HELP_GLOSSARY.map(item => (
                  <li key={item.term}>
                    <span className="
                      text-[10px] font-mono font-bold
                      px-1.5 py-0.5 rounded
                      bg-surface-100 dark:bg-surface-800
                      text-surface-700 dark:text-surface-300
                      mr-1.5
                    ">
                      {item.term}
                    </span>
                    <span className="text-[10px] text-surface-400 dark:text-surface-500 leading-relaxed">
                      {item.definition}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Divisor */}
            <div className="my-5 border-t border-surface-100 dark:border-surface-800" />

            {/* Link GitHub */}
            <a
              href="https://github.com/alberto2santos/danfe-gen"
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex items-center gap-2 px-3 py-2 rounded-lg
                text-xs text-surface-500 dark:text-surface-400
                hover:text-brand-600 dark:hover:text-brand-400
                hover:bg-surface-100 dark:hover:bg-surface-800
                transition-colors duration-150
              "
            >
              <ExternalLink size={13} strokeWidth={2} />
              Ver no GitHub
            </a>
          </aside>

          {/* ─── Conteúdo principal ───────────────────────── */}
          <main className="flex-1 min-w-0">

            {/* Tabs — mobile horizontal scroll */}
            <div className="
              md:hidden flex items-center gap-1
              overflow-x-auto scrollbar-none
              mb-6 pb-1
            ">
              {HELP_TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex items-center gap-1.5
                    px-3 py-2 rounded-lg shrink-0
                    text-xs font-medium whitespace-nowrap
                    transition-colors duration-150
                    ${activeTab === tab.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'}
                  `}
                >
                  <span aria-hidden="true">{TAB_ICONS[tab.id]}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Título da tab */}
            <div className="flex items-center gap-3 mb-8">
              <div className="
                flex items-center justify-center
                w-9 h-9 rounded-xl
                bg-brand-50 dark:bg-brand-950/40
                text-brand-600 dark:text-brand-400
              ">
                {TAB_ICONS[activeTab]}
              </div>
              <div>
                <h1 className="text-lg font-bold text-surface-900 dark:text-surface-50">
                  {currentTab?.label}
                </h1>
                <p className="text-xs text-surface-400 dark:text-surface-500">
                  {currentTab?.sections.length} seção{currentTab?.sections && currentTab.sections.length !== 1 ? 'ões' : ''}
                </p>
              </div>
            </div>

            {/* Seções da tab */}
            <div className="space-y-10">
              {currentTab?.sections.map((section, i) => (
                <div
                  key={section.id}
                  className="
                    card p-6
                    animate-fade-in
                  "
                >
                  <HelpSection
                    section={section}
                    showImages={true}
                  />

                  {/* ERPs suportados — só na tab ERP */}
                  {activeTab === 'erp' && section.id === 'erps-suportados' && (
                    <div className="mt-4 space-y-2">
                      {HELP_ERPS.map(erp => (
                        <div
                          key={erp.name}
                          className="
                            flex items-center justify-between gap-4
                            px-4 py-3 rounded-xl
                            bg-surface-50 dark:bg-surface-900
                            border border-surface-100 dark:border-surface-800
                          "
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-surface-800 dark:text-surface-100">
                              {erp.name}
                            </p>
                            <p className="text-[10px] text-surface-400 dark:text-surface-500 truncate">
                              {erp.path}
                            </p>
                          </div>
                          <a
                            href={erp.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                              shrink-0
                              flex items-center gap-1
                              text-[10px] font-medium
                              text-brand-600 dark:text-brand-400
                              hover:underline
                            "
                          >
                            Docs
                            <ExternalLink size={10} strokeWidth={2} />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ─── Navegação entre tabs ──────────────────── */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-surface-100 dark:border-surface-800">
              {(() => {
                const idx  = HELP_TABS.findIndex(t => t.id === activeTab)
                const prev = HELP_TABS[idx - 1]
                const next = HELP_TABS[idx + 1]
                return (
                  <>
                    {prev ? (
                      <button
                        type="button"
                        onClick={() => handleTabChange(prev.id)}
                        className="
                          flex items-center gap-2
                          text-xs font-medium
                          text-surface-500 dark:text-surface-400
                          hover:text-brand-600 dark:hover:text-brand-400
                          transition-colors duration-150
                        "
                      >
                        <ArrowLeft size={13} strokeWidth={2} />
                        {prev.label}
                      </button>
                    ) : <div />}

                    {next ? (
                      <button
                        type="button"
                        onClick={() => handleTabChange(next.id)}
                        className="
                          flex items-center gap-2
                          text-xs font-medium
                          text-surface-500 dark:text-surface-400
                          hover:text-brand-600 dark:hover:text-brand-400
                          transition-colors duration-150
                        "
                      >
                        {next.label}
                        <ChevronRight size={13} strokeWidth={2} />
                      </button>
                    ) : <div />}
                  </>
                )
              })()}
            </div>

            {/* ─── FAQ ──────────────────────────────────── */}
            <div className="mt-12 card p-6">
              <HelpFAQ />
            </div>

            {/* ─── Rodapé da página ─────────────────────── */}
            <div className="
              mt-8 py-6
              border-t border-surface-100 dark:border-surface-800
              flex flex-col sm:flex-row items-center justify-between gap-3
              text-xs text-surface-400 dark:text-surface-600
            ">
              <span>DanfeGen — Documentação v1.0</span>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/alberto2santos/danfe-gen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1"
                >
                  GitHub
                  <ExternalLink size={10} />
                </a>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Abrir DanfeGen
                </button>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  )
}