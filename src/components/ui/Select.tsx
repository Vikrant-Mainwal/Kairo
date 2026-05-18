import { type SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export function Select({ label, id, className, children, ...props }: SelectProps) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <label htmlFor={id} className="text-sm text-neutral-500 whitespace-nowrap">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          'bg-neutral-900 border border-neutral-700 text-neutral-200 text-sm',
          'rounded-lg px-2.5 py-1.5 pr-7 appearance-none cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-kairo-500/50 focus:border-kairo-500/50',
          'transition-colors hover:border-neutral-600',
          className
        )}
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center', backgroundSize: '16px' }}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
