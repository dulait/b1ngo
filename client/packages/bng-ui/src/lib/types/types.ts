export type MarkedBySource = 'Player' | 'Host' | 'Api' | null;

export interface SquareData {
  row: number;
  column: number;
  displayText: string;
  isFreeSpace: boolean;
  isMarked: boolean;
  markedBy: MarkedBySource;
  markedAt?: string | null;
}

export interface PlayerDto {
  playerId: string;
  displayName: string;
}

export interface LeaderboardEntryDto {
  rank: number;
  playerId: string;
  pattern: string;
  completedAt: string;
}

export interface SessionDto {
  grandPrixShort: string;
  sessionType: string;
}

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
