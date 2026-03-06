import { useState, useCallback, useRef } from 'react'
import type { BatchItem }                from '@/components/Upload/BatchProgress'
import { useXmlParser }                  from '@/hooks/useXmlParser'
import { usePdfGenerator }               from '@/hooks/usePdfGenerator'
import type { CompanyConfig }            from '@/types/company.types'

interface BatchResult {
  id:      string
  name:    string
  success: boolean
  error?:  string
}

export function useBatchProcessor() {
  const [items,   setItems]   = useState<BatchItem[]>([])
  const [current, setCurrent] = useState(0)
  const [total,   setTotal]   = useState(0)
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<BatchResult[]>([])
  const abortRef              = useRef(false)

  const { parse: parseXml } = useXmlParser()
  const { generateA4 }      = usePdfGenerator()

  const process = useCallback(async (
    files:  File[],
    config: CompanyConfig,
  ): Promise<BatchResult[]> => {

    const safeFiles = files.slice(0, 10)

    abortRef.current = false
    setRunning(true)
    setTotal(safeFiles.length)
    setCurrent(0)
    setResults([])

    const initialItems: BatchItem[] = safeFiles.map(f => ({
      id:     f.name,
      name:   f.name,
      status: 'pending',
    }))
    setItems(initialItems)

    const batchResults: BatchResult[] = []

    for (let i = 0; i < safeFiles.length; i++) {
      if (abortRef.current) break

      const file = safeFiles[i]!

      setItems(prev => prev.map(it =>
        it.id === file.name ? { ...it, status: 'processing' } : it
      ))

      try {
        const xmlText = await file.text()
        const parsed  = await parseXml(xmlText)

        if (!parsed.success || !parsed.data) {
          throw new Error(parsed.error ?? 'XML inválido')
        }

        await generateA4(parsed.data, config)

        setItems(prev => prev.map(it =>
          it.id === file.name ? { ...it, status: 'done' } : it
        ))
        batchResults.push({ id: file.name, name: file.name, success: true })

      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro desconhecido'
        setItems(prev => prev.map(it =>
          it.id === file.name ? { ...it, status: 'error', error: msg } : it
        ))
        batchResults.push({ id: file.name, name: file.name, success: false, error: msg })
      }

      setCurrent(i + 1)
    }

    setRunning(false)
    setResults(batchResults)
    return batchResults

  }, [parseXml, generateA4])

  const abort = useCallback(() => {
    abortRef.current = true
  }, [])

  const reset = useCallback(() => {
    setItems([])
    setCurrent(0)
    setTotal(0)
    setRunning(false)
    setResults([])
    abortRef.current = false
  }, [])

  return { items, current, total, running, results, process, abort, reset }
}