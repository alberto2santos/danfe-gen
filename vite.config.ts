import { defineConfig, loadEnv, type PluginOption } from 'vite'
import react                                          from '@vitejs/plugin-react-swc'
import tsconfigPaths                                  from 'vite-tsconfig-paths'
import { visualizer }                                 from 'rollup-plugin-visualizer'
import path                                           from 'path'

export default defineConfig(({ mode }) => {

  const env      = loadEnv(mode, process.cwd(), '')
  const isAnalyze = process.env.npm_lifecycle_event === 'analyze'

  return {

    /* ─── Plugins ───────────────────────────────────────────── */
    plugins: [
      react(),

      tsconfigPaths({
        projects: ['./tsconfig.app.json'],
      }),

      isAnalyze && (visualizer({
        filename:   './dist/stats.html',
        open:       true,
        gzipSize:   true,
        brotliSize: true,
        template:   'treemap',
      }) as PluginOption),

    ].filter(Boolean),


    /* ─── Aliases ───────────────────────────────────────────── */
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },


    /* ─── Servidor de desenvolvimento ──────────────────────── */
    server: {
      port:       5173,
      strictPort: true,
      open:       false,

      proxy: {
        '/api': {
          target:      env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure:      false,
          rewrite:     (path) => path.replace(/^\/api/, ''),
          configure:   (proxy) => {
            proxy.on('error', (err) => {
              console.error('[vite proxy] erro:', err.message)
            })
          },
        },
      },
    },


    /* ─── Build de produção ─────────────────────────────────── */
    build: {
      target:               'es2022',
      outDir:               'dist',
      sourcemap:            mode === 'development',
      chunkSizeWarningLimit: 500,

      // ✅ Converte pacotes CJS mistos para ESM (resolve base64-js)
      commonjsOptions: {
        transformMixedEsModules: true,
      },

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('@react-pdf/renderer') ||
                id.includes('@react-pdf')) {
              return 'vendor-react-pdf'
            }
            if (id.includes('fast-xml-parser')) {
              return 'vendor-xml-parser'
            }
            if (id.includes('jszip')) {
              return 'vendor-jszip'
            }
            if (id.includes('node_modules/react/')  ||
                id.includes('node_modules/react-dom/')) {
              return 'vendor-react'
            }
            if (id.includes('node_modules')) {
              return 'vendor-misc'
            }
            if (id.includes('/src/utils/')) {
              return 'utils'
            }
          },

          chunkFileNames:  'assets/[name]-[hash].js',
          entryFileNames:  'assets/[name]-[hash].js',
          assetFileNames:  'assets/[name]-[hash].[ext]',
        },
      },
    },


    /* ─── Variáveis de ambiente ─────────────────────────────── */
    envPrefix: 'VITE_',


    /* ─── Otimizações de pré-bundling ───────────────────────── */
    optimizeDeps: {
      include: [
        'fast-xml-parser',
        // ✅ Força pre-bundle do react-pdf e dependências CJS
        '@react-pdf/renderer',
        'base64-js',
      ],
      // ❌ exclude removido — era a causa do erro base64-js
    },

  }
})