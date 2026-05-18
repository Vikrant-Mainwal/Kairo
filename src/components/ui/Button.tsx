import { type ReactNode, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  loading?: boolean
}

const variants = {
  primary:   'bg-kairo-600 hover:bg-kairo-500 text-white border-transparent shadow-lg shadow-kairo-500/20',
  secondary: 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700',
  ghost:     'bg-transparent hover:bg-neutral-800/60 text-neutral-400 hover:text-neutral-200 border-transparent',
  danger:    'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-md',
  lg: 'px-5 py-2.5 text-md',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  children,
  loading,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border font-medium',
        'transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-kairo-400 active:scale-[0.97]',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
