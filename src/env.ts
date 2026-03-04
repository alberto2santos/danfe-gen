const env = (import.meta as unknown as { env: Record<string, string> }).env

export const ENV = {
  DEMO_KEY:     env['VITE_DEMO_KEY']     ?? 'demo-public-key-2024',
  API_BASE_URL: env['VITE_API_BASE_URL'] ?? '',
  APP_TITLE:    env['VITE_APP_TITLE']    ?? 'DanfeGen',
  APP_VERSION:  env['VITE_APP_VERSION']  ?? '1.0.0',
} as const