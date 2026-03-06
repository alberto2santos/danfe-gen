import { useState, useMemo, useCallback } from 'react'
import { Search, X }                      from 'lucide-react'
import { HELP_TABS, HELP_FAQ }            from '@/content/help.content'

/* ─── Tipos ──────────────────────────────────────────────────── */
interface SearchResult {
  type:     'section' | 'step' | 'faq'
  tabId?:   string
  tabLabel?: string
  title:    string
  snippet:  string
}

/* ─── Indexa o conteúdo para busca ───────────────────────────── */
function buildIndex(): SearchResult[] {
  const index: SearchResult[] = []

  // Indexa seções e passos das tabs
  for (const tab of HELP_TABS) {
    for (const section of tab.sections) {

      // Seção principal
      index.push({
        type:     'section',
        tabId:    tab.id,
        tabLabel: tab.label,
        title:    section.title,
        snippet:  section.content?.trim().slice(0, 120) ?? '',
      })

      // Passos individuais
      if (section.steps) {
        for (const step of section.steps) {
          index.push({
            type:     'step',
            tabId:    tab.id,
            tabLabel: tab.label,
            title:    step.title,
            snippet:  step.content.trim().slice(0, 120),
          })
        }
      }
    }
  }

  // Indexa FAQ
  for (const item of HELP_FAQ) {
    index.push({
      type:    'faq',
      title:   item.question,
      snippet: item.answer.trim().slice(0, 120),
    })
  }

  return index
}

const SEARCH_INDEX = buildIndex()

/* ─── Highlight do termo buscado ─────────────────────────────── */
function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 rounded px-0.5">{part}</mark>
      : part
  )
}

/* ─── Badge de tipo ──────────────────────────────────────────── */
const TYPE_LABEL: Record<SearchResult['type'], string> = {
  section: 'Seção',
  step:    'Passo',
  faq:     'FAQ',
}

const TYPE_COLOR: Record<SearchResult['type'], string> = {
  section: 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400',
  step:    'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
  faq:     'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
}

/* ─── Props ──────────────────────────────────────────────────── */
interface HelpSearchProps {
  onSelectTab?: (tabId: string) => void   // navega para a tab no modal
}

/* ─── Componente ─────────────────────────────────────────────── */
export function HelpSearch({ onSelectTab }: HelpSearchProps) {
  const [query,   setQuery]   = useState('')
  const [focused, setFocused] = useState(false)

  /* ─── Filtra o índice  */
  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []

    return SEARCH_INDEX.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.snippet.toLowerCase().includes(q)
    ).slice(0, 8)   // máx. 8 resultados
  }, [query])

  const clearSearch = useCallback(() => setQuery(''), [])

  const handleSelect = useCallback((result: SearchResult) => {
    if (result.tabId && onSelectTab) {
      onSelectTab(result.tabId)
    }
    clearSearch()
  }, [onSelectTab, clearSearch])

  const showDropdown = focused && query.length >= 2

  return (
    <div className="relative w-full">

      {/* Campo de busca */}
      <div className={`
        flex items-center gap-2
        px-3 py-2.5 rounded-xl
        border transition-colors duration-150
        ${focused
          ? 'border-brand-400 dark:border-brand-500 ring-2 ring-brand-100 dark:ring-brand-900/50'
          : 'border-surface-200 dark:border-surface-700'}
        bg-white dark:bg-surface-950
      `}>
        <Search
          aria-hidden="true"
          size={14}
          strokeWidth={2}
          className="shrink-0 text-surface-400"
        />

        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Buscar na ajuda…"
          aria-label="Buscar na documentação de ajuda"
          aria-autocomplete="list"
          aria-controls={showDropdown ? 'help-search-results' : undefined}
          aria-expanded={showDropdown}
          className="
            flex-1 bg-transparent text-xs
            text-surface-800 dark:text-surface-100
            placeholder:text-surface-400 dark:placeholder:text-surface-600
            focus:outline-none
          "
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Limpar busca"
            className="
              shrink-0 text-surface-400
              hover:text-surface-700 dark:hover:text-surface-200
              transition-colors duration-150
            "
          >
            <X aria-hidden="true" size={13} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {showDropdown && (
        <div
          id="help-search-results"
          role="listbox"
          aria-label="Resultados da busca"
          className="
            absolute top-full left-0 right-0 z-50 mt-1
            rounded-xl overflow-hidden
            border border-surface-200 dark:border-surface-700
            bg-white dark:bg-surface-950
            shadow-lg
            max-h-72 overflow-y-auto
          "
        >
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-surface-400 dark:text-surface-600">
              Nenhum resultado para <strong className="text-surface-600 dark:text-surface-400">"{query}"</strong>
            </div>
          ) : (
            <ul>
              {results.map((result, i) => (
                <li key={i} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onMouseDown={() => handleSelect(result)}
                    className="
                      w-full flex flex-col gap-1
                      px-4 py-3 text-left
                      hover:bg-surface-50 dark:hover:bg-surface-900
                      border-b border-surface-50 dark:border-surface-800 last:border-0
                      transition-colors duration-100
                    "
                  >
                    {/* Linha superior: badge + tab */}
                    <div className="flex items-center gap-2">
                      <span className={`
                        text-[10px] font-medium px-1.5 py-0.5 rounded
                        ${TYPE_COLOR[result.type]}
                      `}>
                        {TYPE_LABEL[result.type]}
                      </span>
                      {result.tabLabel && (
                        <span className="text-[10px] text-surface-400 dark:text-surface-600">
                          {result.tabLabel}
                        </span>
                      )}
                    </div>

                    {/* Título */}
                    <p className="text-xs font-medium text-surface-800 dark:text-surface-100 leading-snug">
                      {highlight(result.title, query)}
                    </p>

                    {/* Snippet */}
                    {result.snippet && (
                      <p className="text-[10px] text-surface-400 dark:text-surface-500 leading-relaxed line-clamp-2">
                        {highlight(result.snippet, query)}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

    </div>
  )
}