import {
  useRef,
  useState,
  useCallback,
  type DragEvent,
  type ChangeEvent,
} from 'react'
import { UploadCloud, FileText, AlertCircle, X, CheckCircle2 } from 'lucide-react'
import { useNFe }         from '@/contexts/NFeContext'
import { useXmlParser }   from '@/hooks/useXmlParser'

/* ─── Constantes ─────────────────────────────────────────────── */
const MAX_SIZE_BYTES  = 1_048_576          // 1 MB
const ACCEPTED_TYPES  = ['.xml']
const ACCEPTED_MIME   = 'text/xml,application/xml'

/* ─── Tipos internos ─────────────────────────────────────────── */
type DropState = 'idle' | 'dragging' | 'success' | 'error'

/* ─── Componente ─────────────────────────────────────────────── */
export function UploadZone() {
  const inputRef                          = useRef<HTMLInputElement>(null)
  const [dropState, setDropState]         = useState<DropState>('idle')
  const [localError, setLocalError]       = useState<string | null>(null)
  const [fileName, setFileName]           = useState<string | null>(null)

  const { state, parseStart, parseResult } = useNFe()
  const { parse }                          = useXmlParser()

  /* ─── Valida o arquivo antes de processar ─────────────────── */
  function validateFile(file: File): string | null {
    if (!file.name.toLowerCase().endsWith('.xml')) {
      return 'Formato inválido. Envie um arquivo .xml de NF-e.'
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `Arquivo muito grande. Tamanho máximo: 1 MB (atual: ${(file.size / 1024).toFixed(0)} KB).`
    }
    if (file.size === 0) {
      return 'Arquivo vazio. Verifique o XML e tente novamente.'
    }
    return null
  }

  /* ─── Processa o arquivo selecionado ─────────────────────── */
  const processFile = useCallback(async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setDropState('error')
      setLocalError(validationError)
      setFileName(file.name)
      return
    }

    setDropState('idle')
    setLocalError(null)
    setFileName(file.name)
    parseStart(file.name)

    try {
      const text   = await file.text()
      const result = await parse(text)
      if (result.success) {
        setDropState('success')
      } else {
        setDropState('error')
        setLocalError(result.error ?? 'Erro ao processar o XML.')
      }
      parseResult(result)
    } catch {
      const msg = 'Erro inesperado ao ler o arquivo.'
      setDropState('error')
      setLocalError(msg)
      parseResult({ success: false, error: msg })
    }
  }, [parse, parseStart, parseResult])

  /* ─── Handlers de drag-and-drop ──────────────────────────── */
  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDropState('dragging')
  }, [])

  const onDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // Só sai do estado dragging se o mouse saiu do elemento raiz
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropState(prev => prev === 'dragging' ? 'idle' : prev)
    }
  }, [])

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (!file) {
      setDropState('idle')
      return
    }
    processFile(file)
  }, [processFile])

  /* ─── Handler do input file ──────────────────────────────── */
  const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
    // Reset para permitir re-upload do mesmo arquivo
    e.target.value = ''
  }, [processFile])

  /* ─── Abre o file picker ─────────────────────────────────── */
  const openPicker = useCallback(() => {
    inputRef.current?.click()
  }, [])

  /* ─── Limpa o estado ─────────────────────────────────────── */
  const clearState = useCallback(() => {
    setDropState('idle')
    setLocalError(null)
    setFileName(null)
  }, [])

  /* ─── Acessibilidade: teclado na drop zone ───────────────── */
  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openPicker()
    }
  }, [openPicker])

  /* ─── Classes dinâmicas da drop zone ─────────────────────── */
  const zoneClass = [
    'upload-zone',
    dropState === 'dragging' ? 'drag-over'  : '',
    dropState === 'success'  ? 'success'    : '',
    dropState === 'error'    ? 'error'      : '',
  ].filter(Boolean).join(' ')

  /* ─── Erro consolidado ───────────────────────────────────── */
  const errorMessage = localError ?? (state.error ?? null)

  const isLoading = state.isLoading

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4">

      {/* ─── Headline ──────────────────────────────────────── */}
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-surface-50">
          Converta seu XML
          <span className="text-gradient-brand"> NF-e</span>
        </h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Gere o DANFE em PDF ou Etiqueta Térmica 80mm.
          Sem cadastro, sem armazenamento.
        </p>
      </div>

      {/* ─── Drop Zone ─────────────────────────────────────── */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Área de upload: clique ou arraste um arquivo XML de NF-e"
        aria-describedby="upload-hint upload-error"
        aria-disabled={isLoading}
        className={`
          ${zoneClass}
          relative p-8 md:p-12
          flex flex-col items-center justify-center gap-4
          text-center cursor-pointer select-none
          outline-none focus-visible:ring-2
          focus-visible:ring-brand-500 focus-visible:ring-offset-2
          ${isLoading ? 'pointer-events-none opacity-60' : ''}
        `}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={openPicker}
        onKeyDown={onKeyDown}
      >
        {/* Input file oculto */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_MIME}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={onInputChange}
        />

        {/* ─── Ícone central ─────────────────────────────── */}
        <div
          aria-hidden="true"
          className={`
            flex items-center justify-center
            w-16 h-16 rounded-2xl
            transition-colors duration-200
            ${dropState === 'success'
              ? 'bg-success-100 dark:bg-success-950 text-success-600'
              : dropState === 'error'
                ? 'bg-danger-100 dark:bg-danger-950 text-danger-600'
                : dropState === 'dragging'
                  ? 'bg-brand-100 dark:bg-brand-950 text-brand-600'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-500'}
          `}
        >
          {isLoading ? (
            <svg
              aria-hidden="true"
              className="animate-spin-slow"
              width="32" height="32" viewBox="0 0 32 32"
              fill="none" xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2.5" strokeDasharray="60 20" strokeLinecap="round"/>
            </svg>
          ) : dropState === 'success' ? (
            <CheckCircle2 size={32} strokeWidth={1.5} />
          ) : dropState === 'error' ? (
            <AlertCircle size={32} strokeWidth={1.5} />
          ) : dropState === 'dragging' ? (
            <UploadCloud size={32} strokeWidth={1.5} />
          ) : (
            <UploadCloud size={32} strokeWidth={1.5} />
          )}
        </div>

        {/* ─── Textos ─────────────────────────────────────── */}
        {isLoading ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Processando XML…
            </p>
            <p className="text-xs text-surface-400">
              {fileName}
            </p>
          </div>
        ) : dropState === 'success' ? (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-success-700 dark:text-success-400">
              XML válido!
            </p>
            <p className="text-xs text-surface-400 truncate max-w-xs">
              {fileName}
            </p>
          </div>
        ) : dropState === 'dragging' ? (
          <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
            Solte o arquivo aqui
          </p>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
              <span className="text-brand-600 dark:text-brand-400 underline underline-offset-2">
                Clique para selecionar
              </span>
              {' '}ou arraste o arquivo
            </p>
            <p
              id="upload-hint"
              className="text-xs text-surface-400 dark:text-surface-500"
            >
              Apenas arquivos .xml de NF-e · Máximo 1 MB
            </p>
          </div>
        )}

        {/* ─── Overlay de drag ────────────────────────────── */}
        {dropState === 'dragging' && (
          <div
            aria-hidden="true"
            className="
              absolute inset-0 rounded-2xl
              bg-brand-500/5 dark:bg-brand-400/5
              pointer-events-none
            "
          />
        )}
      </div>

      {/* ─── Mensagem de erro ────────────────────────────────── */}
      {errorMessage && (
        <div
          id="upload-error"
          role="alert"
          aria-live="assertive"
          className="
            flex items-start gap-3 p-4
            rounded-xl
            bg-danger-50 dark:bg-danger-950/40
            border border-danger-200 dark:border-danger-800
            text-danger-700 dark:text-danger-400
            animate-slide-in-up
          "
        >
          <AlertCircle
            aria-hidden="true"
            size={16}
            strokeWidth={2}
            className="shrink-0 mt-0.5"
          />
          <p className="text-sm flex-1 leading-relaxed">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={clearState}
            aria-label="Fechar mensagem de erro"
            className="
              shrink-0 touch-target
              text-danger-500 hover:text-danger-700
              dark:hover:text-danger-300
              transition-colors duration-150
            "
          >
            <X aria-hidden="true" size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* ─── Nome do arquivo selecionado (fora do error) ───── */}
      {fileName && !errorMessage && !isLoading && dropState !== 'success' && (
        <div
          role="status"
          aria-live="polite"
          className="
            flex items-center gap-2 px-4 py-3
            rounded-xl
            bg-surface-100 dark:bg-surface-800
            border border-surface-200 dark:border-surface-700
            animate-slide-in-up
          "
        >
          <FileText
            aria-hidden="true"
            size={14}
            strokeWidth={2}
            className="shrink-0 text-surface-400"
          />
          <span className="text-xs text-surface-600 dark:text-surface-400 truncate">
            {fileName}
          </span>
        </div>
      )}

      {/* ─── Dica de segurança ───────────────────────────────── */}
      <p className="text-center text-xs text-surface-400 dark:text-surface-600">
        Processado localmente · Nenhum dado é enviado ao servidor
      </p>

    </div>
  )
}