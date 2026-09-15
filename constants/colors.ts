export const colors = {
  primary: '#0F766E',
  primaryDark: '#134E4A',
  primaryLight: '#14B8A6',
  primarySoft: '#CCFBF1',

  accent: '#F59E0B',
  accentLight: '#FBBF24',
  accentSoft: '#FEF3C7',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',

  border: '#E2E8F0',
  borderDark: '#CBD5E1',

  white: '#FFFFFF',
  black: '#0F172A',

  error: '#DC2626',
  errorSoft: '#FEE2E2',

  success: '#16A34A',
  successSoft: '#DCFCE7',

  warning: '#F59E0B',
  warningSoft: '#FEF3C7',

  overlay: 'rgba(15, 23, 42, 0.5)',

  shadow: 'rgba(15, 23, 42, 0.08)',
  shadowDark: 'rgba(15, 23, 42, 0.16)',
} as const;

export type ColorKey = keyof typeof colors;
