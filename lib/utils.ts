import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = 'MYR') {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `BNJ-${timestamp}-${random}`
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function calculateShipping(subtotal: number, state?: string): number {
  // Free shipping over RM150
  if (subtotal >= 150) return 0
  // East Malaysia (Sabah, Sarawak, Labuan)
  const eastMalaysia = ['Sabah', 'Sarawak', 'Labuan', 'WP Labuan']
  if (state && eastMalaysia.includes(state)) return 15
  // West Malaysia standard
  return 8
}
