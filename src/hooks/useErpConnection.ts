import { useState, useCallback } from 'react'
import type { ErpProvider }      from '@/types/company.types'
import { ENV }                   from '@/env'

interface ErpConnectionState {
  status:    'idle' | 'testing' | 'connected' | 'error'
  message:   string | null
  latencyMs: number | null
}

export function useErpConnection() {
  const [state, setState] = useState<ErpConnectionState>({
    status:    'idle',
    message:   null,
    latencyMs: null,
  })

  const testConnection = useCallback(async (
    provider:   ErpProvider,
    webhookUrl: string,
  ): Promise<boolean> => {
    if (provider === 'none' || !webhookUrl) return false

    setState({ status: 'testing', message: 'Testando conexão…', latencyMs: null })
    const start = Date.now()

    try {
      const res = await fetch(webhookUrl, {
        method:  'POST',
        headers: {
          'Content-Type':   'application/json',
          'x-danfegen-key': ENV.DEMO_KEY,
        },
        body: JSON.stringify({
          event:    'ping',
          provider,
          version:  ENV.APP_VERSION,
        }),
      })

      const latencyMs = Date.now() - start

      if (res.ok) {
        setState({ status: 'connected', message: `Conectado em ${latencyMs}ms`, latencyMs })
        return true
      } else {
        setState({ status: 'error', message: `Erro HTTP ${res.status}`, latencyMs: null })
        return false
      }
    } catch (err) {
      setState({
        status:    'error',
        message:   err instanceof Error ? err.message : 'Falha na conexão',
        latencyMs: null,
      })
      return false
    }
  }, [])

  const reset = useCallback(() => {
    setState({ status: 'idle', message: null, latencyMs: null })
  }, [])

  return { ...state, testConnection, reset }
}