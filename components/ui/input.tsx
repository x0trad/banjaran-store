import * as React from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full border border-stone-200 bg-white px-4 py-2.5 text-sm',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-stone-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:border-stone-400',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'touch-manipulation',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
