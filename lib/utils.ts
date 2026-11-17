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

// ---- Fulfilment: delivery (default) or free self pickup ----
export const PICKUP_LOCATIONS = {
  'pickup-ipoh': 'Ipoh, Perak',
  'pickup-putrajaya': 'Putrajaya',
} as const
export type Fulfilment = 'delivery' | keyof typeof PICKUP_LOCATIONS
export const isPickup = (f: unknown): f is keyof typeof PICKUP_LOCATIONS =>
  typeof f === 'string' && f in PICKUP_LOCATIONS

/** Shape stored in Order.shippingAddress */
export type OrderFulfilment =
  | { method?: 'delivery'; line1: string; line2?: string; city: string; state: string; postcode: string }
  | { method: 'pickup'; pickupLocation: string }
