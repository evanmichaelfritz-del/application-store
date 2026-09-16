export const colors = {
  bg: '#fdfdfd',
  text: '#0d0d0d',
  textMuted: '#6c6c6c',
  textSubtle: '#767676',
  textFaint: '#8f8f8f',
  card: '#ffffff',
  cardBorder: 'rgba(0, 0, 0, 0.06)',
  stage: '#f9f9f9',
  stageBorder: 'rgba(0, 0, 0, 0.04)',
  chip: '#ffffff',
  chipActive: '#f1f1f1',
  chipText: 'rgba(38, 38, 38, 0.8)',
  chipTextActive: '#080808',
  animateBg: 'rgba(243, 243, 243, 0.94)',
  animateText: '#17181c',
  copyBg: 'rgba(255, 255, 255, 0.94)',
  material: '#ffffff',
  skeleton: '#eeeeef',
  muted: '#5e6073',
  icon: '#0d0d0d',
  pro: '#0d0d0d',
  proFg: '#ffffff',
  danger: '#c43a31',
  success: '#1f8a4c',
  accent: '#17181c',
} as const;

export const radii = {
  card: 16,
  stage: 14,
  pill: 48,
  control: 10,
  material: 12,
} as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
} as const;

export const shadows = {
  card: {
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  material: {
    boxShadow: '0 4px 42px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.05)',
  },
  toast: {
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
} as const;
