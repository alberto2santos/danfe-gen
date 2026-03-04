import { FileText, Shield, Github } from 'lucide-react'

export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      role="contentinfo"
      className="
        mt-auto
        border-t border-surface-200 dark:border-surface-800
        bg-white dark:bg-surface-950
        transition-colors duration-200
      "
    >
      <div className="page-wrapper">
        <div className="
          flex flex-col sm:flex-row
          items-center justify-between
          gap-3 py-4 md:py-5
          text-xs text-surface-400 dark:text-surface-500
        ">

          {/* ─── Esquerda — marca + direitos ────────────────── */}
          <div className="flex items-center gap-2">
            <svg
              aria-hidden="true"
              focusable="false"
              width="18"
              height="18"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-60"
            >
              <rect width="32" height="32" rx="8" fill="#2563EB"/>
              <rect x="6"  y="8"  width="13" height="2" rx="1" fill="white"/>
              <rect x="6"  y="12" width="20" height="2" rx="1" fill="white"/>
              <rect x="6"  y="16" width="20" height="2" rx="1" fill="white"/>
              <rect x="6"  y="20" width="16" height="2" rx="1" fill="white"/>
              <circle cx="24" cy="22" r="5" fill="#16A34A"/>
              <path d="M21.5 22l1.8 1.8 3.2-3.2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>
              DanfeGen © {year}
              <span className="mx-1.5 opacity-40">—</span>
              Alberto Luiz
            </span>
          </div>

          {/* ─── Centro — avisos LGPD ───────────────────────── */}
          <div
            role="note"
            aria-label="Aviso de privacidade"
            className="flex items-center gap-1.5 text-center sm:text-left"
          >
            <Shield
              aria-hidden="true"
              size={12}
              strokeWidth={2}
              className="shrink-0 text-success-600"
            />
            <span>
              Nenhum XML é armazenado. Processado localmente no seu navegador.
            </span>
          </div>

          {/* ─── Direita — links ────────────────────────────── */}
          <nav aria-label="Links do rodapé">
            <ul className="flex items-center gap-3 list-none p-0 m-0">
              <li>
                <a
                  href="https://www.nfe.fazenda.gov.br/portal/principal.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Portal NF-e SEFAZ (abre em nova aba)"
                  className="
                    flex items-center gap-1
                    hover:text-brand-600 dark:hover:text-brand-400
                    transition-colors duration-150
                  "
                >
                  <FileText aria-hidden="true" size={12} strokeWidth={2} />
                  SEFAZ
                </a>
              </li>
              <li aria-hidden="true" className="opacity-30">·</li>
              <li>
                <a
                  href="https://github.com/alberto2santos/danfe-gen"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Repositório DanfeGen no GitHub (abre em nova aba)"
                  className="
                    flex items-center gap-1
                    hover:text-brand-600 dark:hover:text-brand-400
                    transition-colors duration-150
                  "
                >
                  <Github aria-hidden="true" size={12} strokeWidth={2} />
                  GitHub
                </a>
              </li>
            </ul>
          </nav>

        </div>
      </div>
    </footer>
  )
}