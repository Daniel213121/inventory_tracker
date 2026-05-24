import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ConditionValue } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const CONDITIONS: ConditionValue[] = ['NEW', 'USED', 'FAULTY']

export const CONDITION_LABEL: Record<string, string> = {
  NEW:    'New',
  USED:   'Used',
  FAULTY: 'Faulty',
}

export function fmtDate(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fmtDateShort(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export function fmtWaybillDate(d: string | Date): string {
  const date  = typeof d === 'string' ? new Date(d) : d
  const day   = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleString('en-GB', { month: 'long' }).toUpperCase()
  const year  = date.getFullYear()
  return `${day} ${month} ${year}`
}
