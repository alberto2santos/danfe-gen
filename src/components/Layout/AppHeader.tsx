import { useNFe }                from '@/contexts/NFeContext'
import { useTheme }              from '@/contexts/ThemeContext'
import { Sun, Moon, Settings2, FileText, RotateCcw } from 'lucide-react'

interface AppHeaderProps {
  onOpenSettings: () => void
}

export function AppHeader({ onOpenSettings }: AppHeaderProps) {
  const { theme, toggleTheme, isDark } = useTheme()
  const { state, reset }               = useNFe()
  const showReset                      = state.step !== 'upload'

  return (
    <header
      role="banner"
      className="
        sticky top-0 z-50
        border-b border-surface-200 dark:border-surface-800
        bg-white/80 dark:bg-surface-950/80
        backdrop-blur-md
        transition-colors duration-200
      "
    >
      <div className="page-wrapper">
        <div className="flex items-center justify-between h-14 md:h-16">

          {/* ─── Logo + nome ─────────────────────────────────── */}
          <div className="flex items-center gap-2.5 min-w-0">

            {/* Ícone SVG inline */}
            <svg
              aria-hidden="true"
              focusable="false"
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <rect width="32" height="32" rx="8" fill="#2563EB" />
              <rect x="6"  y="8"  width="13" height="2" rx="1" fill="white" />
              <rect x="6"  y="12" width="20" height="2" rx="1" fill="white" />
              <rect x="6"  y="16" width="20" height="2" rx="1" fill="white" />
              <rect x="6"  y="20" width="16" height="2" rx="1" fill="white" />
              <circle cx="24" cy="22" r="5" fill="#16A34A" />
              <path
                d="M21.5 22l1.8 1.8 3.2-3.2"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="min-w-0">
              <span className="
                block font-bold text-base md:text-lg
                text-surface-900 dark:text-surface-50
                leading-tight truncate
              ">
                DanfeGen
              </span>
              <span className="
                hidden sm:block text-xs
                text-surface-500 dark:text-surface-400
                leading-tight
              ">
                Conversor NF-e para DANFE
              </span>
            </div>
          </div>

          {/* ─── Indicador de step ───────────────────────────── */}
          {state.step !== 'upload' && (
            <nav
              aria-label="Progresso da conversão"
              className="hidden md:flex items-center gap-1"
            >
              {(
                [
                  { id: 'upload',   label: 'Upload'    },
                  { id: 'preview',  label: 'Visualizar' },
                  { id: 'download', label: 'Download'   },
                ] as const
              ).map((s, i) => {
                const steps: string[] = ['upload', 'preview', 'download']
                const current         = steps.indexOf(state.step)
                const thisIdx         = steps.indexOf(s.id)
                const isDone          = thisIdx < current
                const isActive        = s.id === state.step

                return (
                  <div key={s.id} className="flex items-center gap-1">
                    {/* Conector */}
                    {i > 0 && (
                      <div
                        aria-hidden="true"
                        className={`
                          w-6 h-px
                          ${isDone || isActive
                            ? 'bg-brand-500'
                            : 'bg-surface-200 dark:bg-surface-700'}
                        `}
                      />
                    )}

                    {/* Step */}
                    <div
                      aria-current={isActive ? 'step' : undefined}
                      className={`
                        flex items-center gap-1.5 px-2.5 py-1
                        rounded-full text-xs font-medium
                        transition-colors duration-150
                        ${isActive
                          ? 'bg-brand-600 text-white'
                          : isDone
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                            : 'text-surface-400 dark:text-surface-600'}
                      `}
                    >
                      {isDone ? (
                        <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <span aria-hidden="true">{i + 1}</span>
                      )}
                      {s.label}
                    </div>
                  </div>
                )
              })}
            </nav>
          )}

          {/* ─── Ações ──────────────────────────────────────── */}
          <div className="flex items-center gap-1 md:gap-2">

            {/* Botão resetar — aparece fora do step upload */}
            {showReset && (
              <button
                type="button"
                onClick={reset}
                title="Converter outro XML"
                aria-label="Voltar e converter outro XML"
                className="
                  touch-target
                  flex items-center gap-1.5
                  px-2.5 py-1.5 rounded-lg text-xs font-medium
                  text-surface-600 dark:text-surface-400
                  hover:bg-surface-100 dark:hover:bg-surface-800
                  transition-colors duration-150
                "
              >
                <RotateCcw
                  aria-hidden="true"
                  size={14}
                  strokeWidth={2}
                />
                <span className="hidden sm:inline">Novo XML</span>
              </button>
            )}

            {/* Botão dark mode */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
              aria-pressed={isDark}
              className="
                touch-target
                flex items-center justify-center
                w-8 h-8 md:w-9 md:h-9 rounded-lg
                text-surface-500 dark:text-surface-400
                hover:bg-surface-100 dark:hover:bg-surface-800
                hover:text-surface-900 dark:hover:text-surface-50
                transition-colors duration-150
              "
            >
              {isDark ? (
                <Sun aria-hidden="true" size={16} strokeWidth={2} />
              ) : (
                <Moon aria-hidden="true" size={16} strokeWidth={2} />
              )}
            </button>

            {/* Botão configurações */}
            <button
              type="button"
              onClick={onOpenSettings}
              title="Configurações da empresa"
              aria-label="Abrir configurações da empresa"
              className="
                touch-target
                flex items-center gap-1.5
                px-3 py-1.5 rounded-lg
                text-xs font-medium
                border border-surface-200 dark:border-surface-700
                text-surface-700 dark:text-surface-300
                hover:bg-surface-100 dark:hover:bg-surface-800
                hover:border-surface-300 dark:hover:border-surface-600
                transition-colors duration-150
              "
            >
              <Settings2 aria-hidden="true" size={14} strokeWidth={2} />
              <span className="hidden sm:inline">Configurações</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  )
}