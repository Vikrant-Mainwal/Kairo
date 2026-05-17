import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'danger' | 'info' | 'warning'
  className?: string
}

const variants = {
  default: 'bg-neutral-800 text-neutral-300 border-neutral-700',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  danger:  'bg-red-500/10 text-red-400 border-red-500/20',
  info:    'bg-kairo-500/10 text-kairo-400 border-kairo-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
