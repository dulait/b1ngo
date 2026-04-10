import { AVATAR_COLORS } from './constants';

const ISO_DURATION_RE = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;

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

export function formatDuration(iso: string, prefix = ''): string {
  const match = ISO_DURATION_RE.exec(iso);
  if (!match) {
    return iso;
  }

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  const ss = seconds.toString().padStart(2, '0');

  if (hours > 0) {
    const mm = minutes.toString().padStart(2, '0');
    return `${prefix}${hours}:${mm}:${ss}`;
  }

  return `${prefix}${minutes}:${ss}`;
}

export function getAvatarColor(displayName: string): string {
  const sum = displayName.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

const INITIALS_LENGTH = 2;

export function getAvatarInitials(displayName: string): string {
  return displayName.substring(0, INITIALS_LENGTH).toUpperCase();
}
