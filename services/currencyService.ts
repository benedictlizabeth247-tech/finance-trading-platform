export type CurrencyCode = 'USD' | 'NGN'

export interface FxRate {
  from: CurrencyCode
  to: CurrencyCode
  rate: number
  inverse: number
  timestamp: number
  source: string
}

export const convertCurrency = (amount: number, rate: number) => {
  if (!Number.isFinite(amount) || !Number.isFinite(rate) || rate <= 0) return null
  return Math.round(amount * rate * 100) / 100
}

export const formatCurrency = (amount: number | null | undefined, currency: CurrencyCode) => {
  if (amount == null || !Number.isFinite(amount)) return '—'
  return new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount)
}

export async function getFxRate(from: CurrencyCode, to: CurrencyCode): Promise<FxRate | null> {
  try {
    const response = await fetch(`/api/market/fx?from=${from}&to=${to}`, { cache: 'no-store' })
    if (!response.ok) return null
    return await response.json() as FxRate
  } catch {
    return null
  }
}
