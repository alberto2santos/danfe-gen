interface ProgressProps {
  value:      number        // 0–100
  max?:       number
  label?:     string
  showValue?: boolean
  size?:      'sm' | 'md' | 'lg'
  variant?:   'brand' | 'success' | 'warning' | 'danger'
  className?: string
}

const TRACK_H  = { sm: 'h-1', md: 'h-2', lg: 'h-3' }
const VARIANTS = {
  brand:   'bg-brand-600 dark:bg-brand-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger:  'bg-red-500',
}

export function Progress({
  value,
  max       = 100,
  label,
  showValue = false,
  size      = 'md',
  variant   = 'brand',
  className = '',
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label    && <span className="text-xs text-surface-500 dark:text-surface-400">{label}</span>}
          {showValue && <span className="text-xs font-mono text-surface-500 dark:text-surface-400">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className={`w-full rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden ${TRACK_H[size]}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${VARIANTS[variant]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}