import { useState, useCallback } from 'react'
import {
  Download, Printer, FileText,
  ChevronDown, Share2, Mail,
} from 'lucide-react'
import { useNFe } from '@/contexts/NFeContext'
import { useCompany } from '@/contexts/CompanyContext'
import type { DanfeFormat } from '@/types/nfe.types'
import {
  IdentificacaoFields,
  EmitenteFields,
  DestinatarioFields,
  ProdutosFields,
  TotaisFields,
  TransporteFields,
  InformacoesAdicionaisFields,
} from './DanfeFields'
import { formatDate } from '@/utils/formatters'
import { DanfeThermal } from '@/components/Danfe/DanfeThermal'
import { useThermalPrint } from '@/hooks/useThermalPrint'
import { usePdfGenerator } from '@/hooks/usePdfGenerator'

const DEMO_KEY = import.meta.env.VITE_DEMO_KEY ?? 'demo-public-key-2024'

/* ─── Seletor de formato ──────────────────────────────────────── */
interface FormatSelectorProps {
  value: DanfeFormat
  onChange: (f: DanfeFormat) => void
}

function FormatSelector({ value, onChange }: FormatSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Escolha o formato do DANFE"
      className="flex items-center rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden bg-surface-50 dark:bg-surface-900 p-0.5 gap-0.5"
    >
      {(
        [
          {
            id: 'a4' as DanfeFormat,
            label: 'DANFE A4',
            hint: 'Layout oficial SEFAZ',
            icon: (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="3" y="1" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M5 5h6M5 7.5h6M5 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            ),
          },
          {
            id: 'thermal' as DanfeFormat,
            label: 'Etiqueta 80mm',
            hint: 'Impressora térmica',
            icon: (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="4" y="1" width="8" height="11" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <path d="M6 4h4M6 6.5h4M6 9h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M2 12h12v2.5a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 2 14.5V12z" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            ),
          },
        ] as const
      ).map(opt => (
        <button
          key={opt.id}
          type="button"
          role="radio"
          aria-checked={value === opt.id}
          onClick={() => onChange(opt.id)}
          title={opt.hint}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg
            text-xs font-medium transition-all duration-150
            ${value === opt.id
              ? 'bg-white dark:bg-surface-800 text-brand-700 dark:text-brand-300 shadow-sm border border-surface-200 dark:border-surface-600'
              : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'}
          `}
        >
          {opt.icon}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

/* ─── Badge de status da NF-e ─────────────────────────────────── */
function NfeBadge({ tpAmb }: { tpAmb: '1' | '2' }) {
  if (tpAmb === '1') {
    return (
      <span className="badge badge-success" aria-label="NF-e em produção">
        <span aria-hidden="true">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
            <circle cx="4" cy="4" r="4" />
          </svg>
        </span>
        Produção
      </span>
    )
  }
  return (
    <span className="badge badge-warning" aria-label="NF-e em homologação">
      <span aria-hidden="true">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
          <circle cx="4" cy="4" r="4" />
        </svg>
      </span>
      Homologação
    </span>
  )
}

/* ─── Preview principal ───────────────────────────────────────── */
export function DanfePreview() {
  const { state, setFormat, goDownload, reset } = useNFe()
  const { config } = useCompany()
  const { nfe, format, fileName } = state

  const [isGenerating, setIsGenerating] = useState(false)
  const [showAllSections, setShowAllSections] = useState(false)

  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  const { generateA4 } = usePdfGenerator()
  const { print } = useThermalPrint()

  /* ─── Download PDF ────────────────────────────────────────── */
  const handleGenerate = useCallback(async () => {
    if (!nfe) return
    setIsGenerating(true)
    try {
      if (format === 'thermal') {
        await print()
      } else {
        try {
          await generateA4(nfe, config)
          goDownload()
        } catch {
          // Fallback — API
          const res = await fetch('/api/generate-pdf', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-danfegen-key': DEMO_KEY,
            },
            body: JSON.stringify({ mode: 'single', nfeData: nfe, config }),
          })
          if (!res.ok) throw new Error(`API erro ${res.status}`)
          const blob = await res.blob()
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `DANFE-NF${String(nfe.nNF).padStart(9, '0')}-${nfe.serie}.pdf`
          link.click()
          URL.revokeObjectURL(url)
          goDownload()
        }
      }
    } catch {
      window.print()
    } finally {
      setIsGenerating(false)
    }
  }, [nfe, format, config, print, generateA4, goDownload])

  /* ─── Compartilhar via Web Share API ─────────────────────── */
  const handleShare = useCallback(async () => {
    if (!nfe) return
    setIsGenerating(true)

    const pdfName = `DANFE-NF${String(nfe.nNF).padStart(9, '0')}-${nfe.serie}.pdf`

    try {
      // Tenta gerar via API (funciona em produção / vercel dev)
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-danfegen-key': DEMO_KEY,
        },
        body: JSON.stringify({ mode: 'single', nfeData: nfe, config }),
      })

      if (!res.ok) throw new Error(`API erro ${res.status}`)

      const blob = await res.blob()
      const file = new File([blob], pdfName, { type: 'application/pdf' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `DANFE NF-e nº ${nfe.nNF}`,
          text: `DANFE da NF-e nº ${nfe.nNF} — ${nfe.emitente.xNome}`,
          files: [file],
        })
        return
      }

      if (navigator.share) {
        await navigator.share({
          title: `DANFE NF-e nº ${nfe.nNF}`,
          text: `DANFE da NF-e nº ${nfe.nNF} — ${nfe.emitente.xNome}`,
        })
        return
      }

      // Fallback: download direto
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = pdfName
      link.click()
      URL.revokeObjectURL(url)

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return

      // ← API indisponível (dev local): gera PDF via generateA4 + share de texto
      try {
        if (navigator.share) {
          await navigator.share({
            title: `DANFE NF-e nº ${nfe.nNF}`,
            text: `DANFE da NF-e nº ${nfe.nNF} — ${nfe.emitente.xNome}`,
          })
        } else {
          // Sem share: gera o PDF e baixa
          await generateA4(nfe, config)
        }
      } catch {
        // AbortError do share — silencioso
      }

    } finally {
      setIsGenerating(false)
    }
  }, [nfe, config, generateA4])

  /* ─── Enviar por e-mail (mailto:) ─────────────────────────── */
  const handleEmail = useCallback(() => {
    if (!nfe) return
    const destinatario = nfe.destinatario?.email ?? ''
    const assunto = encodeURIComponent(`DANFE NF-e nº ${nfe.nNF} — ${nfe.emitente.xNome}`)
    const corpo = encodeURIComponent(
      `Segue em anexo o DANFE referente à NF-e nº ${nfe.nNF}, série ${nfe.serie}.\n\nEmitente: ${nfe.emitente.xNome}\nData de emissão: ${formatDate(nfe.dhEmi)}\nChave: ${nfe.chNFe}`
    )
    window.open(`mailto:${destinatario}?subject=${assunto}&body=${corpo}`, '_blank')
  }, [nfe])

  if (!nfe) return null

  return (
    <div className="page-wrapper space-y-4 py-6 animate-fade-in">

      {/* ─── Toolbar ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

        {/* Info da NF-e */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-semibold text-surface-900 dark:text-surface-50">
              NF-e nº {nfe.nNF} — Série {nfe.serie}
            </h2>
            <NfeBadge tpAmb={(nfe.tpAmb ?? '1') as '1' | '2'} />
          </div>
          <div className="flex items-center gap-2 text-xs text-surface-400">
            <span>{nfe.emitente.xNome}</span>
            <span aria-hidden="true">·</span>
            <span>{formatDate(nfe.dhEmi)}</span>
            {fileName && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate max-w-[140px]">{fileName}</span>
              </>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">

          <FormatSelector value={format} onChange={setFormat} />

          {/* ─── Baixar PDF / Imprimir ────────────────────── */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            aria-label={format === 'a4' ? 'Baixar PDF A4' : 'Imprimir etiqueta 80mm'}
            className="
              flex items-center gap-2 px-4 py-2.5 rounded-xl
              text-sm font-semibold text-white
              bg-brand-600 hover:bg-brand-700 active:bg-brand-800
              dark:bg-brand-600 dark:hover:bg-brand-500
              transition-colors duration-150
              disabled:opacity-60 disabled:cursor-not-allowed
              shadow-sm
            "
          >
            {isGenerating ? (
              <>
                <svg
                  aria-hidden="true"
                  className="animate-spin-slow"
                  width="16" height="16" viewBox="0 0 16 16"
                  fill="none"
                >
                  <circle
                    cx="8" cy="8" r="6"
                    stroke="white" strokeWidth="2"
                    strokeDasharray="28 8" strokeLinecap="round"
                  />
                </svg>
                <span>Gerando…</span>
              </>
            ) : format === 'a4' ? (
              <>
                <Download aria-hidden="true" size={16} strokeWidth={2} />
                <span>Baixar PDF</span>
              </>
            ) : (
              <>
                <Printer aria-hidden="true" size={16} strokeWidth={2} />
                <span>Imprimir</span>
              </>
            )}
          </button>

          {/* ─── Compartilhar ─────────────────────────────── */}
          {canShare && (
            <button
              type="button"
              onClick={handleShare}
              disabled={isGenerating}
              aria-label="Compartilhar DANFE"
              title="Compartilhar via WhatsApp, Telegram, etc."
              className="
                flex items-center gap-2 px-3 py-2.5 rounded-xl
                text-sm font-medium
                text-surface-600 dark:text-surface-300
                bg-surface-100 dark:bg-surface-800
                hover:bg-surface-200 dark:hover:bg-surface-700
                border border-surface-200 dark:border-surface-700
                transition-colors duration-150
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              <Share2 aria-hidden="true" size={15} strokeWidth={2} />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>
          )}

          {/* ─── Enviar por E-mail ─────────────────────────── */}
          <button
            type="button"
            onClick={handleEmail}
            disabled={isGenerating}
            aria-label="Enviar DANFE por e-mail"
            title="Abre o cliente de e-mail com os dados preenchidos"
            className="
              flex items-center gap-2 px-3 py-2.5 rounded-xl
              text-sm font-medium
              text-surface-600 dark:text-surface-300
              bg-surface-100 dark:bg-surface-800
              hover:bg-surface-200 dark:hover:bg-surface-700
              border border-surface-200 dark:border-surface-700
              transition-colors duration-150
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            <Mail aria-hidden="true" size={15} strokeWidth={2} />
            <span className="hidden sm:inline">Enviar E-mail</span>
          </button>

        </div>
      </div>

      {/* ─── Dica de impressão térmica ────────────────────────── */}
      {format === 'thermal' && (
        <div
          role="note"
          className="
            flex items-start gap-3 px-4 py-3 rounded-xl
            bg-brand-50 dark:bg-brand-950/30
            border border-brand-100 dark:border-brand-900
            text-xs text-brand-700 dark:text-brand-300
            animate-slide-in-up
          "
        >
          <Printer aria-hidden="true" size={14} strokeWidth={2} className="shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">Dica de impressão térmica</p>
            <p className="text-brand-600 dark:text-brand-400">
              No diálogo de impressão: desmarque{' '}
              <strong>Cabeçalhos e Rodapés</strong>, defina as margens como{' '}
              <strong>Nenhuma</strong> e selecione o tamanho de papel{' '}
              <strong>80mm × Comprimento automático</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ─── Seções do DANFE ──────────────────────────────────── */}
      <div role="region" aria-label="Dados da NF-e" className="space-y-3">

        <IdentificacaoFields nfe={nfe} />
        <EmitenteFields nfe={nfe} />
        <DestinatarioFields nfe={nfe} />
        <ProdutosFields nfe={nfe} />
        <TotaisFields nfe={nfe} />

        {showAllSections && (
          <>
            <TransporteFields nfe={nfe} />
            <InformacoesAdicionaisFields nfe={nfe} />
          </>
        )}

        {(nfe.transporte || nfe.infCpl || nfe.infAdFisco) && (
          <button
            type="button"
            onClick={() => setShowAllSections(v => !v)}
            aria-expanded={showAllSections}
            aria-controls="danfe-extra-sections"
            className="
              w-full flex items-center justify-center gap-2
              py-2.5 rounded-xl text-xs font-medium
              text-surface-500 dark:text-surface-400
              hover:bg-surface-100 dark:hover:bg-surface-900
              border border-surface-200 dark:border-surface-800
              transition-colors duration-150
            "
          >
            <ChevronDown
              aria-hidden="true"
              size={14}
              strokeWidth={2}
              className={`transition-transform duration-200 ${showAllSections ? 'rotate-180' : ''}`}
            />
            {showAllSections
              ? 'Ocultar seções adicionais'
              : 'Ver Transporte e Informações Adicionais'}
          </button>
        )}
      </div>

      {/* ─── Rodapé de ações ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-surface-100 dark:border-surface-800">
        <button
          type="button"
          onClick={reset}
          className="
            flex items-center gap-1.5 text-xs
            text-surface-400 hover:text-surface-600
            dark:hover:text-surface-300
            transition-colors duration-150
          "
        >
          <FileText aria-hidden="true" size={12} strokeWidth={2} />
          Converter outro XML
        </button>

        <p className="text-xs text-surface-400 dark:text-surface-500 tabular">
          {nfe.produtos.length}{' '}
          {nfe.produtos.length === 1 ? 'produto' : 'produtos'} ·{' '}
          Chave: {nfe.chNFe.slice(0, 8)}…{nfe.chNFe.slice(-4)}
        </p>
      </div>

      {format === 'thermal' && (
        <DanfeThermal nfe={nfe} config={config} />
      )}

    </div>
  )
}