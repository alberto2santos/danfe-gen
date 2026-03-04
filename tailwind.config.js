/** @type {import('tailwindcss').Config} */

/* ─── Paleta base — compartilhada entre tokens ───────────────── */
const palette = {
  brand: {
    50:  '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe',
    300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6',
    600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af',
    900: '#1e3a8a', 950: '#172554',
  },
  success: {
    50:  '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0',
    300: '#86efac', 400: '#4ade80', 500: '#22c55e',
    600: '#16a34a', 700: '#15803d', 800: '#166534',
    900: '#14532d', 950: '#052e16',
  },
  warning: {
    50:  '#fffbeb', 100: '#fef3c7', 200: '#fde68a',
    300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b',
    600: '#d97706', 700: '#b45309', 800: '#92400e',
    900: '#78350f', 950: '#451a03',
  },
  danger: {
    50:  '#fef2f2', 100: '#fee2e2', 200: '#fecaca',
    300: '#fca5a5', 400: '#f87171', 500: '#ef4444',
    600: '#dc2626', 700: '#b91c1c', 800: '#991b1b',
    900: '#7f1d1d', 950: '#450a0a',
  },
  surface: {
    0:   '#ffffff',  50:  '#fafafa', 100: '#f4f4f5',
    200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa',
    500: '#71717a', 600: '#52525b', 700: '#3f3f46',
    800: '#27272a', 900: '#18181b', 950: '#09090b',
  },
}

/* ─── Keyframes — declarados fora para reutilizar ────────────── */
const keyframes = {
  fadeIn: {
    from: { opacity: '0', transform: 'translateY(6px)' },
    to:   { opacity: '1', transform: 'translateY(0)'   },
  },
  fadeInScale: {
    from: { opacity: '0', transform: 'scale(0.96) translateY(4px)' },
    to:   { opacity: '1', transform: 'scale(1) translateY(0)'      },
  },
  slideInRight: {
    from: { opacity: '0', transform: 'translateX(16px)' },
    to:   { opacity: '1', transform: 'translateX(0)'    },
  },
  slideInLeft: {
    from: { opacity: '0', transform: 'translateX(-16px)' },
    to:   { opacity: '1', transform: 'translateX(0)'     },
  },
  slideInUp: {
    from: { opacity: '0', transform: 'translateY(16px)' },
    to:   { opacity: '1', transform: 'translateY(0)'    },
  },
  shimmer: {
    '0%':   { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition:  '200% 0' },
  },
  spinSlow:  { to: { transform: 'rotate(360deg)' } },
  pulseSoft: {
    '0%, 100%': { opacity: '1'   },
    '50%':      { opacity: '0.6' },
  },
  bounceIn: {
    '0%':   { transform: 'scale(0.8)', opacity: '0' },
    '60%':  { transform: 'scale(1.05)'              },
    '100%': { transform: 'scale(1)',   opacity: '1' },
  },
  borderPulse: {
    '0%, 100%': { borderColor: 'rgba(37, 99, 235, 0.4)' },
    '50%':      { borderColor: 'rgba(37, 99, 235, 1)'   },
  },
  progressSlide: {
    '0%':   { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(400%)'  },
  },
}

const animation = {
  'fade-in':        'fadeIn 0.3s ease forwards',
  'fade-in-scale':  'fadeInScale 0.25s ease forwards',
  'slide-in-right': 'slideInRight 0.25s ease forwards',
  'slide-in-left':  'slideInLeft 0.25s ease forwards',
  'slide-in-up':    'slideInUp 0.25s ease forwards',
  'shimmer':        'shimmer 1.6s ease-in-out infinite',
  'spin-slow':      'spinSlow 0.8s linear infinite',
  'pulse-soft':     'pulseSoft 2s ease-in-out infinite',
  'bounce-in':      'bounceIn 0.4s ease forwards',
  'border-pulse':   'borderPulse 1.5s ease-in-out infinite',
  'progress-slide': 'progressSlide 1.4s ease-in-out infinite',
}

/* ─── Config ─────────────────────────────────────────────────── */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],

  darkMode: 'class',

  theme: {
    extend: {

      /* ─── Cores ───────────────────────────────────────────── */
      colors: {
        ...palette,
        fiscal: {
          light: palette.success[50],   // #f0fdf4
          mid:   palette.success[200],  // #bbf7d0
          base:  palette.success[600],  // #16a34a
          dark:  palette.success[950],  // #052e16
        },
      },

      /* ─── Tipografia ──────────────────────────────────────── */
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
        danfe: ['Inter', 'Arial Narrow', 'sans-serif'],
      },

      fontSize: {
        'danfe-xs':   ['7pt',  { lineHeight: '1.2' }],
        'danfe-sm':   ['8pt',  { lineHeight: '1.3' }],
        'danfe-md':   ['9pt',  { lineHeight: '1.4' }],
        'danfe-lg':   ['10pt', { lineHeight: '1.4' }],
        'thermal-xs': ['8px',  { lineHeight: '1.2' }],
        'thermal-sm': ['10px', { lineHeight: '1.3' }],
        'thermal-md': ['12px', { lineHeight: '1.4' }],
      },

      /* ─── Espaçamentos ────────────────────────────────────── */
      spacing: {
        '4.5':   '1.125rem',
        '13':    '3.25rem',
        '15':    '3.75rem',
        '18':    '4.5rem',
        '88':    '22rem',
        '112':   '28rem',
        '128':   '32rem',
        thermal: '80mm',
      },

      /* ─── Border Radius ───────────────────────────────────── */
      borderRadius: {
        xs:      '2px',
        sm:      '4px',
        DEFAULT: '8px',
        md:      '8px',
        lg:      '12px',
        xl:      '16px',
        '2xl':   '20px',
        '3xl':   '24px',
      },

      /* ─── Sombras ─────────────────────────────────────────── */
      boxShadow: {
        card:           '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-md':      '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.05)',
        'card-lg':      '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)',
        upload:         '0 0 0 3px rgba(37, 99, 235, 0.15)',
        'upload-success':'0 0 0 3px rgba(22, 163, 74, 0.15)',
        'upload-error': '0 0 0 3px rgba(220, 38, 38, 0.15)',
        drawer:         '-4px 0 24px rgba(0,0,0,0.12)',
        modal:          '0 20px 60px rgba(0,0,0,0.18)',
        focus:          '0 0 0 3px rgba(37, 99, 235, 0.25)',
      },

      /* ─── Linha / Z-Index ─────────────────────────────────── */
      lineHeight: {
        tighter: '1.1',
        snug:    '1.375',
      },

      zIndex: {
        60: '60', 70: '70', 80: '80', 90: '90', 100: '100',
      },

      /* ─── Transições ──────────────────────────────────────── */
      transitionDuration: {
        150: '150ms', 250: '250ms', 350: '350ms', 400: '400ms',
      },

      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        out:    'cubic-bezier(0, 0, 0.2, 1)',
      },

      /* ─── Largura Máxima ──────────────────────────────────── */
      maxWidth: {
        content: '720px',
        wide:    '1200px',
        full:    '1440px',
        danfe:   '210mm',
        thermal: '80mm',
      },

      /* ─── Animações ───────────────────────────────────────── */
      keyframes,
      animation,

      /* ─── Breakpoints extras ──────────────────────────────── */
      screens: {
        xs:      '375px',
        print:   { raw: 'print' },
        thermal: { raw: 'print and (max-width: 80mm)' },
      },

    },
  },

  plugins: [],
}