import { useCallback, useRef } from 'react'

export function useThermalPrint() {
  const isPrinting = useRef(false)

  const print = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (isPrinting.current) return

      isPrinting.current = true

      // Aguarda o DOM renderizar o componente antes de imprimir
      requestAnimationFrame(() => {
        try {
          window.print()

          // Detecta quando o diálogo de impressão fecha
          const onFocus = () => {
            isPrinting.current = false
            window.removeEventListener('focus', onFocus)
            resolve()
          }
          window.addEventListener('focus', onFocus)

          // Fallback — se o focus não disparar em 30s, resolve
          setTimeout(() => {
            if (isPrinting.current) {
              isPrinting.current = false
              window.removeEventListener('focus', onFocus)
              resolve()
            }
          }, 30_000)

        } catch (err) {
          isPrinting.current = false
          reject(err)
        }
      })
    })
  }, [])

  return { print }
}