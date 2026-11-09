'use client'
import * as React from 'react'
import { cn } from '@/lib/cn'
import { X } from 'lucide-react'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return <>{children}</>
}

export function SheetOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] animate-fade-in"
      onClick={onClose}
    />
  )
}

interface SheetContentProps {
  side?: 'left' | 'right' | 'bottom'
  className?: string
  children: React.ReactNode
  onClose: () => void
}

export function SheetContent({ side = 'right', className, children, onClose }: SheetContentProps) {
  const sideClasses = {
    right: 'inset-y-0 right-0 w-full max-w-[85vw] sm:max-w-sm animate-slide-in-right',
    left: 'inset-y-0 left-0 w-[85vw] max-w-sm animate-slide-in-left',
    bottom: 'inset-x-0 bottom-0 max-h-[85vh] animate-slide-up rounded-t-2xl',
  }

  return (
    <>
      <SheetOverlay onClose={onClose} />
      <div
        className={cn(
          'fixed z-50 bg-white shadow-xl flex flex-col',
          sideClasses[side],
          className
        )}
      >
        {children}
      </div>
    </>
  )
}

export function SheetHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('flex items-center justify-between px-4 py-3.5 border-b border-stone-100', className)}>
      {children}
    </div>
  )
}

// Allow callers to tint the close button (e.g. on dark backgrounds)
interface SheetCloseProps {
  onClose: () => void
  className?: string
}

export function SheetTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={cn('text-base font-semibold', className)}>{children}</h2>
}

export function SheetClose({ onClose, className }: SheetCloseProps) {
  return (
    <button
      onClick={onClose}
      aria-label="Close"
      className={cn(
        'p-1.5 -mr-1 text-stone-400 hover:text-stone-900 active:bg-stone-100 rounded-full touch-manipulation',
        className
      )}
    >
      <X className="w-5 h-5" aria-hidden="true" />
    </button>
  )
}
