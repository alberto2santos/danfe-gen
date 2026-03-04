/// <reference types="vite/client" />

/* ─── Tipagem das variáveis de ambiente do DanfeGen ───────────── */
interface ImportMetaEnv {
  // Client — expostas ao bundle (prefixo VITE_ obrigatório)
  readonly VITE_APP_TITLE:     string
  readonly VITE_APP_VERSION:   string
  readonly VITE_API_BASE_URL:  string
  readonly VITE_DEMO_KEY:      string

  // Modo do Vite — injetado automaticamente
  readonly MODE:               string
  readonly BASE_URL:           string
  readonly PROD:               boolean
  readonly DEV:                boolean
  readonly SSR:                boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}