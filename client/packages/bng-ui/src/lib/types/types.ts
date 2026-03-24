export interface GridCellData {
  row: number;
  column: number;
  displayText: string;
  isFreeSpace: boolean;
  isMarked: boolean;
  markedByLabel: string | null;
  markedByVariant: 'self' | 'other' | null;
  markedAt: string | null;
}

export interface PlayerChipItem {
  id: string;
  displayName: string;
  isHost: boolean;
  isCurrentUser: boolean;
}

export interface LeaderboardItem {
  rank: number;
  displayName: string;
  badge: string;
  timestamp: string;
  isCurrentUser: boolean;
}

export type BadgeVariant = 'warning' | 'success' | 'neutral';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  dismissing: boolean;
}

export type ThemeName = 'crimson' | 'ocean' | 'citrus' | 'midnight' | 'emerald' | 'silver' | 'teal' | 'coral' | 'fuchsia' | 'lime';

export interface ThemeDefinition {
  name: ThemeName;
  label: string;
  accent: string;
}
