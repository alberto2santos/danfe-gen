import {
  useRef,
  useState,
  useCallback,
  type DragEvent,
  type ChangeEvent,
} from 'react'
import {
  UploadCloud, FileText, AlertCircle,
  X, CheckCircle2, Archive, Info,
  Trash2, Play,
} from 'lucide-react'
import { unzip }             from 'fflate'
import { useNFe }            from '@/contexts/NFeContext'
import { useXmlParser }      from '@/hooks/useXmlParser'
import { useBatchProcessor } from '@/hooks/useBatchProcessor'
import { BatchProgress }     from '@/components/Upload/BatchProgress'
import { useCompany }        from '@/contexts/CompanyContext'

/* ─── Constantes  */
const MAX_SINGLE_BYTES = 1_048_576    // 1 MB  — XML único
const MAX_ZIP_BYTES    = 52_428_800   // 50 MB — ZIP
const MAX_UNZIP_BYTES  = 52_428_800   // 50 MB — proteção zip bomb
const MAX_BATCH_ITEMS  = 10           // limite lote via ZIP
const ACCEPTED_MIME    = 'text/xml,application/xml,application/zip,.zip'

/* ─── Tipos  */
type DropState = 'idle' | 'dragging' | 'success' | 'error'

// reason e bytes como opcionais corretos (sem exactOptionalPropertyTypes clash)
interface ZipPreviewItem {
  path:    string
  name:    string
  size:    number
  valid:   boolean
  reason:  string | undefined
  bytes:   Uint8Array | undefined
}

/* ─── Helpers  */
function sanitizePath(path: string): string {
  // regex corrigida — classe de caractere [\/] no lugar de \[\/\]
  return path.replace(/\.\.[\/]/g, '').replace(/^[\/]+/, '')
}

function isNFeXml(content: string): boolean {
  if (/<!DOCTYPE/i.test(content)) return false
  return /<NFe[\s>]|<nfeProc[\s>]/i.test(content)
}

// &lt; no lugar de &lt;
function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  return `${(n / 1024).toFixed(1)} KB`
}

/* ─── Componente  */
export function UploadZone() {
  const inputRef                        = useRef<HTMLInputElement>(null)
  const [dropState, setDropState]       = useState<DropState>('idle')
  const [localError, setLocalError]     = useState<string | null>(null)
  const [fileName, setFileName]         = useState<string | null>(null)

  const [zipPreview, setZipPreview]     = useState<ZipPreviewItem[] | null>(null)
  const [zipName, setZipName]           = useState<string | null>(null)
  const [selected, setSelected]         = useState<Set<string>>(new Set())
  const [isExtracting, setIsExtracting] = useState(false)
  const [batchStarted, setBatchStarted] = useState(false)

  const { state, parseStart, parseResult }                                          = useNFe()
  const { parse }                                                                   = useXmlParser()
  const { config }                                                                  = useCompany()
  const { items, current, total, running, process: processBatch, reset: resetBatch } = useBatchProcessor()

  /* ─── Reset completo  */
  const clearAll = useCallback(() => {
    setDropState('idle')
    setLocalError(null)
    setFileName(null)
    setZipPreview(null)
    setZipName(null)
    setSelected(new Set())
    setBatchStarted(false)
    resetBatch()
  }, [resetBatch])

  /* ─── Valida XML único  */
  function validateSingleFile(file: File): string | null {
    if (!file.name.toLowerCase().endsWith('.xml'))
      return 'Formato inválido. Envie um arquivo .xml de NF-e ou um .zip com XMLs.'
    if (file.size > MAX_SINGLE_BYTES)
      return `Arquivo muito grande. Máximo: 1 MB (atual: ${(file.size / 1024).toFixed(0)} KB).`
    if (file.size === 0)
      return 'Arquivo vazio. Verifique o XML e tente novamente.'
    return null
  }

  /* ─── Processa XML único  */
  const processSingleXml = useCallback(async (file: File) => {
    const err = validateSingleFile(file)
    if (err) {
      setDropState('error')
      setLocalError(err)
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
      if (result.success) setDropState('success')
      else {
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

  /* ─── Extrai ZIP e monta preview  */
  const extractZip = useCallback(async (file: File) => {
    if (file.size > MAX_ZIP_BYTES) {
      setDropState('error')
      setLocalError('ZIP muito grande. Máximo permitido: 50 MB.')
      return
    }

    setIsExtracting(true)
    setLocalError(null)

    try {
      const buffer    = await file.arrayBuffer()
      const uint8     = new Uint8Array(buffer)

      const extracted = await new Promise<Record<string, Uint8Array>>((resolve, reject) => {
        unzip(uint8, (err, data) => {
          if (err) reject(err)
          else     resolve(data)
        })
      })

      // Proteção zip bomb
      const totalUnzipped = Object.values(extracted)
        .reduce((acc, v) => acc + v.byteLength, 0)
      if (totalUnzipped > MAX_UNZIP_BYTES) {
        setLocalError('ZIP rejeitado: conteúdo descomprimido excede 50 MB.')
        setIsExtracting(false)
        return
      }

      const decoder = new TextDecoder('utf-8')
      const preview: ZipPreviewItem[] = []

      for (const [rawPath, bytes] of Object.entries(extracted)) {
        const path = sanitizePath(rawPath)
        const name = path.split('/').pop() ?? path

        if (!name.toLowerCase().endsWith('.xml') || bytes.byteLength === 0) continue

        const content = decoder.decode(bytes)
        const isValid = isNFeXml(content)

        // não usa condicional que gera string | undefined na prop
        // constrói o objeto com tipos explícitos para evitar exactOptionalPropertyTypes
        const item: ZipPreviewItem = {
          path,
          name,
          size:   bytes.byteLength,
          valid:  isValid,
          reason: isValid
            ? undefined
            : content.includes('<!DOCTYPE')
              ? 'Rejeitado: contém DOCTYPE (possível XXE)'
              : 'Não é um XML de NF-e válido',
          // copia o buffer para garantir ArrayBuffer puro (resolve SharedArrayBuffer clash)
          bytes: isValid
            ? new Uint8Array(bytes.buffer.slice(
                bytes.byteOffset,
                bytes.byteOffset + bytes.byteLength
              ))
            : undefined,
        }

        preview.push(item)
      }

      if (preview.length === 0) {
        setLocalError('Nenhum XML de NF-e encontrado no ZIP.')
        setIsExtracting(false)
        return
      }

      preview.sort((a, b) => {
        if (a.valid !== b.valid) return a.valid ? -1 : 1
        return a.path.localeCompare(b.path)
      })

      const validItems = preview.filter(i => i.valid)
      const initialSel = new Set(
        validItems.slice(0, MAX_BATCH_ITEMS).map(i => i.path)
      )

      setZipPreview(preview)
      setZipName(file.name)
      setSelected(initialSel)
      setDropState('idle')

    } catch (err) {
      setLocalError('Erro ao extrair o ZIP. Verifique se o arquivo não está corrompido.')
      console.error('[UploadZone] ZIP extraction error:', err)
    } finally {
      setIsExtracting(false)
    }
  }, [])

  /* ─── Inicia lote  */
  const startBatch = useCallback(async () => {
    if (!zipPreview) return

    const chosenItems = zipPreview.filter(
      i => i.valid && selected.has(i.path) && i.bytes !== undefined
    )

    if (chosenItems.length === 0) {
      setLocalError('Selecione ao menos um arquivo válido para processar.')
      return
    }

    // bytes.buffer as ArrayBuffer — seguro após o slice acima
    const files = chosenItems.map(item =>
      new File(
        [item.bytes!.buffer as ArrayBuffer],
        item.name,
        { type: 'application/xml' }
      )
    )

    setBatchStarted(true)
    await processBatch(files, config)
  }, [zipPreview, selected, processBatch, config])

  /* ─── Drag and drop  */
  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDropState('dragging')
  }, [])

  const onDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropState(prev => prev === 'dragging' ? 'idle' : prev)
    }
  }, [])

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (!file) { setDropState('idle'); return }
    file.name.toLowerCase().endsWith('.zip')
      ? extractZip(file)
      : processSingleXml(file)
  }, [extractZip, processSingleXml])

  const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    file.name.toLowerCase().endsWith('.zip')
      ? extractZip(file)
      : processSingleXml(file)
    e.target.value = ''
  }, [extractZip, processSingleXml])

  const openPicker = useCallback(() => inputRef.current?.click(), [])

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openPicker()
    }
  }, [openPicker])

  /* ─── Toggle seleção  */
  const toggleItem = useCallback((path: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        if (next.size >= MAX_BATCH_ITEMS) return prev
        next.add(path)
      }
      return next
    })
  }, [])

  /* ─── Derivados  */
  const isLoading    = state.isLoading || isExtracting
  const errorMessage = localError ?? (state.error ?? null)
  const validCount   = zipPreview?.filter(i => i.valid).length ?? 0
  const overLimit    = validCount > MAX_BATCH_ITEMS

  const zoneClass = [
    'upload-zone',
    dropState === 'dragging' ? 'drag-over' : '',
    dropState === 'success'  ? 'success'   : '',
    dropState === 'error'    ? 'error'     : '',
  ].filter(Boolean).join(' ')

  /* ─── Render: lote em andamento  */
  if (batchStarted) {
    return (
      <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
        <BatchProgress items={items} current={current} total={total} />
        {!running && (
          <button
            type="button"
            onClick={clearAll}
            className="
              mx-auto flex items-center gap-2
              px-4 py-2 rounded-lg text-sm font-medium
              border border-surface-200 dark:border-surface-700
              text-surface-600 dark:text-surface-400
              hover:bg-surface-50 dark:hover:bg-surface-900
              transition-colors duration-150
            "
          >
            <X size={14} strokeWidth={2} />
            Processar outro lote
          </button>
        )}
      </div>
    )
  }

  /* ─── Render: preview ZIP  */
  if (zipPreview) {
    return (
      <div className="w-full max-w-xl mx-auto flex flex-col gap-4">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive size={16} className="text-brand-600 dark:text-brand-400" />
            <span className="text-sm font-semibold text-surface-800 dark:text-surface-100 truncate max-w-[220px]">
              {zipName}
            </span>
          </div>
          <button
            type="button"
            onClick={clearAll}
            aria-label="Cancelar e voltar"
            className="text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {overLimit && (
          <div className="
            flex items-start gap-2 px-3 py-2.5 rounded-lg
            bg-amber-50 dark:bg-amber-950/30
            border border-amber-200 dark:border-amber-800
            text-xs text-amber-700 dark:text-amber-400
          ">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>
              O ZIP contém <strong>{validCount} arquivos válidos</strong>.
              Selecione até <strong>{MAX_BATCH_ITEMS}</strong> para processar
              ({MAX_BATCH_ITEMS - selected.size} restantes disponíveis).
            </span>
          </div>
        )}

        <div className="
          flex items-start gap-2 px-3 py-2.5 rounded-lg
          bg-brand-50 dark:bg-brand-950/30
          border border-brand-100 dark:border-brand-900
          text-xs text-brand-700 dark:text-brand-400
        ">
          <Info size={14} className="shrink-0 mt-0.5" />
          <span>
            Organize seus XMLs por mês no formato{' '}
            <code className="font-mono bg-brand-100 dark:bg-brand-900/50 px-1 rounded">
              AAAA/MM/arquivo.xml
            </code>{' '}
            (ex:{' '}
            <code className="font-mono bg-brand-100 dark:bg-brand-900/50 px-1 rounded">
              2026/03/nfe.xml
            </code>
            ). Evite nomes genéricos como "xmls" ou "notas".
          </span>
        </div>

        <div className="rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
          <div className="
            flex items-center justify-between
            px-3 py-2.5
            bg-surface-50 dark:bg-surface-900
            border-b border-surface-200 dark:border-surface-700
            text-xs text-surface-500 dark:text-surface-400
          ">
            <span>{selected.size} de {Math.min(validCount, MAX_BATCH_ITEMS)} selecionados</span>
            <span className="font-mono">{zipPreview.length} arquivo(s) no ZIP</span>
          </div>

          <ul className="max-h-64 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-800">
            {zipPreview.map(item => (
              <li key={item.path}>
                <label
                  className={`
                    flex items-center gap-3 px-3 py-2.5
                    transition-colors duration-100
                    ${item.valid
                      ? 'cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-900'
                      : 'opacity-50 cursor-not-allowed'}
                  `}
                >
                  <input
                    type="checkbox"
                    disabled={!item.valid || (!selected.has(item.path) && selected.size >= MAX_BATCH_ITEMS)}
                    checked={selected.has(item.path)}
                    onChange={() => toggleItem(item.path)}
                    className="
                      w-4 h-4 rounded
                      border-surface-300 dark:border-surface-600
                      text-brand-600 dark:text-brand-500
                      focus:ring-brand-400 dark:focus:ring-brand-500
                      disabled:opacity-40
                    "
                  />

                  <span className="shrink-0" aria-hidden="true">
                    {item.valid
                      ? <FileText size={14} className="text-brand-500" />
                      : <AlertCircle size={14} className="text-danger-500" />}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-surface-700 dark:text-surface-300 truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-surface-400 dark:text-surface-500 truncate">
                      {item.path !== item.name ? item.path + ' · ' : ''}
                      {formatBytes(item.size)}
                    </p>
                    {item.reason !== undefined && (
                      <p className="text-[10px] text-danger-500 truncate">{item.reason}</p>
                    )}
                  </div>

                  {item.valid && selected.has(item.path) && (
                    <button
                      type="button"
                      onClick={e => { e.preventDefault(); toggleItem(item.path) }}
                      aria-label={`Remover ${item.name} da seleção`}
                      className="shrink-0 text-surface-300 hover:text-danger-500 transition-colors"
                    >
                      <Trash2 size={12} strokeWidth={2} />
                    </button>
                  )}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {errorMessage && (
          <p role="alert" className="text-xs text-danger-600 dark:text-danger-400 text-center">
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={startBatch}
          disabled={selected.size === 0}
          className="
            flex items-center justify-center gap-2
            w-full px-4 py-3 rounded-xl
            text-sm font-semibold text-white
            bg-brand-600 hover:bg-brand-700
            dark:bg-brand-600 dark:hover:bg-brand-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-150 shadow-sm
          "
        >
          <Play size={14} strokeWidth={2.5} />
          Processar {selected.size} NF-e{selected.size !== 1 ? 's' : ''}
        </button>
      </div>
    )
  }

  /* ─── Render: modo padrão  */
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4">

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

      <div
        role="button"
        tabIndex={0}
        aria-label="Área de upload: clique ou arraste um XML de NF-e ou um ZIP com até 10 NF-es"
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
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_MIME}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={onInputChange}
        />

        <div
          aria-hidden="true"
          className={`
            flex items-center justify-center
            w-16 h-16 rounded-2xl transition-colors duration-200
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
            <svg className="animate-spin-slow" width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2.5" strokeDasharray="60 20" strokeLinecap="round"/>
            </svg>
          ) : dropState === 'success' ? (
            <CheckCircle2 size={32} strokeWidth={1.5} />
          ) : dropState === 'error' ? (
            <AlertCircle size={32} strokeWidth={1.5} />
          ) : (
            <UploadCloud size={32} strokeWidth={1.5} />
          )}
        </div>

        {isLoading ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
              {isExtracting ? 'Extraindo ZIP…' : 'Processando XML…'}
            </p>
            {fileName && <p className="text-xs text-surface-400">{fileName}</p>}
          </div>
        ) : dropState === 'success' ? (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-success-700 dark:text-success-400">XML válido!</p>
            <p className="text-xs text-surface-400 truncate max-w-xs">{fileName}</p>
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
            <p id="upload-hint" className="text-xs text-surface-400 dark:text-surface-500">
              XML de NF-e (máx. 1 MB) · ZIP com até 10 NF-es (máx. 50 MB)
            </p>
          </div>
        )}

        {dropState === 'dragging' && (
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl bg-brand-500/5 dark:bg-brand-400/5 pointer-events-none"
          />
        )}
      </div>

      {errorMessage && (
        <div
          id="upload-error"
          role="alert"
          aria-live="assertive"
          className="
            flex items-start gap-3 p-4 rounded-xl
            bg-danger-50 dark:bg-danger-950/40
            border border-danger-200 dark:border-danger-800
            text-danger-700 dark:text-danger-400
            animate-slide-in-up
          "
        >
          <AlertCircle aria-hidden="true" size={16} strokeWidth={2} className="shrink-0 mt-0.5" />
          <p className="text-sm flex-1 leading-relaxed">{errorMessage}</p>
          <button
            type="button"
            onClick={clearAll}
            aria-label="Fechar mensagem de erro"
            className="shrink-0 text-danger-500 hover:text-danger-700 dark:hover:text-danger-300 transition-colors"
          >
            <X aria-hidden="true" size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      {fileName && !errorMessage && !isLoading && dropState !== 'success' && (
        <div
          role="status"
          aria-live="polite"
          className="
            flex items-center gap-2 px-4 py-3 rounded-xl
            bg-surface-100 dark:bg-surface-800
            border border-surface-200 dark:border-surface-700
            animate-slide-in-up
          "
        >
          <FileText aria-hidden="true" size={14} strokeWidth={2} className="shrink-0 text-surface-400" />
          <span className="text-xs text-surface-600 dark:text-surface-400 truncate">{fileName}</span>
        </div>
      )}

      <p className="text-center text-xs text-surface-400 dark:text-surface-600">
        Processado localmente · Nenhum dado é enviado ao servidor
      </p>

    </div>
  )
}