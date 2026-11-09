import * as React from 'react'
import { cn } from '@/lib/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const buttonVariants = {
  default: 'bg-stone-900 text-white hover:bg-stone-800 active:bg-stone-950',
  outline: 'border border-stone-200 bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-900',
  ghost: 'hover:bg-stone-100 active:bg-stone-200 text-stone-700',
  secondary: 'bg-stone-100 text-stone-900 hover:bg-stone-200',
  destructive: 'bg-red-500 text-white hover:bg-red-600',
  link: 'text-banjaran-700 underline-offset-4 hover:underline',
}

const buttonSizes = {
  default: 'h-11 px-5 py-2.5 text-sm',
  sm: 'h-9 px-3.5 text-xs',
  lg: 'h-12 px-8 text-base',
  icon: 'h-10 w-10',
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'touch-manipulation select-none',
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
