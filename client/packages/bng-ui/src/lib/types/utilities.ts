import { MarkedBySource } from './types';
import { AVATAR_COLORS } from './constants';

export function formatMarkedByLabel(markedBy: MarkedBySource): string {
  switch (markedBy) {
    case 'Player':
      return 'You';
    case 'Host':
      return 'Host';
    case 'Api':
      return 'Auto';
    default:
      return '';
  }
}

export function formatRelativeTime(isoTimestamp: string): string {
  const elapsedMs = Date.now() - new Date(isoTimestamp).getTime();
  const elapsedMinutes = Math.floor(elapsedMs / 60_000);
  if (elapsedMinutes < 1) {
    return 'Just now';
  }
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m ago`;
  }
  return `${Math.floor(elapsedMinutes / 60)}h ago`;
}

export function getAvatarColor(displayName: string): string {
  const sum = displayName.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

const INITIALS_LENGTH = 2;

export function getAvatarInitials(displayName: string): string {
  return displayName.substring(0, INITIALS_LENGTH).toUpperCase();
}
