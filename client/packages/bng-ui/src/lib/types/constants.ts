import { ThemeDefinition } from './types';

export const THEMES: ThemeDefinition[] = [
  { name: 'crimson', label: 'Crimson', accent: '#DC2626' },
  { name: 'ocean', label: 'Ocean', accent: '#2563EB' },
  { name: 'citrus', label: 'Citrus', accent: '#CA8A04' },
  { name: 'midnight', label: 'Midnight', accent: '#6366F1' },
];

export const AVATAR_COLORS = [
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#06B6D4',
  '#3B82F6',
] as const;

export const FREE_SPACE_LABEL = 'FREE';
