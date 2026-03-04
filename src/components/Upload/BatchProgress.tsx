import { Progress } from '@/components/UI/Progress'
import { Spinner }  from '@/components/UI/Spinner'

export interface BatchItem {
  id:       string
  name:     string
  status:   'pending' | 'processing' | 'done' | 'error'
  error?:   string
}

interface BatchProgressProps {
  items:    BatchItem[]
  current:  number
  total:    number
}

const STATUS_ICON: Record<BatchItem['status'], React.ReactNode> = {
  pending:    <span className="w-4 h-4 rounded-full border-2 border-surface-300 dark:border-surface-600" />,
  processing: <Spinner size="sm" />,
  done: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-green-500">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-red-500">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M10 6L6 10M6 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
}

export function BatchProgress({ items, current, total }: BatchProgressProps) {
  const pct  = total > 0 ? Math.round((current / total) * 100) : 0
  const done = items.filter(i => i.status === 'done').length
  const errs = items.filter(i => i.status === 'error').length

  return (
    <div className="card p-4 space-y-4">
      {/* Barra geral */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-surface-500">
          <span>Processando lote</span>
          <span className="font-mono">{current}/{total}</span>
        </div>
        <Progress
          value={current}
          max={total}
          variant={errs > 0 ? 'warning' : 'brand'}
          size="md"
        />
        <div className="flex items-center gap-3 text-xs">
          <span className="text-green-600 dark:text-green-400">✓ {done} concluídos</span>
          {errs > 0 && (
            <span className="text-red-600 dark:text-red-400">✗ {errs} com erro</span>
          )}
        </div>
      </div>

      {/* Lista de itens */}
      <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {items.map(item => (
          <li
            key={item.id}
            className={`
              flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs
              ${item.status === 'processing' ? 'bg-brand-50 dark:bg-brand-950/30' : ''}
              ${item.status === 'error'      ? 'bg-red-50 dark:bg-red-950/20' : ''}
            `}
          >
            <span className="shrink-0">{STATUS_ICON[item.status]}</span>
            <span className={`flex-1 truncate ${item.status === 'error' ? 'text-red-700 dark:text-red-400' : 'text-surface-700 dark:text-surface-300'}`}>
              {item.name}
            </span>
            {item.error && (
              <span className="text-red-500 truncate max-w-[120px]" title={item.error}>
                {item.error}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}