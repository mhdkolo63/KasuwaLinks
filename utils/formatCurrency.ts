import { APP_CONFIG } from '@/constants/config';

export function formatCurrency(amount: number, currency: string = APP_CONFIG.currency.code): string {
  const formatter = new Intl.NumberFormat(APP_CONFIG.currency.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  try {
    return formatter.format(amount);
  } catch {
    return `${APP_CONFIG.currency.symbol}${amount.toLocaleString()}`;
  }
}

export function formatPrice(amount: number, currency?: string): string {
  return formatCurrency(amount, currency);
}

export function formatCompactPrice(amount: number): string {
  if (amount >= 1_000_000) {
    return `${APP_CONFIG.currency.symbol}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${APP_CONFIG.currency.symbol}${(amount / 1_000).toFixed(1)}K`;
  }
  return `${APP_CONFIG.currency.symbol}${amount}`;
}
