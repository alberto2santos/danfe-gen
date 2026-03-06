import { Progress } from '@/components/UI/Progress'
import { Spinner }  from '@/components/UI/Spinner'
import { CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react'

/* ─── Tipos  */
export interface BatchItem {
  id:      string
  name:    string
  status:  'pending' | 'processing' | 'done' | 'error'
  error?:  string
}

interface BatchProgressProps {
  items:   BatchItem[]
  current: number
  total:   number
}

/* ─── Ícones por status  */
const STATUS_ICON: Record<BatchItem['status'], React.ReactNode> = {
  pending: (
    <Clock
      size={15} strokeWidth={1.8}
      className="text-surface-400 dark:text-surface-600"
    />
  ),
  processing: <Spinner size="sm" />,
  done: (
    <CheckCircle2
      size={15} strokeWidth={1.8}
      className="text-emerald-500 dark:text-emerald-400"
    />
  ),
  error: (
    <AlertCircle
      size={15} strokeWidth={1.8}
      className="text-danger-500 dark:text-danger-400"
    />
  ),
}

/* ─── Componente  */
export function BatchProgress({ items, current, total }: BatchProgressProps) {
  const pct  = total > 0 ? Math.round((current / total) * 100) : 0
  const done = items.filter(i => i.status === 'done').length
  const errs = items.filter(i => i.status === 'error').length
  const pend = items.filter(i => i.status === 'pending').length

  const isFinished = current === total && total > 0

  return (
    <div className="card p-4 space-y-4">

      {/* Barra de progresso geral */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isFinished && <Loader2 size={14} className="animate-spin text-brand-500" />}
            <span className="text-xs font-medium text-surface-700 dark:text-surface-300">
              {isFinished
                ? errs === 0
                  ? '✅ Lote concluído com sucesso'
                  : `⚠️ Lote concluído com ${errs} erro${errs > 1 ? 's' : ''}`
                : 'Processando lote…'}
            </span>
          </div>
          <span className="text-xs font-mono text-surface-500 dark:text-surface-400">
            {pct}%
          </span>
        </div>

        <Progress
          value={current}
          max={total}
          variant={errs > 0 ? 'warning' : 'brand'}
          size="md"
        />

        <div className="flex items-center gap-4 text-xs">
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            ✓ {done} concluídos
          </span>
          {pend > 0 && (
            <span className="text-surface-400 dark:text-surface-500">
              ⏳ {pend} aguardando
            </span>
          )}
          {errs > 0 && (
            <span className="text-danger-600 dark:text-danger-400 font-medium">
              ✗ {errs} com erro
            </span>
          )}
          <span className="ml-auto text-surface-400 dark:text-surface-500 font-mono">
            {current}/{total}
          </span>
        </div>
      </div>

      {/* Lista de itens */}
      <ul
        role="list"
        aria-label="Status de cada NF-e no lote"
        className="space-y-1 max-h-56 overflow-y-auto pr-1"
      >
        {items.map(item => (
          <li
            key={item.id}
            className={`
              flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs
              transition-colors duration-150
              ${item.status === 'processing'
                ? 'bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900'
                : item.status === 'done'
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20'
                  : item.status === 'error'
                    ? 'bg-danger-50 dark:bg-danger-950/20'
                    : ''}
            `}
          >
            {/* Ícone de status */}
            <span className="shrink-0" aria-hidden="true">
              {STATUS_ICON[item.status]}
            </span>

            {/* Nome do arquivo */}
            <span className={`
              flex-1 truncate font-medium
              ${item.status === 'error'
                ? 'text-danger-700 dark:text-danger-400'
                : item.status === 'done'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-surface-700 dark:text-surface-300'}
            `}>
              {item.name}
            </span>

            {/* Mensagem de erro inline */}
            {item.error && (
              <span
                title={item.error}
                className="shrink-0 text-danger-500 dark:text-danger-400 truncate max-w-[130px]"
              >
                {item.error}
              </span>
            )}
          </li>
        ))}
      </ul>

    </div>
  )
}