import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react'
import type { NFeDados, AppStep, DanfeFormat, ParseResult } from '@/types/nfe.types'

/* ─── State ───────────────────────────────────────────────────── */
interface NFeState {
  step:        AppStep
  nfe:         NFeDados | null
  fileName:    string
  format:      DanfeFormat
  isLoading:   boolean
  error:       string | null
}

const INITIAL_STATE: NFeState = {
  step:        'upload',
  nfe:         null,
  fileName:    '',
  format:      'a4',
  isLoading:   false,
  error:       null,
}

/* ─── Actions ─────────────────────────────────────────────────── */
type NFeAction =
  | { type: 'PARSE_START';    fileName: string }
  | { type: 'PARSE_SUCCESS';  data: NFeDados   }
  | { type: 'PARSE_ERROR';    error: string    }
  | { type: 'SET_FORMAT';     format: DanfeFormat }
  | { type: 'GO_DOWNLOAD'                      }
  | { type: 'RESET'                            }

/* ─── Reducer ─────────────────────────────────────────────────── */
function nfeReducer(state: NFeState, action: NFeAction): NFeState {
  switch (action.type) {

    case 'PARSE_START':
      return {
        ...INITIAL_STATE,
        step:      'upload',
        isLoading: true,
        fileName:  action.fileName,
        error:     null,
      }

    case 'PARSE_SUCCESS':
      return {
        ...state,
        isLoading: false,
        step:      'preview',
        nfe:       action.data,
        error:     null,
      }

    case 'PARSE_ERROR':
      return {
        ...state,
        isLoading: false,
        step:      'upload',
        nfe:       null,
        error:     action.error,
      }

    case 'SET_FORMAT':
      return { ...state, format: action.format }

    case 'GO_DOWNLOAD':
      // Só avança se tiver NF-e parseada
      if (!state.nfe) return state
      return { ...state, step: 'download' }

    case 'RESET':
      return INITIAL_STATE

    default:
      return state
  }
}

/* ─── Context ─────────────────────────────────────────────────── */
interface NFeContextValue {
  state:       NFeState
  parseStart:  (fileName: string) => void
  parseResult: (result: ParseResult) => void
  setFormat:   (format: DanfeFormat) => void
  goDownload:  () => void
  reset:       () => void
}

const NFeContext = createContext<NFeContextValue | null>(null)

/* ─── Provider ────────────────────────────────────────────────── */
export function NFeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(nfeReducer, INITIAL_STATE)

  const parseStart = useCallback((fileName: string) => {
    dispatch({ type: 'PARSE_START', fileName })
  }, [])

  const parseResult = useCallback((result: ParseResult) => {
    if (result.success && result.data) {
      dispatch({ type: 'PARSE_SUCCESS', data: result.data })
    } else {
      dispatch({ type: 'PARSE_ERROR', error: result.error ?? 'Erro desconhecido' })
    }
  }, [])

  const setFormat = useCallback((format: DanfeFormat) => {
    dispatch({ type: 'SET_FORMAT', format })
  }, [])

  const goDownload = useCallback(() => {
    dispatch({ type: 'GO_DOWNLOAD' })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return (
    <NFeContext.Provider value={{ state, parseStart, parseResult, setFormat, goDownload, reset }}>
      {children}
    </NFeContext.Provider>
  )
}

/* ─── Hook ────────────────────────────────────────────────────── */
export function useNFe(): NFeContextValue {
  const ctx = useContext(NFeContext)
  if (!ctx) throw new Error('useNFe deve ser usado dentro de <NFeProvider>')
  return ctx
}