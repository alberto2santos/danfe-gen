import type { HelpSection as HelpSectionType } from '@/content/help.content'
import { useState }                             from 'react'
import { FileText, AlertCircle, CheckCircle2, Info } from 'lucide-react'

/* ─── Imagem real com fallback para placeholder ──────────────── */
function ImgPlaceholder({ file, alt }: { file: string; alt: string }) {
  const [errored, setErrored] = useState(false)

  if (!errored) {
    return (
      <img
        src={`/help/${file}`}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setErrored(true)}
        className="
          w-full h-auto rounded-lg
          border border-surface-200 dark:border-surface-700
          object-contain
        "
      />
    )
  }

  /* ─── Fallback enquanto a imagem não existe ──────────────── */
  return (
    <div
      role="img"
      aria-label={alt}
      className="
        w-full rounded-lg overflow-hidden
        border border-surface-200 dark:border-surface-700
        bg-surface-50 dark:bg-surface-900
        flex flex-col items-center justify-center gap-2
        text-surface-300 dark:text-surface-600
        py-8
      "
      style={{ aspectRatio: '16/9' }}
    >
      <FileText size={28} strokeWidth={1} aria-hidden="true" />
      <span className="text-[10px] font-mono">{file}</span>
    </div>
  )
}

/* ─── Passo numerado ─────────────────────────────────────────── */
function Step({ number, title, content }: {
  number:  number
  title:   string
  content: string
}) {
  return (
    <div className="flex gap-3">
      <div className="
        shrink-0 flex items-center justify-center
        w-6 h-6 rounded-full mt-0.5
        bg-brand-600 dark:bg-brand-500
        text-white text-xs font-bold
      ">
        {number}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">
          {title}
        </p>
        <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
          {content.trim()}
        </p>
      </div>
    </div>
  )
}

/* ─── Caixa de dica ──────────────────────────────────────────── */
function Tip({ type, content }: {
  type:    'info' | 'warning' | 'success'
  content: string
}) {
  const styles = {
    info:    'bg-brand-50 border-brand-100 text-brand-700 dark:bg-brand-950/30 dark:border-brand-900 dark:text-brand-400',
    warning: 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400',
  }

  const Icon = {
    info:    Info,
    warning: AlertCircle,
    success: CheckCircle2,
  }[type]

  return (
    <div className={`
      flex items-start gap-2
      px-3 py-2.5 rounded-lg border
      text-xs leading-relaxed
      ${styles[type]}
    `}>
      <Icon aria-hidden="true" size={14} className="shrink-0 mt-0.5" strokeWidth={2} />
      <span>{content.trim()}</span>
    </div>
  )
}

/* ─── Componente principal ───────────────────────────────────── */
interface HelpSectionProps {
  section:     HelpSectionType
  showImages?: boolean
}

export function HelpSection({ section, showImages = true }: HelpSectionProps) {
  return (
    <div className="space-y-4">

      {/* Título da seção */}
      <h3 className="
        text-xs font-semibold uppercase tracking-wide
        text-surface-500 dark:text-surface-400
      ">
        {section.title}
      </h3>

      {/* Conteúdo introdutório */}
      {section.content && (
        <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
          {section.content.trim()}
        </p>
      )}

      {/* Passos */}
      {section.steps && section.steps.length > 0 && (
        <div className="space-y-4">
          {section.steps.map((step, i) => (
            <Step
              key={i}
              number={i + 1}
              title={step.title}
              content={step.content}
            />
          ))}
        </div>
      )}

      {/* Imagens — só na /ajuda (showImages=true), ocultas no modal */}
      {showImages && section.images && section.images.length > 0 && (
        <div className="space-y-3">
          {section.images.map(img => (
            <ImgPlaceholder
              key={img.file}
              file={img.file}
              alt={img.alt}
            />
          ))}
        </div>
      )}

      {/* Dicas */}
      {section.tips && section.tips.length > 0 && (
        <div className="space-y-2">
          {section.tips.map((tip, i) => (
            <Tip
              key={i}
              type={tip.type}
              content={tip.content}
            />
          ))}
        </div>
      )}

    </div>
  )
}