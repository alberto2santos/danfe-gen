import { useState }       from 'react'
import { ChevronDown }    from 'lucide-react'
import { HELP_FAQ }       from '@/content/help.content'

export function HelpFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => setOpenIndex(prev => prev === i ? null : i)

  return (
    <div className="space-y-2">

      <h3 className="
        text-xs font-semibold uppercase tracking-wide
        text-surface-500 dark:text-surface-400 mb-3
      ">
        Perguntas Frequentes
      </h3>

      {HELP_FAQ.map((item, i) => {
        const isOpen = openIndex === i

        return (
          <div
            key={i}
            className="
              rounded-xl overflow-hidden
              border border-surface-100 dark:border-surface-800
              transition-colors duration-150
            "
          >
            {/* Pergunta */}
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${i}`}
              id={`faq-question-${i}`}
              className="
                w-full flex items-center justify-between
                px-4 py-3 text-left gap-3
                bg-surface-50 dark:bg-surface-900
                hover:bg-surface-100 dark:hover:bg-surface-800
                transition-colors duration-150
                focus:outline-none focus-visible:ring-2
                focus-visible:ring-brand-400 focus-visible:ring-inset
              "
            >
              <span className="
                text-xs font-medium
                text-surface-800 dark:text-surface-100
                leading-snug
              ">
                {item.question}
              </span>
              <ChevronDown
                aria-hidden="true"
                size={14}
                strokeWidth={2.5}
                className={`
                  shrink-0 text-surface-400
                  transition-transform duration-200
                  ${isOpen ? 'rotate-180' : 'rotate-0'}
                `}
              />
            </button>

            {/* Resposta */}
            <div
              id={`faq-answer-${i}`}
              role="region"
              aria-labelledby={`faq-question-${i}`}
              hidden={!isOpen}
              className="
                px-4 py-3
                bg-white dark:bg-surface-950
                border-t border-surface-100 dark:border-surface-800
              "
            >
              <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
                {item.answer.trim()}
              </p>
            </div>
          </div>
        )
      })}

    </div>
  )
}