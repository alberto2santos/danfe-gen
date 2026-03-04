import { Spinner } from './Spinner'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:    ButtonVariant
  size?:       ButtonSize
  loading?:    boolean
  leftIcon?:   React.ReactNode
  rightIcon?:  React.ReactNode
  children:    React.ReactNode
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:   'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-sm dark:bg-brand-600 dark:hover:bg-brand-500',
  secondary: 'bg-white hover:bg-surface-50 active:bg-surface-100 text-surface-700 border border-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 dark:text-surface-200 dark:border-surface-700',
  ghost:     'hover:bg-surface-100 active:bg-surface-200 text-surface-600 dark:hover:bg-surface-800 dark:text-surface-400',
  danger:    'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-sm rounded-xl gap-2',
}

export function Button({
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-colors duration-150
        disabled:opacity-60 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2
        ${VARIANTS[variant]} ${SIZES[size]} ${className}
      `}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : leftIcon ? (
        <span aria-hidden="true">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && !loading && (
        <span aria-hidden="true">{rightIcon}</span>
      )}
    </button>
  )
}