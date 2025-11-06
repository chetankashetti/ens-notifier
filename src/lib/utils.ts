import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getAddress, isAddress } from 'viem'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeAddress(address: string): string | null {
  if (!address) return null
  const trimmed = address.trim()
  if (!isAddress(trimmed)) return null
  return getAddress(trimmed)
}
