import { MarkedBySource } from '@core/api/models/types';

const LABELS: Record<MarkedBySource, string> = {
  Player: 'You',
  Host: 'Host',
  Api: 'Auto',
};

const VARIANTS: Record<MarkedBySource, 'self' | 'other'> = {
  Player: 'self',
  Host: 'other',
  Api: 'other',
};

export function formatMarkedByLabel(markedBy: MarkedBySource | null): string | null {
  return markedBy ? LABELS[markedBy] : null;
}

export function markedByVariant(markedBy: MarkedBySource | null): 'self' | 'other' | null {
  return markedBy ? VARIANTS[markedBy] : null;
}
