import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ID generation utilities
let zoneSeq = 100 // Start from 100 for demo data offset
let tradeSeq = 100

export function generateZoneId(): string {
  zoneSeq++
  return 'ZB' + String(zoneSeq).padStart(9, '0')
}

export function generateTradeId(): string {
  tradeSeq++
  return 'TJ' + String(tradeSeq).padStart(9, '0')
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

// Formatting utilities
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}
